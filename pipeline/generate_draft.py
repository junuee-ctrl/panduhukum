# -*- coding: utf-8 -*-
"""
generate_draft.py — Claude API 초안 생성 + 3층 게이트 (v0.2)

게이트 구조:
  1층 citation_verify  — 인용 실존 검증 (기계적) → 실패 시 [NOT_FOUND] 재생성
  2층 legal_review     — AI 법리 검토 (sonnet, 생성자와 분리) → BLOCKER 시 재생성
  3층 (사후) 변호사 검수 — 발행 후 소급, frontmatter reviewer 서명

신호등:
  🟢 green  — 1·2층 클린 → 자동 발행 대상 (published: true 가능)
  🟡 yellow — WARN 또는 검수필요(⚠) 존재 → PR 대기열, 사람 확인 후 머지

요구: pip install anthropic / 환경변수 ANTHROPIC_API_KEY
모델: 초안 claude-haiku-4-5, 검토 claude-sonnet-4-6
API 문서: https://docs.claude.com/en/api/overview
"""
import argparse
import json
import sys
from datetime import date
from pathlib import Path

import anthropic

from citation_extract import extract
from citation_verify import verify, summarize
import legal_review

MODELS = {"haiku": "claude-haiku-4-5-20251001", "sonnet": "claude-sonnet-4-6"}

SYSTEM_PROMPT = """\
Kamu adalah penulis konten hukum konsumen Indonesia untuk pembaca awam.

STRUKTUR WAJIB (template 5 langkah):
[RINGKASAN] 3 kalimat jawaban langsung
## STEP 1 — Diagnosis Situasi
## STEP 2 — Hak Anda (dasar hukum diringkas, bahasa awam)
## STEP 3 — Ke Mana & Kapan (instansi, kanal, tenggat — pakai tabel)
## STEP 4 — Dokumen & Bukti yang Disiapkan
## STEP 5 — Jebakan yang Harus Dihindari
## FAQ (3-5 tanya-jawab pendek)
## Dasar Hukum (daftar peraturan yang dikutip)

ATURAN KUTIPAN HUKUM (SANGAT PENTING):
1. HANYA kutip peraturan yang kamu YAKIN 100% ada (nama, nomor, tahun tepat).
2. Jika tidak yakin nomor pasal / angka / tarif terbaru → tulis marker:
   [PERLU_VERIFIKASI: deskripsi yang perlu dicek]
   JANGAN mengarang nomor pasal atau angka.
3. Format kutipan: "UU 27/2022", "POJK 22/2023 Pasal 62" (nomor/tahun).

ATURAN KONTEN (kepatuhan kebijakan iklan):
- DILARANG menyarankan: tidak membayar utang, kabur dari penagih, trik menghindari
  kewajiban. Frame selalu: hak hukum + prosedur resmi + solusi legal (restrukturisasi).
- Sertakan keseimbangan: kewajiban melunasi pokok pinjaman tetap ada.
- Bahasa Indonesia sehari-hari, kalimat pendek, tanpa jargon tanpa penjelasan.
- Panjang 900-1300 kata.
"""

CITE_RETRY = """\

[NOT_FOUND] Kutipan berikut TIDAK DITEMUKAN di database peraturan resmi:
{failed}
Tulis ulang artikel TANPA kutipan tersebut. JANGAN menebak atau membuat kutipan
pengganti. Jika dasar hukum tidak pasti, gunakan marker [PERLU_VERIFIKASI: ...].
"""

REVIEW_RETRY = """\

[REVIEW_BLOCKER] Reviewer hukum menemukan kesalahan penerapan berikut:
{issues}
Tulis ulang artikel dengan memperbaiki SEMUA poin di atas. Jangan mengubah
struktur 5 langkah. Jika tidak yakin, gunakan marker [PERLU_VERIFIKASI: ...].
"""


def generate(client, model: str, keyword: str, feedback: str = "") -> str:
    resp = client.messages.create(
        model=model,
        max_tokens=4000,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user",
                   "content": f'Tulis artikel untuk target keyword: "{keyword}"' + feedback}],
    )
    return "".join(b.text for b in resp.content if b.type == "text")


def to_mdx(slug, keyword, body, verified_results, queue, warns) -> str:
    cites = []
    for r in verified_results:
        if r["ref"] in ("UNKNOWN", "PERLU_VERIFIKASI"):
            continue
        cites.append({"ref": r["ref"], "pasal": r.get("pasal"),
                      "verified": r["status"] == "FOUND",
                      "status": r["status"], "verified_at": str(date.today())})
    fm = {
        "slug": slug, "pillar": "pinjol", "type": "action_plan",
        "target_keyword": keyword, "citations": cites,
        "queue": queue,                      # green | yellow
        "review_flags": warns,               # 2층 WARN 목록 (사후검수 참고)
        "reviewer": None, "reviewed_at": None,   # 3층: 변호사 서명 (사후 소급)
        "changelog": [{"date": str(date.today()),
                       "note": f"Draft otomatis — gate 1·2 lolos ({queue})"}],
        "published": queue == "green",       # 🟢만 즉시 발행
    }
    return "---\n" + json.dumps(fm, ensure_ascii=False, indent=2) + "\n---\n\n" + body


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--keyword", required=True)
    ap.add_argument("--slug", required=True)
    ap.add_argument("--sonnet", action="store_true", help="초안도 sonnet으로")
    ap.add_argument("--mock-verify", action="store_true", help="오프라인 (fixtures)")
    ap.add_argument("--outdir", default="drafts")
    args = ap.parse_args()

    client = anthropic.Anthropic()
    model = MODELS["sonnet" if args.sonnet else "haiku"]

    feedback = ""
    for attempt in range(1, 4):
        print(f"[{attempt}/3] 초안 생성 ({model})...", file=sys.stderr)
        body = generate(client, model, args.keyword, feedback)

        # ── 1층: 인용 실존 검증 ──
        results = verify(extract(body), mock=args.mock_verify)
        s = summarize(results)
        print(f"    1층(인용): {s['counts']}", file=sys.stderr)
        if s["blocking"]:
            failed = "\n".join(f"- {b['ref']} {b.get('pasal') or ''}" for b in s["blocking"])
            feedback = CITE_RETRY.format(failed=failed)
            continue

        # ── 2층: AI 법리 검토 (별도 모델) ──
        rv = legal_review.review(client, body, mock=args.mock_verify)
        blockers, warns = legal_review.split_issues(rv)
        print(f"    2층(법리): {rv['verdict']} (BLOCKER {len(blockers)} / WARN {len(warns)})",
              file=sys.stderr)
        if blockers:
            issues = "\n".join(f"- [{b['type']}] {b['location']}: {b['description']}"
                               for b in blockers)
            feedback = REVIEW_RETRY.format(issues=issues)
            continue

        # ── 신호등 판정 ──
        queue = "green" if (not warns and not s["needs_human_review"]) else "yellow"
        outdir = Path(args.outdir); outdir.mkdir(parents=True, exist_ok=True)
        path = outdir / f"{args.slug}.mdx"
        path.write_text(to_mdx(args.slug, args.keyword, body, results, queue, warns),
                        encoding="utf-8")
        print(f"저장: {path} · 신호등: {'🟢 green (자동발행)' if queue == 'green' else '🟡 yellow (대기열)'}")
        for w in warns:
            print(f"  ⚠ [{w['type']}] {w['description']}")
        for h in s["needs_human_review"]:
            print(f"  ⚠ {h.get('context','')[:60]} → {h['status']}")
        # exit 0=green, 78=yellow (워크플로우에서 분기용)
        sys.exit(0 if queue == "green" else 78)

    print("✗ 3회 시도 후에도 차단 잔존 — 수동 작성 필요", file=sys.stderr)
    sys.exit(1)


if __name__ == "__main__":
    main()
