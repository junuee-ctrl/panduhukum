import type { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/content";
import { siteConfig } from "@/lib/siteConfig";

// Dihasilkan otomatis menjadi /sitemap.xml saat build (spec req. 5).
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/tentang/`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/disclaimer/`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/kontak/`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const articles: MetadataRoute.Sitemap = getAllArticles("pinjol").map((a) => {
    const dates = (a.frontmatter.changelog ?? []).map((c) => c.date).sort();
    const lastModified = dates[dates.length - 1];
    return {
      url: `${base}/pinjol/${a.slug}/`,
      ...(lastModified ? { lastModified } : {}),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    };
  });

  return [...staticPages, ...articles];
}
