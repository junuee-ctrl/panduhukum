# -*- coding: utf-8 -*-
"""generate_draft.py — Claude API draft + 3-layer gate (v0.3).

Gate:
  1 citation_verify  — eksistensi kutipan ke registry/sumber resmi
  2 legal_review     — tinjauan penerapan hukum (model terpisah); tak tersedia -> WARN
  3 (sesudah) tinjauan advokat — retroaktif via frontmatter reviewer

Signal:
  🟢 green  — layer 1&2 bersih -> published: true (boleh auto-publish)
  🟡 yellow — ada WARN / kutipan belum terverifikasi -> published: false (antre tinjauan)

Dipakai standalone (CLI) atau via run_daily.py (fungsi generate_article).
"""
import argparse
import json
import sys
import time
from datetime import date
from pathlib import Path


def create_with_retry(client, **kwargs):
    """Panggil Claude API dengan backoff eksponensial untuk error transien (rate limit/overload)."""
    delay = 3
    for i in range(5):
        try:
            return client.messages.create(**kwargs)
        except Exception:
            if i == 4:
                raise
            time.sleep(delay)
            delay = min(delay * 2, 30)

from citation_extract import extract
from citation_verify import verify, summarize
import legal_review

MODELS = {"haiku": "claude-haiku-4-5-20251001", "sonnet": "claude-sonnet-5"}

SYSTEM_PROMPT = """\
Kamu adalah penulis konten hukum konsumen Indonesia untuk pembaca awam.

STRUKTUR WAJIB (template 5 langkah):
[RINGKASAN] 3 kalimat jawaban langsung
## STEP 1 — Diagnosis Situasi
## STEP 2 — Hak Anda (dasar hukum diringkas, bahasa awam)
## STEP 3 — Ke Mana & Kapan (instansi, kanal, tenggat — pakai tabel)
## STEP 4 — Dokumen & Bukti yang Disiapkan
## STEP 5 — Jebakan yang Harus Dihindari
## FAQ (3-5 tanya-jawab pendek; tiap pertanyaan diawali '### ')
## Dasar Hukum (daftar peraturan yang dikutip)

ATURAN KUTIPAN HUKUM (SANGAT PENTING):
1. HANYA kutip peraturan yang kamu YAKIN 100% ada DAN MASIH BERLAKU (nama, nomor, tahun tepat).
2. Utamakan peraturan terbaru: POJK 22/2023 (perlindungan konsumen/penagihan), SEOJK 19/2023
   (bunga/denda), UU 27/2022 (PDP), UU 39/1999 (HAM), POJK 18/2017 jo POJK 11/2024 (SLIK),
   UU 42/1999 (fidusia). JANGAN kutip aturan lama yang sudah dicabut.
3. Jika tidak yakin nomor pasal / angka / tarif -> tulis marker [PERLU_VERIFIKASI: deskripsi].
   JANGAN mengarang nomor pasal atau angka.
4. Format kutipan: "UU 27/2022", "POJK 22/2023 Pasal 62".

ATURAN KONTEN (kepatuhan kebijakan iklan):
- DILARANG menyarankan: tidak membayar utang, kabur dari penagih, trik menghindari kewajiban.
  Frame selalu: hak hukum + prosedur resmi + solusi legal (restrukturisasi).
- Sertakan keseimbangan: kewajiban melunasi pokok pinjaman tetap ada.
- Bahasa Indonesia sehari-hari, kalimat pendek. Panjang 900-1300 kata.
"""

CITE_RETRY = """\

[NOT_FOUND] Kutipan berikut TIDAK DITEMUKAN di database peraturan resmi:
{failed}
Tulis ulang artikel TANPA kutipan tersebut. JANGAN menebak/membuat kutipan pengganti.
Jika dasar hukum tidak pasti, gunakan marker [PERLU_VERIFIKASI: ...].
"""

REVIEW_RETRY = """\

[REVIEW_BLOCKER] Reviewer hukum menemukan kesalahan penerapan berikut:
{issues}
Tulis ulang artikel dengan memperbaiki SEMUA poin di atas. Jangan ubah struktur 5 langkah.
"""


def generate(client, model, keyword, feedback=""):
    resp = create_with_retry(
        client, model=model, max_tokens=4000, system=SYSTEM_PROMPT,
        messages=[{"role": "user",
                   "content": f'Tulis artikel untuk target keyword: "{keyword}"' + feedback}],
    )
    return "".join(b.text for b in resp.content if getattr(b, "type", None) == "text")


def to_mdx(slug, keyword, body, verified_results, queue, warns):
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
        "queue": queue, "review_flags": warns,
        "reviewer": None, "reviewed_at": None,
        "changelog": [{"date": str(date.today()),
                       "note": f"Draft otomatis — gate 1·2 ({queue})"}],
        "published": queue == "green",
    }
    return "---\n" + json.dumps(fm, ensure_ascii=False, indent=2) + "\n---\n\n" + body


def generate_article(client, keyword, slug, outdir, model=None, mock=False, attempts=3):
    """Kembalikan dict: {status: 'green'|'yellow'|'fail', path, warns}."""
    model = model or MODELS["haiku"]
    feedback = ""
    for attempt in range(1, attempts + 1):
        print(f"  [{attempt}/{attempts}] generate ({model}) :: {slug}", file=sys.stderr)
        body = generate(client, model, keyword, feedback) if not mock else _MOCK_BODY
        results = verify(extract(body), mock=mock)
        s = summarize(results)
        print(f"    L1 citations: {s['counts']}", file=sys.stderr)
        if s["blocking"]:
            failed = "\n".join(f"- {b['ref']} {b.get('pasal') or ''}" for b in s["blocking"])
            feedback = CITE_RETRY.format(failed=failed)
            continue
        rv = legal_review.review(client, body, mock=mock)
        blockers, warns = legal_review.split_issues(rv)
        print(f"    L2 review: {rv['verdict']} (BLOCKER {len(blockers)} / WARN {len(warns)})",
              file=sys.stderr)
        if blockers:
            issues = "\n".join(f"- [{b['type']}] {b['location']}: {b['description']}"
                               for b in blockers)
            feedback = REVIEW_RETRY.format(issues=issues)
            continue
        # Auto-publish dipulihkan (permintaan pemilik): artikel yang lolos gerbang 1&2 terbit
        # otomatis (published:true) dengan notis "belum diverifikasi advokat" hingga reviewer diisi.
        queue = "green" if (not warns and not s["needs_human_review"]) else "yellow"
        outdir_p = Path(outdir); outdir_p.mkdir(parents=True, exist_ok=True)
        path = outdir_p / f"{slug}.mdx"
        path.write_text(to_mdx(slug, keyword, body, results, queue, warns), encoding="utf-8")
        return {"status": queue, "path": str(path), "warns": warns,
                "needs_human": s["needs_human_review"]}
    return {"status": "fail", "path": None, "warns": [], "needs_human": []}


_MOCK_BODY = (
    "[RINGKASAN] Ringkasan singkat.\n\n## STEP 1 — Diagnosis Situasi\nIsi. POJK 22/2023 Pasal 62.\n"
    "## STEP 2 — Hak Anda\nUU 27/2022.\n## FAQ\n### Apa ini?\nJawab.\n## Dasar Hukum\n- POJK 22/2023"
)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--keyword", required=True)
    ap.add_argument("--slug", required=True)
    ap.add_argument("--sonnet", action="store_true")
    ap.add_argument("--mock-verify", action="store_true")
    ap.add_argument("--outdir", default="drafts")
    args = ap.parse_args()
    client = None if args.mock_verify else __import__("anthropic").Anthropic()
    model = MODELS["sonnet" if args.sonnet else "haiku"]
    res = generate_article(client, args.keyword, args.slug, args.outdir,
                           model=model, mock=args.mock_verify)
    if res["status"] == "fail":
        print("✗ gagal setelah retry", file=sys.stderr); sys.exit(1)
    print(f"저장: {res['path']} · {res['status']}")
    sys.exit(0 if res["status"] == "green" else 78)


if __name__ == "__main__":
    main()
# -*- coding: utf-8 -*-
"""generate_draft.py — Claude API draft + 3-layer gate (v0.3).

Gate:
  1 citation_verify  — eksistensi kutipan ke registry/sumber resmi
  2 legal_review     — tinjauan penerapan hukum (model terpisah); tak tersedia -> WARN
  3 (sesudah) tinjauan advokat — retroaktif via frontmatter reviewer

Signal:
  🟢 green  — layer 1&2 bersih -> published: true (boleh auto-publish)
  🟡 yellow — ada WARN / kutipan belum terverifikasi -> published: false (antre tinjauan)

Dipakai standalone (CLI) atau via run_daily.py (fungsi generate_article).
"""
import argparse
import json
import sys
import time
from datetime import date
from pathlib import Path


def create_with_retry(client, **kwargs):
    """Panggil Claude API dengan backoff eksponensial untuk error transien (rate limit/overload)."""
    delay = 3
    for i in range(5):
        try:
            return client.messages.create(**kwargs)
        except Exception:
            if i == 4:
                raise
            time.sleep(delay)
            delay = min(delay * 2, 30)

from citation_extract import extract
from citation_verify import verify, summarize
import legal_review

MODELS = {"haiku": "claude-haiku-4-5-20251001", "sonnet": "claude-sonnet-5"}

SYSTEM_PROMPT = """\
Kamu adalah penulis konten hukum konsumen Indonesia untuk pembaca awam.

STRUKTUR WAJIB (template 5 langkah):
[RINGKASAN] 3 kalimat jawaban langsung
## STEP 1 — Diagnosis Situasi
## STEP 2 — Hak Anda (dasar hukum diringkas, bahasa awam)
## STEP 3 — Ke Mana & Kapan (instansi, kanal, tenggat — pakai tabel)
## STEP 4 — Dokumen & Bukti yang Disiapkan
## STEP 5 — Jebakan yang Harus Dihindari
## FAQ (3-5 tanya-jawab pendek; tiap pertanyaan diawali '### ')
## Dasar Hukum (daftar peraturan yang dikutip)

ATURAN KUTIPAN HUKUM (SANGAT PENTING):
1. HANYA kutip peraturan yang kamu YAKIN 100% ada DAN MASIH BERLAKU (nama, nomor, tahun tepat).
2. Utamakan peraturan terbaru: POJK 22/2023 (perlindungan konsumen/penagihan), SEOJK 19/2023
   (bunga/denda), UU 27/2022 (PDP), UU 39/1999 (HAM), POJK 18/2017 jo POJK 11/2024 (SLIK),
   UU 42/1999 (fidusia). JANGAN kutip aturan lama yang sudah dicabut.
3. Jika tidak yakin nomor pasal / angka / tarif -> tulis marker [PERLU_VERIFIKASI: deskripsi].
   JANGAN mengarang nomor pasal atau angka.
4. Format kutipan: "UU 27/2022", "POJK 22/2023 Pasal 62".

ATURAN KONTEN (kepatuhan kebijakan iklan):
- DILARANG menyarankan: tidak membayar utang, kabur dari penagih, trik menghindari kewajiban.
  Frame selalu: hak hukum + prosedur resmi + solusi legal (restrukturisasi).
- Sertakan keseimbangan: kewajiban melunasi pokok pinjaman tetap ada.
- Bahasa Indonesia sehari-hari, kalimat pendek. Panjang 900-1300 kata.
"""

CITE_RETRY = """\

[NOT_FOUND] Kutipan berikut TIDAK DITEMUKAN di database peraturan resmi:
{failed}
Tulis ulang artikel TANPA kutipan tersebut. JANGAN menebak/membuat kutipan pengganti.
Jika dasar hukum tidak pasti, gunakan marker [PERLU_VERIFIKASI: ...].
"""

REVIEW_RETRY = """\

[REVIEW_BLOCKER] Reviewer hukum menemukan kesalahan penerapan berikut:
{issues}
Tulis ulang artikel dengan memperbaiki SEMUA poin di atas. Jangan ubah struktur 5 langkah.
"""


def generate(client, model, keyword, feedback=""):
    resp = create_with_retry(
        client, model=model, max_tokens=4000, system=SYSTEM_PROMPT,
        messages=[{"role": "user",
                   "content": f'Tulis artikel untuk target keyword: "{keyword}"' + feedback}],
    )
    return "".join(b.text for b in resp.content if getattr(b, "type", None) == "text")


def to_mdx(slug, keyword, body, verified_results, queue, warns):
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
        "queue": queue, "review_flags": warns,
        "reviewer": None, "reviewed_at": None,
        "changelog": [{"date": str(date.today()),
                       "note": f"Draft otomatis — gate 1·2 ({queue})"}],
        "published": queue == "green",
    }
    return "---\n" + json.dumps(fm, ensure_ascii=False, indent=2) + "\n---\n\n" + body


def generate_article(client, keyword, slug, outdir, model=None, mock=False, attempts=3):
    """Kembalikan dict: {status: 'green'|'yellow'|'fail', path, warns}."""
    model = model or MODELS["haiku"]
    feedback = ""
    for attempt in range(1, attempts + 1):
        print(f"  [{attempt}/{attempts}] generate ({model}) :: {slug}", file=sys.stderr)
        body = generate(client, model, keyword, feedback) if not mock else _MOCK_BODY
        results = verify(extract(body), mock=mock)
        s = summarize(results)
        print(f"    L1 citations: {s['counts']}", file=sys.stderr)
        if s["blocking"]:
            failed = "\n".join(f"- {b['ref']} {b.get('pasal') or ''}" for b in s["blocking"])
            feedback = CITE_RETRY.format(failed=failed)
            continue
        rv = legal_review.review(client, body, mock=mock)
        blockers, warns = legal_review.split_issues(rv)
        print(f"    L2 review: {rv['verdict']} (BLOCKER {len(blockers)} / WARN {len(warns)})",
              file=sys.stderr)
        if blockers:
            issues = "\n".join(f"- [{b['type']}] {b['location']}: {b['description']}"
                               for b in blockers)
            feedback = REVIEW_RETRY.format(issues=issues)
            continue
        # KEBIJAKAN: bot TIDAK PERNAH auto-publish (situs hukum). Semua -> draft tinjauan manusia.
        queue = "yellow"  # dulu: "green" jika bersih. Kini selalu draft; publikasi butuh verifikasi manusia.
        outdir_p = Path(outdir); outdir_p.mkdir(parents=True, exist_ok=True)
        path = outdir_p / f"{slug}.mdx"
        path.write_text(to_mdx(slug, keyword, body, results, queue, warns), encoding="utf-8")
        return {"status": queue, "path": str(path), "warns": warns,
                "needs_human": s["needs_human_review"]}
    return {"status": "fail", "path": None, "warns": [], "needs_human": []}


_MOCK_BODY = (
    "[RINGKASAN] Ringkasan singkat.\n\n## STEP 1 — Diagnosis Situasi\nIsi. POJK 22/2023 Pasal 62.\n"
    "## STEP 2 — Hak Anda\nUU 27/2022.\n## FAQ\n### Apa ini?\nJawab.\n## Dasar Hukum\n- POJK 22/2023"
)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--keyword", required=True)
    ap.add_argument("--slug", required=True)
    ap.add_argument("--sonnet", action="store_true")
    ap.add_argument("--mock-verify", action="store_true")
    ap.add_argument("--outdir", default="drafts")
    args = ap.parse_args()
    client = None if args.mock_verify else __import__("anthropic").Anthropic()
    model = MODELS["sonnet" if args.sonnet else "haiku"]
    res = generate_article(client, args.keyword, args.slug, args.outdir,
                           model=model, mock=args.mock_verify)
    if res["status"] == "fail":
        print("✗ gagal setelah retry", file=sys.stderr); sys.exit(1)
    print(f"저장: {res['path']} · {res['status']}")
    sys.exit(0 if res["status"] == "green" else 78)


if __name__ == "__main__":
    main()
