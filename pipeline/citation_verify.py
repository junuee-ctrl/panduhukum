# -*- coding: utf-8 -*-
"""citation_verify.py — Gerbang 1b: verifikasi eksistensi kutipan (v0.2).

Marker PERLU_VERIFIKASI -> UNVERIFIABLE. Kegagalan jaringan -> UNVERIFIABLE
(aman: memicu review manusia, bukan lolos diam-diam). Mode --mock pakai fixtures.
"""
from __future__ import annotations
import re
import time
from urllib.parse import quote

try:
    import requests
except ImportError:  # pragma: no cover
    requests = None

UA = "Mozilla/5.0 (compatible; PanduHukumBot/0.2; +https://panduhukum.com)"
SEARCH_URL = "https://peraturan.bpk.go.id/Search?keywords={q}"

# Peraturan yang SUDAH dikonfirmasi manual ke sumber resmi (JDIH BPK / OJK).
KNOWN_GOOD = {
    "UU 27/2022", "UU 1/2024", "UU 11/2008", "UU 8/1999", "UU 4/2023",
    "UU 21/2011", "UU 39/1999",
    "POJK 22/2023", "SEOJK 19/2023", "POJK 40/2024",
    "POJK 18/2017", "POJK 64/2020", "POJK 11/2024", "POJK 10/2022",
}


def _verify_one_online(ref, session):
    m = re.search(r"(\d+)\s*/\s*(\d{4})", ref)
    if not m:
        return "UNVERIFIABLE"
    nomor, tahun = m.group(1), m.group(2)
    try:
        resp = session.get(SEARCH_URL.format(q=quote(ref)), timeout=20)
        if resp.status_code != 200:
            return "UNVERIFIABLE"
        html = resp.text
        if re.search(r"Nomor\s+%s\s+Tahun\s+%s" % (nomor, tahun), html) or (
            nomor in html and tahun in html and ref.split()[0] in html
        ):
            return "FOUND"
        return "NOT_FOUND"
    except Exception:
        return "UNVERIFIABLE"


def verify(citations, mock=False):
    results = []
    session = None
    if not mock and requests is not None:
        session = requests.Session()
        session.headers.update({"User-Agent": UA})
    for c in citations:
        ref = c.get("ref", "UNKNOWN")
        if ref == "PERLU_VERIFIKASI":
            status = "UNVERIFIABLE"
        elif ref in KNOWN_GOOD:
            status = "FOUND"
        elif mock or session is None:
            status = "UNVERIFIABLE"
        else:
            status = _verify_one_online(ref, session)
            time.sleep(0.5)
        results.append(dict(c, status=status))
    return results


def summarize(results):
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
    res = verify(extract("POJK 22/2023 Pasal 62 dan UU 27/2022. UU 999/2099."), mock=True)
    for r in res:
        print(r["ref"], r.get("pasal"), "->", r["status"])
    print(summarize(res)["counts"])
