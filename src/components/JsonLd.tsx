import type { Article } from "@/lib/content";
import { siteConfig } from "@/lib/siteConfig";

function stripMd(s: string): string {
  return s
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // tautan → teks
    .replace(/[*_`#>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Article + FAQPage JSON-LD (spec req. 5). */
export function JsonLd({ article }: { article: Article }) {
  const fm = article.frontmatter;
  const url = `${siteConfig.url}/${article.pillar}/${article.slug}/`;
  const dates = (fm.changelog ?? []).map((c) => c.date).sort();
  const datePublished = dates[0];
  const dateModified = dates[dates.length - 1];

  const graph: Record<string, unknown>[] = [
    {
      "@type": "Article",
      "@id": `${url}#article`,
      headline: article.title,
      description: stripMd(article.summary).slice(0, 300),
      inLanguage: siteConfig.lang,
      mainEntityOfPage: url,
      ...(datePublished ? { datePublished } : {}),
      ...(dateModified ? { dateModified } : {}),
      author: fm.reviewer
        ? { "@type": "Person", name: String(fm.reviewer) }
        : { "@type": "Organization", name: siteConfig.name },
      publisher: {
        "@type": "Organization",
        name: siteConfig.name,
        url: siteConfig.url,
      },
      ...(fm.reviewer
        ? {
            reviewedBy: { "@type": "Person", name: String(fm.reviewer) },
          }
        : {}),
    },
  ];

  if (article.faq.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: article.faq.map((f) => ({
        "@type": "Question",
        name: stripMd(f.question),
        acceptedAnswer: {
          "@type": "Answer",
          text: stripMd(f.answer),
        },
      })),
    });
  }

  const json = { "@context": "https://schema.org", "@graph": graph };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
