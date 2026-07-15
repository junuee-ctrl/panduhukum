import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/siteConfig";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.slogan}`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    "hukum konsumen",
    "pinjol",
    "debt collector",
    "lapor OJK",
    "hak konsumen",
    "panduan hukum",
  ],
  authors: [{ name: siteConfig.name }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.slogan}`,
    description: siteConfig.description,
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: siteConfig.name }],
  },
  twitter: {
    card: "summary_large_image",
    site: siteConfig.twitter,
    title: `${siteConfig.name} — ${siteConfig.slogan}`,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={siteConfig.lang}>
      <body className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

function SiteHeader() {
  return (
    <header className="border-b border-brand-100 bg-white/80 backdrop-blur sticky top-0 z-20">
      <div className="mx-auto max-w-5xl px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white font-bold">
            P
          </span>
          <span className="font-bold text-lg text-ink tracking-tight">
            Pandu<span className="text-brand-600">Hukum</span>
          </span>
        </Link>
        <nav className="hidden sm:flex items-center gap-6 text-sm text-ink-soft">
          <Link href="/#masalah" className="hover:text-brand-600">
            Cari Masalah
          </Link>
          <Link href="/tentang/" className="hover:text-brand-600">
            Tentang
          </Link>
          <Link href="/disclaimer/" className="hover:text-brand-600">
            Disclaimer
          </Link>
        </nav>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-brand-100 bg-white mt-16">
      <div className="mx-auto max-w-5xl px-4 py-10 text-sm text-ink-muted">
        <div className="flex flex-col gap-6 sm:flex-row sm:justify-between">
          <div className="max-w-sm">
            <div className="font-bold text-ink mb-2">
              Pandu<span className="text-brand-600">Hukum</span>
            </div>
            <p className="leading-relaxed">
              Panduan hukum untuk orang biasa. Bukan nasihat hukum — untuk kasus
              spesifik, konsultasikan dengan advokat.
            </p>
          </div>
          <nav className="flex flex-col gap-2">
            <Link href="/tentang/" className="hover:text-brand-600">
              Tentang Kami
            </Link>
            <Link href="/kontak/" className="hover:text-brand-600">
              Kontak
            </Link>
            <Link href="/disclaimer/" className="hover:text-brand-600">
              Disclaimer
            </Link>
          </nav>
        </div>
        <div className="mt-8 pt-6 border-t border-brand-100 text-xs">
          © {new Date().getFullYear()} {siteConfig.name} · {siteConfig.domain}
        </div>
      </div>
    </footer>
  );
}
