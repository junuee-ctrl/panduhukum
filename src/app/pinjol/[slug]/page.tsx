import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticle, listSlugs, getAllArticles } from "@/lib/content";
import { siteConfig } from "@/lib/siteConfig";
import { SummaryBox } from "@/components/SummaryBox";
import { StepSection } from "@/components/StepSection";
import { ConsultationCTA } from "@/components/ConsultationCTA";
import { Faq } from "@/components/Faq";
import { CitationList } from "@/components/CitationList";
import { ReviewerBadge } from "@/components/ReviewerBadge";
import { LegalReviewNotice } from "@/components/LegalReviewNotice";
import { Changelog } from "@/components/Changelog";
import { Disclaimer } from "@/components/Disclaimer";
import { JsonLd } from "@/components/JsonLd";
import { AdSlot } from "@/components/AdSlot";

const PILLAR = "pinjol";

export function generateStaticParams() {
  // Hanya artikel published yang dibangun.
  return getAllArticles(PILLAR).map((a) => ({ slug: a.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  let article;
  try {
    article = getArticle(params.slug, PILLAR);
  } catch {
    return {};
  }
  const url = `${siteConfig.url}/${PILLAR}/${article.slug}/`;
  const desc =
    article.summary.replace(/[*_`#>[\]]/g, "").replace(/\(https?:[^)]*\)/g, "").slice(0, 160) ||
    siteConfig.description;
  return {
    title: article.title,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: article.title,
      description: desc,
    },
    twitter: { card: "summary_large_image", title: article.title, description: desc },
  };
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  if (!listSlugs(PILLAR).includes(params.slug)) notFound();

  let article;
  try {
    article = getArticle(params.slug, PILLAR);
  } catch (e) {
    // Gerbang build-block: melempar saat build → build gagal (by design).
    throw e;
  }
  if (!article.frontmatter.published) notFound();

  return (
    <article className="mx-auto max-w-prose px-4 py-8">
      <JsonLd article={article} />

      <nav className="text-xs text-ink-muted mb-4" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-brand-600">
          Beranda
        </Link>
        <span className="mx-1">/</span>
        <Link href="/#masalah" className="hover:text-brand-600">
          Pinjol
        </Link>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-ink leading-tight">
        {article.title}
      </h1>

      <div className="mt-4">
        <ReviewerBadge fm={article.frontmatter} />
      </div>

      <LegalReviewNotice fm={article.frontmatter} />

      <SummaryBox summary={article.summary} />

      {/* STEP 1..5 dan section lain, dalam urutan sumber. CTA disisipkan setelah STEP 3. */}
      {article.sections
        .filter((s) => s.kind !== "faq" && s.kind !== "dasar-hukum")
        .map((section, i) => (
          <div key={i}>
            <StepSection section={section} />
            {section.kind === "step" && section.stepIndex === 3 ? (
              <ConsultationCTA enabled={false} />
            ) : null}
          </div>
        ))}

      <AdSlot slot={siteConfig.adsense.slots.inArticleTop} />

      <Faq items={article.faq} />

      <AdSlot slot={siteConfig.adsense.slots.inArticleBottom} />

      <CitationList citations={article.frontmatter.citations ?? []} />

      <Disclaimer />

      <Changelog entries={article.frontmatter.changelog} />
    </article>
  );
}
