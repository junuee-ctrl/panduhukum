# -*- coding: utf-8 -*-
"""
legal_review.py — 게이트 2층: AI 법리 검토 (v0.1)

1층(citation_verify)이 "법령이 실존하는가"를 보면,
2층은 "그 법령을 이 상황에 이렇게 적용하는 게 맞는가"를 본다.

설계 원칙:
- 생성자(haiku)와 검토자(sonnet)를 분리 — 오류 상관관계 완화
- 검토자는 '지적만' 한다 (수정은 생성자가 재작성) — 역할 혼합 방지
- BLOCKER = 재작성 강제 / WARN = 발행은 되나 🟡 대기열 + 리포트 표기
"""
import json
import re

REVIEW_MODEL = "claude-sonnet-5"

REVIEW_PROMPT = """\
Kamu adalah reviewer hukum senior untuk konten hukum konsumen Indonesia.
Tugasmu HANYA menilai — bukan menulis ulang.

Periksa artikel berikut untuk kesalahan PENERAPAN hukum:
1. MISAPPLICATION — peraturan dikutip benar tapi diterapkan pada situasi yang salah
   (contoh: aturan untuk penyelenggara berizin dipakai seolah mengikat pinjol ilegal)
2. OVERGENERALIZATION — klaim terlalu luas ("selalu", "pasti") padahal ada syarat/pengecualian
3. MISSING_EXCEPTION — pengecualian penting yang tidak disebut dan bisa merugikan pembaca
4. WRONG_INSTITUTION — instansi/kanal pelaporan atau kewenangannya salah
5. STALE_RULE — merujuk rezim aturan yang kemungkinan sudah diganti (sebut dugaan penggantinya)
6. UNSAFE_ADVICE — saran yang melanggar frame legal (mendorong tidak bayar utang, menghindari penagihan, dsb.)

Untuk tiap temuan, tentukan severity:
- BLOCKER: pembaca bisa dirugikan secara hukum/finansial jika mengikuti artikel
- WARN: kurang presisi tapi tidak membahayakan

Jawab HANYA dengan JSON valid, tanpa teks lain:
{"verdict": "PASS" | "FAIL",
 "issues": [{"severity": "BLOCKER"|"WARN", "type": "<kategori di atas>",
             "location": "<kutipan singkat bagian bermasalah>",
             "description": "<penjelasan + koreksi yang disarankan>"}]}
verdict = FAIL jika ada minimal satu BLOCKER. Jika tidak ada temuan: {"verdict":"PASS","issues":[]}
"""

MOCK_RESULT = {"verdict": "PASS", "issues": [
    {"severity": "WARN", "type": "STALE_RULE",
     "location": "Batas manfaat ekonomi harian",
     "description": "Pastikan angka merujuk SEOJK turunan POJK 40/2024 terbaru (mock)"},
]}


def _parse_json(text: str) -> dict:
    """모델 출력에서 JSON 추출 (코드펜스/전후 텍스트 방어)."""
    m = re.search(r"\{.*\}", text, re.DOTALL)
    if not m:
        raise ValueError(f"JSON not found in review output: {text[:200]}")
    return json.loads(m.group(0))


def review(client, body: str, mock: bool = False) -> dict:
    if mock:
        return MOCK_RESULT
    resp = client.messages.create(
        model=REVIEW_MODEL,
        max_tokens=2000,
        system=REVIEW_PROMPT,
        messages=[{"role": "user", "content": body}],
    )
    text = "".join(b.text for b in resp.content if b.type == "text")
    result = _parse_json(text)
    # 방어: verdict-issues 정합성 강제
    blockers = [i for i in result.get("issues", []) if i.get("severity") == "BLOCKER"]
    result["verdict"] = "FAIL" if blockers else "PASS"
    return result


def split_issues(result: dict) -> tuple[list, list]:
    issues = result.get("issues", [])
    return ([i for i in issues if i.get("severity") == "BLOCKER"],
            [i for i in issues if i.get("severity") == "WARN"])


if __name__ == "__main__":
    # 오프라인 파서 셀프테스트
    sample = 'blabla ```json\n{"verdict":"FAIL","issues":[{"severity":"BLOCKER","type":"UNSAFE_ADVICE","location":"x","description":"y"}]}\n``` end'
    r = _parse_json(sample)
    b, w = split_issues(r)
    assert r["verdict"] == "FAIL" and len(b) == 1 and len(w) == 0
    print("parser self-test OK")
