# -*- coding: utf-8 -*-
"""
verify_all.py — verifikasi ulang SEMUA kutipan pada konten yang sudah terbit (v0.1)

Dipakai oleh cron bulanan (.github/workflows/reverify-citations.yml):
memindai content/**/*.mdx, memverifikasi ulang tiap kutipan ke sumber resmi,
dan mengembalikan exit != 0 bila ada yang berubah jadi NOT_FOUND
(indikasi peraturan dicabut/diganti → picu Issue otomatis).

Pemakaian:
  python pipeline/verify_all.py            # verifikasi jaringan nyata
  python pipeline/verify_all.py --mock     # offline (fixtures)
"""
from __future__ import annotations
import argparse
import glob
import re
import sys

from citation_verify import verify

FM = re.compile(r"^---\s*\n(.*?)\n---\s*\n", re.DOTALL)
# Ambil ref dari frontmatter (baik YAML `ref: "..."` maupun JSON `"ref": "..."`).
REF = re.compile(r'["\s]ref["\s]*:\s*["\']([^"\']+)["\']')
PASAL = re.compile(r'["\s]pasal["\s]*:\s*["\']([^"\']+)["\']')


def citations_from_file(path: str) -> list[dict]:
    text = open(path, encoding="utf-8").read()
    m = FM.search(text)
    block = m.group(1) if m else text
    refs = REF.findall(block)
    pasals = PASAL.findall(block)
    out = []
    for i, ref in enumerate(refs):
        out.append({"ref": ref, "pasal": pasals[i] if i < len(pasals) else None, "context": path})
    return out


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--mock", action="store_true")
    ap.add_argument("--glob", default="content/**/*.mdx")
    args = ap.parse_args()

    regressions = []
    for path in glob.glob(args.glob, recursive=True):
        cites = citations_from_file(path)
        if not cites:
            continue
        for r in verify(cites, mock=args.mock):
            flag = {"FOUND": "✓", "NOT_FOUND": "✗", "UNVERIFIABLE": "⚠"}[r["status"]]
            print(f"{flag} {path}: {r['ref']} {r.get('pasal') or ''} → {r['status']}")
            if r["status"] == "NOT_FOUND":
                regressions.append((path, r["ref"]))

    if regressions:
        print(f"\n✗ {len(regressions)} kutipan tidak lagi ditemukan — kemungkinan regulasi diganti.")
        return 1
    print("\n✓ Semua kutipan masih terverifikasi.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
