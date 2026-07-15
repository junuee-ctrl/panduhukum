import type { Metadata } from "next";
import { siteConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: "Kontak",
  description: "Hubungi tim PanduHukum untuk masukan, koreksi, atau kerja sama.",
};

export default function KontakPage() {
  return (
    <div className="mx-auto max-w-prose px-4 py-10 prose-article">
      <h1 className="text-3xl font-extrabold text-ink mb-2">Kontak</h1>
      <p>
        Punya masukan, menemukan informasi yang perlu dikoreksi, atau ingin bekerja sama
        (mis. advokat yang bersedia meninjau artikel)? Kami senang mendengarnya.
      </p>
      <p>
        Email:{" "}
        <a href={`mailto:${siteConfig.organization.email}`} className="text-brand-600 underline">
          {siteConfig.organization.email}
        </a>
      </p>
      <p className="text-sm text-ink-muted">
        Catatan: kami tidak dapat memberikan nasihat hukum untuk kasus pribadi melalui email.
      </p>
    </div>
  );
}
