import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export const CONTENT_DIR = path.join(process.cwd(), "content");

export type Citation = {
  ref: string;
  pasal?: string | null;
  verified: boolean;
  status?: string | null;
  verified_at?: string | null;
  source_url?: string | null;
};

export type ChangelogEntry = {
  date: string;
  note: string;
};

export type ArticleFrontmatter = {
  slug: string;
  title?: string;
  pillar: string;
  type?: string;
  target_keyword?: string;
  secondary_keywords?: string[];
  summary?: string;
  citations?: Citation[];
  queue?: "green" | "yellow";
  review_flags?: unknown[];
  reviewer?: string | null;
  reviewed_at?: string | null;
  changelog?: ChangelogEntry[];
  published?: boolean;
};

export type Section = {
  kind: "step" | "faq" | "dasar-hukum" | "generic";
  heading: string;
  stepIndex?: number; // 1..5 untuk STEP
  body: string;
};

export type FaqItem = { question: string; answer: string };

export type Article = {
  frontmatter: ArticleFrontmatter;
  title: string;
  summary: string;
  intro: string;
  sections: Section[];
  faq: FaqItem[];
  slug: string;
  pillar: string;
};

/**
 * Gerbang keamanan inti (spec §4–5):
 * Artikel `published: true` yang memuat kutipan mana pun dengan `verified !== true`
 * adalah error fatal — build harus gagal. Dipanggil di build time.
 */
export function assertCitationsVerified(fm: ArticleFrontmatter): void {
  if (!fm.published) return;
  const unverified = (fm.citations ?? []).filter((c) => c.verified !== true);
  if (unverified.length > 0) {
    const detail = unverified
      .map((c) => `  - ${c.ref}${c.pasal ? " " + c.pasal : ""} (verified=${c.verified})`)
      .join("\n");
    throw new Error(
      `[BUILD BLOCKED] Artikel published "${fm.slug}" memuat kutipan yang belum terverifikasi:\n` +
        `${detail}\n` +
        `Setiap kutipan pada artikel published wajib verified: true (sumber resmi). ` +
        `Perbaiki frontmatter atau set published: false.`,
    );
  }
}

function stripMarker(text: string): string {
  return text
    .replace(/^\s*#\s+.*$/m, "") // buang H1 (judul sudah dari frontmatter)
    .replace(/\[RINGKASAN\]/gi, "")
    .trim();
}

function classify(heading: string): { kind: Section["kind"]; stepIndex?: number } {
  const h = heading.toLowerCase();
  const stepMatch = h.match(/step\s*(\d+)/);
  if (stepMatch) return { kind: "step", stepIndex: Number(stepMatch[1]) };
  if (h.includes("faq") || h.includes("tanya")) return { kind: "faq" };
  if (h.includes("dasar hukum")) return { kind: "dasar-hukum" };
  return { kind: "generic" };
}

function splitSections(body: string): { intro: string; sections: Section[] } {
  const lines = body.split("\n");
  const sections: Section[] = [];
  let introLines: string[] = [];
  let current: { heading: string; buf: string[] } | null = null;

  const flush = () => {
    if (current) {
      const { kind, stepIndex } = classify(current.heading);
      sections.push({ kind, stepIndex, heading: current.heading, body: current.buf.join("\n").trim() });
      current = null;
    }
  };

  for (const line of lines) {
    const h2 = line.match(/^##\s+(.*)$/);
    if (h2) {
      flush();
      current = { heading: h2[1].trim(), buf: [] };
    } else if (current) {
      current.buf.push(line);
    } else {
      introLines.push(line);
    }
  }
  flush();

  return { intro: stripMarker(introLines.join("\n")), sections };
}

/** Ekstrak pasangan Q/A dari section FAQ untuk render + JSON-LD. */
function parseFaq(section: Section | undefined): FaqItem[] {
  if (!section) return [];
  const items: FaqItem[] = [];
  const parts = section.body.split(/^###\s+/m).map((p) => p.trim()).filter(Boolean);
  if (parts.length > 1 || /^###\s+/m.test(section.body)) {
    for (const part of parts) {
      const nl = part.indexOf("\n");
      const question = (nl === -1 ? part : part.slice(0, nl)).replace(/[:?]\s*$/, "").trim();
      const answer = (nl === -1 ? "" : part.slice(nl + 1)).trim();
      if (question) items.push({ question: question.endsWith("?") ? question : question + "?", answer });
    }
    return items;
  }
  // Fallback: format "**Tanya:** ... **Jawab:** ..."
  const blocks = section.body.split(/\n{2,}/);
  for (const b of blocks) {
    const m = b.match(/\*\*(?:T|Tanya|Q)[:.]?\*\*\s*(.+?)\s*\*\*(?:J|Jawab|A)[:.]?\*\*\s*([\s\S]+)/i);
    if (m) items.push({ question: m[1].trim(), answer: m[2].trim() });
  }
  return items;
}

function deriveTitle(fm: ArticleFrontmatter): string {
  if (fm.title) return fm.title;
  if (fm.target_keyword) {
    return fm.target_keyword.charAt(0).toUpperCase() + fm.target_keyword.slice(1);
  }
  return fm.slug;
}

function pillarDir(pillar: string): string {
  return path.join(CONTENT_DIR, pillar);
}

export function listSlugs(pillar = "pinjol"): string[] {
  const dir = pillarDir(pillar);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    .map((f) => f.replace(/\.mdx?$/, ""));
}

export function getArticle(slug: string, pillar = "pinjol"): Article {
  const dir = pillarDir(pillar);
  const file =
    [path.join(dir, `${slug}.mdx`), path.join(dir, `${slug}.md`)].find((p) => fs.existsSync(p)) ?? "";
  if (!file) throw new Error(`Artikel tidak ditemukan: ${pillar}/${slug}`);

  const raw = fs.readFileSync(file, "utf-8");
  const { data, content } = matter(raw);
  const fm = data as ArticleFrontmatter;
  fm.slug = fm.slug || slug;
  fm.pillar = fm.pillar || pillar;

  // Gerbang build-block (spec §4–5).
  assertCitationsVerified(fm);

  const { intro, sections } = splitSections(content);
  const faqSection = sections.find((s) => s.kind === "faq");
  const faq = parseFaq(faqSection);
  const summary = fm.summary?.trim() || intro.split(/\n{2,}/)[0]?.trim() || "";

  return {
    frontmatter: fm,
    title: deriveTitle(fm),
    summary,
    intro,
    sections,
    faq,
    slug: fm.slug,
    pillar: fm.pillar,
  };
}

/** Semua artikel published (untuk homepage & sitemap). */
export function getAllArticles(pillar = "pinjol"): Article[] {
  return listSlugs(pillar)
    .map((s) => getArticle(s, pillar))
    .filter((a) => a.frontmatter.published === true)
    .sort((a, b) => a.title.localeCompare(b.title));
}
