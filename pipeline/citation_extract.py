# -*- coding: utf-8 -*-
"""
citation_extract.py — Gerbang 1a: menarik kutipan peraturan dari teks (v0.2)

Meniru teknik korean-law-mcp v3.5:
- regex untuk jenis peraturan Indonesia (UU / POJK / SEOJK / PP / Permen / Perpres)
- "Pasal N" ditautkan ke peraturan terdekat via lookback konteks
- alias map: singkatan populer → nomor resmi (mis. "UU PDP" → UU 27/2022)

Output: list dict {ref, pasal, context} — dikonsumsi citation_verify.verify().
"""
import re

# Peraturan yang sudah dikonfirmasi manual → dipetakan ke nomor resmi.
# WAJIB dicek ulang saat ada revisi (lihat spec §8).
ALIAS_MAP = {
    "uu pdp": "UU 27/2022",
    "uu perlindungan data pribadi": "UU 27/2022",
    "uu ite": "UU 1/2024",
    "uu p2sk": "UU 4/2023",
    "uu perlindungan konsumen": "UU 8/1999",
}

# Pola nomor/tahun peraturan.
_LAW_PATTERNS = [
    # UU 27/2022 | UU Nomor 27 Tahun 2022
    (r"\bUU\s+(?:Nomor\s+)?(\d+)\s*(?:/|Tahun\s+)\s*(\d{4})\b", "UU {0}/{1}"),
    # POJK 22/2023 | POJK 22/POJK.05/2023
    (r"\bPOJK\s+(\d+)\s*/(?:POJK\.\d+/)?\s*(\d{4})\b", "POJK {0}/{1}"),
    (r"\bSEOJK\s+(\d+)\s*/(?:SEOJK\.\d+/)?\s*(\d{4})\b", "SEOJK {0}/{1}"),
    (r"\bPP\s+(?:Nomor\s+)?(\d+)\s*(?:/|Tahun\s+)\s*(\d{4})\b", "PP {0}/{1}"),
    (r"\bPerpres\s+(?:Nomor\s+)?(\d+)\s*(?:/|Tahun\s+)\s*(\d{4})\b", "Perpres {0}/{1}"),
    (r"\bPermen\w*\s+(?:Nomor\s+)?(\d+)\s*(?:/|Tahun\s+)\s*(\d{4})\b", "Permen {0}/{1}"),
]

_PASAL = re.compile(r"Pasal\s+\d+(?:\s+ayat\s+\(\d+\))?", re.IGNORECASE)
_VERIFY_MARKER = re.compile(r"\[PERLU_VERIFIKASI:[^\]]*\]", re.IGNORECASE)


def _canonical(ref: str) -> str:
    key = ref.strip().lower()
    return ALIAS_MAP.get(key, ref.strip())


def extract(text: str) -> list[dict]:
    """Ekstrak kutipan dengan pasal terdekat (lookback ~40 karakter)."""
    found: list[dict] = []
    seen: set[tuple] = set()

    # 1) Marker [PERLU_VERIFIKASI] → selalu jadi needs-human-review.
    for m in _VERIFY_MARKER.finditer(text):
        found.append({"ref": "PERLU_VERIFIKASI", "pasal": None, "context": m.group(0)})

    # 2) Peraturan bernomor.
    for pattern, tmpl in _LAW_PATTERNS:
        for m in re.finditer(pattern, text, re.IGNORECASE):
            ref = _canonical(tmpl.format(*m.groups()))
            # cari "Pasal N" dalam 60 karakter setelah kutipan
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
    sample = (
        "Menurut POJK 22/2023 Pasal 62 penagihan dilarang mengancam. "
        "Lihat juga UU PDP dan [PERLU_VERIFIKASI: tarif denda terbaru]. "
        "SEOJK 19/2023 mengatur batas bunga."
    )
    for c in extract(sample):
        print(c)
