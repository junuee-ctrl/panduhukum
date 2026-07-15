import Link from "next/link";
import { getAllArticles } from "@/lib/content";
import { siteConfig } from "@/lib/siteConfig";

// Kategori masalah — pintu masuk berbasis "apa yang sedang saya alami".
const PROBLEM_CATEGORIES = [
  {
    id: "teror",
    emoji: "📵",
    title: "Diteror penagih (DC pinjol)",
    desc: "Ditelepon terus, diancam, data disebar? Ketahui batas yang boleh dan tidak.",
    match: ["teror", "dc", "sebar", "ancam"],
  },
  {
    id: "utang",
    emoji: "💳",
    title: "Terlilit utang & blacklist",
    desc: "Galbay, masuk SLIK, skor kredit jelek — apa akibatnya dan jalan keluarnya.",
    match: ["galbay", "blacklist", "slik", "skor", "tidak-dibayar", "akibat"],
  },
  {
    id: "lapor",
    emoji: "📣",
    title: "Mau melapor pinjol ilegal",
    desc: "Ke mana, lewat kanal apa, dan berkas apa yang perlu disiapkan.",
    match: ["lapor", "melaporkan", "ilegal"],
  },
  {
    id: "bunga",
    emoji: "🧮",
    title: "Cek bunga & legalitas",
    desc: "Bunga maksimal menurut OJK dan cara memastikan aplikasi terdaftar.",
    match: ["bunga", "maksimal", "legal", "cek"],
  },
];

function categorize(slug: string, keyword?: string) {
  const hay = `${slug} ${keyword ?? ""}`.toLowerCase();
  for (const cat of PROBLEM_CATEGORIES) {
    if (cat.match.some((m) => hay.includes(m))) return cat.id;
  }
  return null;
}

export default function HomePage() {
  const articles = getAllArticles("pinjol");

  return (
    <div>
      {/* Hero — misi (spec §0) */}
      <section className="bg-gradient-to-b from-brand-50 to-paper border-b border-brand-100">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:py-20 text-center">
          <p className="text-sm font-semibold text-brand-600 uppercase tracking-wide mb-3">
            {siteConfig.slogan}
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-ink leading-tight">
            Tahu apa yang harus Anda lakukan
            <br className="hidden sm:block" /> saat menghadapi masalah hukum.
          </h1>
          <p className="mt-4 text-lg text-ink-soft max-w-2xl mx-auto">
            Bukan pasal yang rumit — tapi <strong className="text-ink">langkah nyata</strong>.
            Setiap panduan berakhir dengan lima langkah: kenali situasi, ketahui hak Anda,
            lapor ke mana, siapkan bukti, dan hindari jebakan.
          </p>
          <a
            href="#masalah"
            className="mt-8 inline-flex items-center rounded-lg bg-brand-500 px-6 py-3 text-white font-medium hover:bg-brand-600"
          >
            Mulai dari masalah Anda
          </a>
        </div>
      </section>

      {/* Nilai — kepercayaan tenang */}
      <section className="mx-auto max-w-4xl px-4 py-10">
        <div className="grid gap-4 sm:grid-cols-3">
          <ValueCard title="Bahasa yang dimengerti" body="Ditulis untuk orang biasa, bukan untuk sarjana hukum." />
          <ValueCard title="Bisa langsung dijalankan" body="Setelah membaca, Anda tahu langkah berikutnya — bukan sekadar 'paham'." />
          <ValueCard title="Kejujuran terverifikasi" body="Setiap kutipan hukum dicek ke sumber resmi. Yang belum pasti, kami tandai." />
        </div>
      </section>

      {/* Pintu masuk per masalah */}
      <section id="masalah" className="mx-auto max-w-4xl px-4 py-8 scroll-mt-20">
        <h2 className="text-2xl font-bold text-ink mb-1">Sedang mengalami apa?</h2>
        <p className="text-ink-soft mb-6">Pilih yang paling dekat dengan situasi Anda.</p>

        <div className="grid gap-8">
          {PROBLEM_CATEGORIES.map((cat) => {
            const items = articles.filter(
              (a) => categorize(a.slug, a.frontmatter.target_keyword) === cat.id,
            );
            return (
              <div key={cat.id} className="rounded-2xl border border-brand-100 bg-white p-5">
                <div className="flex items-start gap-3">
                  <span className="text-2xl" aria-hidden="true">
                    {cat.emoji}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-ink">{cat.title}</h3>
                    <p className="text-sm text-ink-soft">{cat.desc}</p>
                  </div>
                </div>
                {items.length > 0 ? (
                  <ul className="mt-4 divide-y divide-brand-50">
                    {items.map((a) => (
                      <li key={a.slug}>
                        <Link
                          href={`/pinjol/${a.slug}/`}
                          className="flex items-center justify-between gap-3 py-2.5 text-ink hover:text-brand-600 group"
                        >
                          <span className="text-sm font-medium">{a.title}</span>
                          <span className="text-brand-400 group-hover:translate-x-0.5 transition-transform">
                            →
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm text-ink-muted italic">
                    Panduan untuk kategori ini sedang disiapkan.
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {articles.length === 0 ? (
          <p className="mt-8 text-center text-ink-muted">
            Belum ada artikel yang dipublikasikan. Tambahkan MDX di{" "}
            <code>content/pinjol/</code>.
          </p>
        ) : null}
      </section>

      {/* Batas identitas (spec §0) */}
      <section className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-xl bg-brand-50 border border-brand-100 p-5 text-sm text-ink-soft">
          <strong className="text-ink">Yang kami lakukan — dan tidak.</strong> PanduHukum
          memberi informasi dan jalur bertindak, <em>bukan</em> nasihat hukum untuk kasus
          pribadi Anda. Kami juga bukan pelatih kabur dari utang: fokus kami adalah membantu
          Anda menjaga hak sambil menyelesaikannya secara sah.
        </div>
      </section>
    </div>
  );
}

function ValueCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-brand-100 bg-white p-4">
      <div className="font-semibold text-ink mb-1">{title}</div>
      <p className="text-sm text-ink-muted leading-relaxed">{body}</p>
    </div>
  );
}
