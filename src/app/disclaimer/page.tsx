import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "Ketentuan penggunaan informasi di PanduHukum — informasi umum, bukan nasihat hukum.",
};

export default function DisclaimerPage() {
  return (
    <div className="mx-auto max-w-prose px-4 py-10 prose-article">
      <h1 className="text-3xl font-extrabold text-ink mb-2">Disclaimer</h1>
      <p>
        Seluruh konten di PanduHukum bersifat <strong>informasi umum</strong> dan disediakan
        &ldquo;sebagaimana adanya&rdquo;. Konten ini <strong>bukan nasihat hukum</strong> dan
        tidak menciptakan hubungan advokat–klien.
      </p>
      <p>
        Peraturan dapat berubah. Meskipun kami memverifikasi kutipan ke sumber resmi dan
        mencantumkan riwayat pembaruan, kami tidak menjamin bahwa setiap informasi selalu
        mutakhir untuk situasi spesifik Anda.
      </p>
      <p>
        Untuk kasus konkret, konsultasikan dengan advokat berlisensi atau lembaga bantuan
        hukum. PanduHukum tidak bertanggung jawab atas keputusan yang diambil semata-mata
        berdasarkan informasi di situs ini.
      </p>
      <p>
        Kami tidak menganjurkan tindakan menghindari kewajiban hukum yang sah. Fokus kami
        adalah membantu Anda menempuh jalur yang legal, aman, dan sesuai prosedur resmi.
      </p>
    </div>
  );
}
