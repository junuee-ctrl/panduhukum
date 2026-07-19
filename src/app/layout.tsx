import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Script from "next/script";
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
  keywords: ["hukum konsumen", "pinjol", "debt collector", "lapor OJK", "hak konsumen", "panduan hukum"],
  authors: [{ name: siteConfig.name }],
  alternates: { canonical: "/" },
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
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
  robots: { index: true, follow: true },
  other: {
    "google-adsense-account": siteConfig.adsense.client,
  },
};

export const viewport: Viewport = { themeColor: "#2b2b33" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={siteConfig.lang}>
      <body className="min-h-screen flex flex-col">
        <Script
          id="adsbygoogle-init"
          async
          strategy="beforeInteractive"
          crossOrigin="anonymous"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${siteConfig.adsense.client}`}
        />
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
        <Link href="/" aria-label="PanduHukum" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png?v=2" alt="PanduHukum" width={841} height={205} style={{ height: 44, width: "auto" }} />
        </Link>
        <nav className="hidden sm:flex items-center gap-6 text-sm text-ink-soft">
          <Link href="/#masalah" className="hover:text-brand-600">Cari Masalah</Link>
          <Link href="/#alat" className="hover:text-brand-600">Alat</Link>
          <Link href="/tentang/" className="hover:text-brand-600">Tentang</Link>
          <Link href="/disclaimer/" className="hover:text-brand-600">Disclaimer</Link>
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
            <div className="font-bold text-ink mb-2">Pandu<span className="text-brand-600">Hukum</span></div>
            <p className="leading-relaxed">
              Panduan hukum untuk orang biasa. Bukan nasihat hukum — untuk kasus spesifik,
              konsultasikan dengan advokat.
            </p>
          </div>
          <nav className="flex flex-col gap-2">
            <Link href="/tentang/" className="hover:text-brand-600">Tentang Kami</Link>
            <Link href="/kontak/" className="hover:text-brand-600">Kontak</Link>
            <Link href="/disclaimer/" className="hover:text-brand-600">Disclaimer</Link>
          </nav>
        </div>
        <div className="mt-8 pt-6 border-t border-brand-100 text-xs">
          © {new Date().getFullYear()} {siteConfig.name} · {siteConfig.domain}
        </div>
      </div>
    </footer>
  );
}
