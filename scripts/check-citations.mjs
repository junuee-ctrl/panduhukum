#!/usr/bin/env node
/**
 * GERBANG KEAMANAN INTI (spec §4–5) — dijalankan sebelum `next build` (prebuild).
 *
 * Aturan: setiap artikel dengan `published: true` yang memuat SATU SAJA kutipan
 * dengan `verified !== true` akan MENGGAGALKAN BUILD (exit 1).
 * Tujuan: mustahil menerbitkan artikel yang memuat dasar hukum belum terverifikasi.
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content");

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return walk(p);
    return /\.mdx?$/.test(e.name) ? [p] : [];
  });
}

const files = walk(CONTENT_DIR);
const violations = [];
let publishedCount = 0;
let citationCount = 0;

for (const file of files) {
  let data;
  try {
    ({ data } = matter(fs.readFileSync(file, "utf-8")));
  } catch (e) {
    violations.push({ file, reason: `Frontmatter tidak bisa diparse: ${e.message}` });
    continue;
  }
  if (data.published !== true) continue;
  publishedCount++;

  const citations = Array.isArray(data.citations) ? data.citations : [];
  for (const c of citations) {
    citationCount++;
    if (c?.verified !== true) {
      violations.push({
        file,
        reason: `Kutipan belum terverifikasi: ${c?.ref ?? "(tanpa ref)"}${
          c?.pasal ? " " + c.pasal : ""
        } (verified=${c?.verified})`,
      });
    }
  }
}

const rel = (f) => path.relative(process.cwd(), f);

if (violations.length > 0) {
  console.error("\n\x1b[41m\x1b[97m BUILD BLOCKED — kutipan belum terverifikasi \x1b[0m\n");
  for (const v of violations) {
    console.error(`  \x1b[31m✗\x1b[0m ${rel(v.file)}\n     ${v.reason}`);
  }
  console.error(
    `\n${violations.length} pelanggaran. Artikel published wajib punya semua kutipan ` +
      `verified: true (sumber resmi), atau set published: false.\n`,
  );
  process.exit(1);
}

console.log(
  `\x1b[32m✓ Gerbang kutipan lolos\x1b[0m — ${publishedCount} artikel published, ` +
    `${citationCount} kutipan, semuanya terverifikasi.`,
);
