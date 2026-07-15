export const siteConfig = {
  name: "PanduHukum",
  domain: "panduhukum.com",
  url: "https://panduhukum.com",
  slogan: "Tahu hak Anda, langkah demi langkah",
  description:
    "PanduHukum adalah panduan hukum konsumen untuk orang awam di Indonesia. " +
    "Saat menghadapi masalah — diteror DC pinjol, data disebar, motor ditarik leasing — " +
    "kami beri tahu apa yang harus Anda lakukan sekarang, langkah demi langkah.",
  locale: "id_ID",
  lang: "id",
  ogImage: "/og-default.png",
  twitter: "@panduhukum",
  organization: {
    name: "PanduHukum",
    email: "halo@panduhukum.com",
  },
} as const;

export type SiteConfig = typeof siteConfig;
