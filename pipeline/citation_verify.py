# -*- coding: utf-8 -*-
"""
citation_verify.py — Gerbang 1b: verifikasi eksistensi kutipan (v0.2)

Untuk tiap kutipan hasil extract():
  1) cari peraturan di peraturan.bpk.go.id (best-effort HTML search)
  2) status: FOUND / NOT_FOUND / UNVERIFIABLE
Marker PERLU_VERIFIKASI selalu → UNVERIFIABLE (butuh manusia).

Catatan (spec §5): tuning parser HTML peraturan.bpk.go.id dilakukan sekali
lewat Actions. Mode --mock (fixtures) dipakai untuk uji offline & CI cepat.
Kegagalan jaringan → UNVERIFIABLE (aman: memicu review manusia, bukan lolos diam-diam).
"""
from __future__ import annotations
import re
import time
from urllib.parse import quote

try:
    import requests  # hanya diperlukan untuk mode non-mock
except ImportError:  # pragma: no cover
    requests = None

UA = "Mozilla/5.0 (compatible; PanduHukumBot/0.2; +https://panduhukum.com)"
SEARCH_URL = "https://peraturan.bpk.go.id/Search?keywords={q}"

# Fixtures untuk mode mock/CI (peraturan yang sudah dikonfirmasi manual).
KNOWN_GOOD = {
    "UU 27/2022", "UU 1/2024", "UU 8/1999", "UU 4/2023",
    "POJK 22/2023", "SEOJK 19/2023", "POJK 40/2024",
}


def _verify_one_online(ref: str, session) -> str:
    """Best-effort: cek apakah nomor/tahun peraturan muncul di hasil pencarian resmi."""
    m = re.search(r"(\d+)\s*/\s*(\d{4})", ref)
    if not m:
        return "UNVERIFIABLE"
    nomor, tahun = m.group(1), m.group(2)
    try:
        resp = session.get(SEARCH_URL.format(q=quote(ref)), timeout=20)
        if resp.status_code != 200:
            return "UNVERIFIABLE"
        html = resp.text
        # Heuristik: nomor & tahun muncul berdekatan di hasil.
        if re.search(rf"Nomor\s+{nomor}\s+Tahun\s+{tahun}", html) or (
            nomor in html and tahun in html and ref.split()[0] in html
        ):
            return "FOUND"
        return "NOT_FOUND"
    except Exception:
        return "UNVERIFIABLE"


def verify(citations: list[dict], mock: bool = False) -> list[dict]:
    results: list[dict] = []
    session = None
    if not mock and requests is not None:
        session = requests.Session()
        session.headers.update({"User-Agent": UA})

    for c in citations:
        ref = c.get("ref", "UNKNOWN")
        if ref == "PERLU_VERIFIKASI":
            status = "UNVERIFIABLE"
        elif mock or session is None:
            status = "FOUND" if ref in KNOWN_GOOD else "UNVERIFIABLE"
        else:
            status = "FOUND" if ref in KNOWN_GOOD else _verify_one_online(ref, session)
            time.sleep(0.5)  # sopan terhadap server
        results.append({**c, "status": status})
    return results


def summarize(results: list[dict]) -> dict:
    counts = {"FOUND": 0, "NOT_FOUND": 0, "UNVERIFIABLE": 0}
    blocking, needs_human = [], []
    for r in results:
        counts[r["status"]] = counts.get(r["status"], 0) + 1
        if r["status"] == "NOT_FOUND":
            blocking.append(r)
        elif r["status"] == "UNVERIFIABLE":
            needs_human.append(r)
    return {"counts": counts, "blocking": blocking, "needs_human_review": needs_human}


if __name__ == "__main__":
    from citation_extract import extract

    sample = "POJK 22/2023 Pasal 62 dan UU 27/2022. Aturan fiktif UU 999/2099."
    res = verify(extract(sample), mock=True)
    for r in res:
        print(r["ref"], r.get("pasal"), "→", r["status"])
    print(summarize(res)["counts"])
