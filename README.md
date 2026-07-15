# PanduHukum — panduhukum.com

Panduan hukum konsumen Indonesia untuk orang awam, langkah demi langkah.
_"Tahu hak Anda, langkah demi langkah."_

Next.js 14 (App Router, SSG) + Tailwind, di-deploy statis ke **Cloudflare Pages**.
Fase 1 fokus pada pilar **pinjol / keuangan konsumen**.

## Prinsip inti: gerbang kutipan (build-block)

Artikel `published: true` yang memuat **satu saja** kutipan hukum dengan
`verified !== true` akan **menggagalkan build** (`scripts/check-citations.mjs`,
dijalankan otomatis di `prebuild`). Ini membuat mustahil menerbitkan dasar hukum
yang belum diverifikasi ke sumber resmi.

```bash
npm install
npm run dev            # http://localhost:3000 (prebuild menjalankan gerbang kutipan)
npm run build          # SSG → folder ./out (untuk Cloudflare Pages)
npm run check:citations
```

Cloudflare Pages build settings:
- Build command: `npm run build`
- Output directory: `out`

## Struktur

```
content/pinjol/*.mdx     Konten (frontmatter + template 5 langkah)
src/app/                 Halaman (App Router)
  page.tsx               Beranda — pintu masuk per jenis masalah
  pinjol/[slug]/         Halaman artikel (template 5 langkah)
  sitemap.ts, robots.ts  Auto-generate sitemap.xml & robots.txt
src/components/          SummaryBox, StepSection, CitationList, ReviewerBadge,
                         ConsultationCTA (nonaktif), Faq, Changelog, JsonLd
src/lib/content.ts       Loader + parser frontmatter + gerbang verifikasi
scripts/check-citations.mjs   Gerbang build-block
pipeline/                Pipeline generasi + verifikasi (GitHub Actions)
.github/workflows/       auto-publish (harian) + reverify-citations (bulanan)
docs/                    Spesifikasi desain & SETUP
```

## Konten: frontmatter

Lihat `content/pinjol/*.mdx`. Field penting:
`published`, `citations[].verified`, `queue` (green/yellow), `reviewer`.

- `queue: green` + `reviewer: null` → badge **"Belum ditinjau ahli hukum"**.
- `reviewer` terisi → badge **"Ditinjau oleh [nama]"**.

## Operasi PC-free

Lihat `docs/SETUP.md`. Ringkasnya: isi `keyword-queue.txt`, Actions membuat draf +
menjalankan gerbang verifikasi setiap hari, dan mem-publish otomatis bila lolos.

> Informasi umum, bukan nasihat hukum.
