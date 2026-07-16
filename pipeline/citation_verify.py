# -*- coding: utf-8 -*-
"""citation_verify.py — Gerbang 1b: verifikasi eksistensi kutipan (v0.3).

Strategi (spec §5):
1) Registry lokal (reg_registry.json): peraturan yang SUDAH diverifikasi manual ke
   sumber resmi dan MASIH berlaku. Cocok -> FOUND. Cepat, offline, andal di CI.
2) Fallback online best-effort ke peraturan.bpk.go.id untuk ref di luar registry.
   Gagal jaringan / tak yakin -> UNVERIFIABLE (aman: memicu tinjauan manusia, bukan
   lolos diam-diam). Marker PERLU_VERIFIKASI selalu -> UNVERIFIABLE.

Regulasi lama/dicabut sengaja TIDAK ada di registry -> otomatis ke antrean tinjauan,
supaya artikel yang mengutip aturan usang tidak ikut auto-publish.
"""
from __future__ import annotations
import json
import os
import re
import time
from urllib.parse import quote

try:
    import requests
except ImportError:  # pragma: no cover
    requests = None

UA = "Mozilla/5.0 (compatible; PanduHukumBot/0.3; +https://panduhukum.com)"
SEARCH_URL = "https://peraturan.bpk.go.id/Search?keywords={q}"
_REGISTRY_PATH = os.path.join(os.path.dirname(__file__), "reg_registry.json")


def _load_registry() -> set:
    try:
        with open(_REGISTRY_PATH, encoding="utf-8") as f:
            return set(json.load(f).get("regs", {}).keys())
    except Exception:
        return set()


KNOWN_GOOD = _load_registry()


def _verify_one_online(ref, session):
    m = re.search(r"(\d+)\s*/\s*(\d{4})", ref)
    if not m:
        return "UNVERIFIABLE"
    nomor, tahun = m.group(1), m.group(2)
    try:
        resp = session.get(SEARCH_URL.format(q=quote(ref)), timeout=25)
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
    print("registry size:", len(KNOWN_GOOD))
    res = verify(extract("POJK 22/2023 Pasal 62, UU 42/1999, POJK 1/2013. UU 999/2099."), mock=True)
    for r in res:
        print(" ", r["ref"], "->", r["status"])
    print(summarize(res)["counts"])
