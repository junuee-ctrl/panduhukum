import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tentang Kami",
  description:
    "PanduHukum adalah panduan hukum konsumen untuk orang awam Indonesia — informasi yang bisa langsung dijalankan, dengan kutipan hukum yang diverifikasi.",
};

export default function TentangPage() {
  return (
    <div className="mx-auto max-w-prose px-4 py-10 prose-article">
      <h1 className="text-3xl font-extrabold text-ink mb-2">Tentang PanduHukum</h1>
      <p>
        PanduHukum lahir dari satu keyakinan sederhana: orang yang sedang panik karena diteror
        penagih atau kehilangan uang karena penipuan tidak sedang mencari &ldquo;pasal&rdquo; —
        mereka mencari <strong>apa yang harus dilakukan sekarang</strong>.
      </p>
      <p>
        Kami menulis panduan hukum konsumen dalam bahasa sehari-hari, untuk orang biasa yang
        bukan sarjana hukum. Setiap panduan berakhir dengan lima langkah nyata: kenali situasi,
        ketahui hak Anda, lapor ke mana &amp; kapan, siapkan bukti, dan hindari jebakan.
      </p>
      <h2>Bagaimana kami menjaga akurasi</h2>
      <p>
        Setiap kutipan peraturan pada artikel yang kami terbitkan diverifikasi ke sumber resmi
        (peraturan.go.id, peraturan.bpk.go.id, dan situs OJK). Artikel yang memuat dasar hukum
        yang belum terverifikasi tidak akan pernah tayang — ini kami paksakan secara otomatis
        pada saat build. Yang belum kami pastikan, kami tandai secara terbuka.
      </p>
      <h2>Yang kami bukan</h2>
      <p>
        Kami memberi informasi, <strong>bukan nasihat hukum</strong> untuk kasus pribadi Anda.
        Kami juga tidak menganjurkan menghindari kewajiban yang sah. Untuk kasus spesifik,
        hubungi advokat atau lembaga bantuan hukum.
      </p>
    </div>
  );
}
