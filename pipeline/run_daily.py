# -*- coding: utf-8 -*-
"""run_daily.py — orkestrasi harian (v0.1).

Alur (permintaan pemilik):
- Ambil kata kunci dari keyword-queue.txt, dari ATAS.
- Untuk tiap kata kunci: generate + gate.
    🟢 green  -> artikel published:true; SETEL sebagai terbitan hari ini; STOP.
    🟡 yellow -> draft published:false disimpan (antre tinjauan manusia); LANJUT kata kunci berikut.
    ✗ fail    -> rotasi kata kunci ke bawah antrean; LANJUT.
  Batasi jumlah percobaan per hari (RUN_MAX_TRIES, default 5) agar hemat & tak spam.
- Perbarui keyword-queue.txt (yang sudah terbit/antre-tinjauan dihapus; yang gagal diputar ke bawah).
- Tulis manifest.json: {published, yellows, failed} untuk dibaca workflow.

Semua draft (green & yellow) ditulis ke content/<pillar>/. Yellow = published:false ->
tak tampil di situs & tak memblokir build; muncul di laporan sebagai "perlu tinjauan".
"""
import json
import time
import os
import sys

import generate_draft as gd

QUEUE = "keyword-queue.txt"
MANIFEST = "manifest.json"
MAX_TRIES = int(os.environ.get("RUN_MAX_TRIES", "5"))
MOCK = os.environ.get("RUN_MOCK") == "1"


def parse_queue(text):
    entries, comments = [], []
    for line in text.splitlines():
        if line.strip().startswith("#") or not line.strip():
            comments.append(line)
        else:
            parts = [p.strip() for p in line.split("|")]
            if len(parts) >= 3:
                entries.append({"raw": line, "keyword": parts[0], "slug": parts[1], "pillar": parts[2]})
            else:
                comments.append(line)
    return comments, entries


def main():
    with open(QUEUE, encoding="utf-8") as f:
        header, entries = parse_queue(f.read())

    client = None if MOCK else __import__("anthropic").Anthropic()
    published = None
    yellows, failed = [], []
    idx, tries = 0, 0

    while idx < len(entries) and tries < MAX_TRIES:
        if tries: time.sleep(4)
        e = entries[idx]; idx += 1; tries += 1
        print(f"[{tries}/{MAX_TRIES}] {e['slug']}", file=sys.stderr)
        res = gd.generate_article(client, e["keyword"], e["slug"],
                                  outdir=os.path.join("content", e["pillar"]), mock=MOCK)
        if res["status"] == "green":
            published = {"slug": e["slug"], "keyword": e["keyword"], "path": res["path"]}
            break
        elif res["status"] == "yellow":
            yellows.append({"slug": e["slug"], "keyword": e["keyword"], "path": res["path"],
                            "warns": res.get("warns", [])})
        else:
            failed.append(e)

    # Antrean baru: sisa yang belum diproses tetap di atas; yang gagal diputar ke bawah.
    remaining = entries[idx:] + failed
    new_queue = "\n".join(header + [r["raw"] for r in remaining]) + "\n"
    with open(QUEUE, "w", encoding="utf-8") as f:
        f.write(new_queue)

    manifest = {"published": published, "yellows": yellows,
                "failed": [f["slug"] for f in failed], "tries": tries}
    with open(MANIFEST, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)

    print("=== RINGKASAN ===")
    print("🟢 terbit:", published["slug"] if published else "(tidak ada yang lolos hari ini)")
    print("🟡 perlu tinjauan:", ", ".join(y["slug"] for y in yellows) or "-")
    print("✗ gagal:", ", ".join(manifest["failed"]) or "-")


if __name__ == "__main__":
    main()
