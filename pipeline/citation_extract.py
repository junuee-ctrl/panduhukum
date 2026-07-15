# -*- coding: utf-8 -*-
"""citation_extract.py — Gerbang 1a: menarik kutipan peraturan dari teks (v0.2)."""
import re

ALIAS_MAP = {
    "uu pdp": "UU 27/2022",
    "uu perlindungan data pribadi": "UU 27/2022",
    "uu ite": "UU 1/2024",
    "uu p2sk": "UU 4/2023",
    "uu perlindungan konsumen": "UU 8/1999",
    "uu ojk": "UU 21/2011",
    "uu ham": "UU 39/1999",
    "pojk slik": "POJK 18/2017",
    "pojk lpbbti": "POJK 10/2022",
    "pojk perlindungan konsumen": "POJK 22/2023",
}

_LAW_PATTERNS = [
    (r"\bUU\s+(?:Nomor\s+)?(\d+)\s*(?:/|Tahun\s+)\s*(\d{4})\b", "UU {0}/{1}"),
    (r"\bPOJK\s+(\d+)\s*/(?:POJK\.\d+/)?\s*(\d{4})\b", "POJK {0}/{1}"),
    (r"\bSEOJK\s+(\d+)\s*/(?:SEOJK\.\d+/)?\s*(\d{4})\b", "SEOJK {0}/{1}"),
    (r"\bPP\s+(?:Nomor\s+)?(\d+)\s*(?:/|Tahun\s+)\s*(\d{4})\b", "PP {0}/{1}"),
    (r"\bPerpres\s+(?:Nomor\s+)?(\d+)\s*(?:/|Tahun\s+)\s*(\d{4})\b", "Perpres {0}/{1}"),
    (r"\bPermen\w*\s+(?:Nomor\s+)?(\d+)\s*(?:/|Tahun\s+)\s*(\d{4})\b", "Permen {0}/{1}"),
]

_PASAL = re.compile(r"Pasal\s+\d+(?:\s+ayat\s+\(\d+\))?", re.IGNORECASE)
_VERIFY_MARKER = re.compile(r"\[PERLU_VERIFIKASI:[^\]]*\]", re.IGNORECASE)


def _canonical(ref):
    return ALIAS_MAP.get(ref.strip().lower(), ref.strip())


def extract(text):
    found, seen = [], set()
    for m in _VERIFY_MARKER.finditer(text):
        found.append({"ref": "PERLU_VERIFIKASI", "pasal": None, "context": m.group(0)})
    for pattern, tmpl in _LAW_PATTERNS:
        for m in re.finditer(pattern, text, re.IGNORECASE):
            ref = _canonical(tmpl.format(*m.groups()))
            tail = text[m.end(): m.end() + 60]
            pasal_m = _PASAL.search(tail)
            pasal = None
            if pasal_m and pasal_m.start() < 40:
                pasal = re.sub(r"\s+", " ", pasal_m.group(0)).title().replace("Ayat", "ayat")
            key = (ref, pasal)
            if key in seen:
                continue
            seen.add(key)
            ctx = text[max(0, m.start() - 20): m.end() + 40].replace("\n", " ")
            found.append({"ref": ref, "pasal": pasal, "context": ctx.strip()})
    return found


if __name__ == "__main__":
    s = "POJK 22/2023 Pasal 62 dan UU PDP dan [PERLU_VERIFIKASI: x]. SEOJK 19/2023."
    for c in extract(s):
        print(c)
