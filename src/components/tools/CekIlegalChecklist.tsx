"use client";
import { useState } from "react";

const FLAGS = [
  "Bunga/biaya sangat tinggi dan tidak transparan (jauh di atas 0,1% per hari).",
  "Meminta izin akses ke seluruh kontak, galeri, atau lokasi saat instalasi.",
  "Pencairan sangat cepat tanpa syarat/verifikasi yang jelas.",
  "Menagih dengan ancaman, kata kasar, atau menghubungi kontak Anda.",
  "Tidak punya identitas jelas: alamat kantor, layanan resmi, atau nomor terdaftar.",
  "Ditawarkan lewat SMS/WhatsApp/link tak dikenal, bukan kanal resmi.",
  "Nama aplikasi tidak ada saat dicek ke kontak resmi OJK (WA 157).",
];

export function CekIlegalChecklist() {
  const [checked, setChecked] = useState<boolean[]>(Array(FLAGS.length).fill(false));
  const score = checked.filter(Boolean).length;
  const toggle = (i: number) =>
    setChecked((c) => c.map((v, idx) => (idx === i ? !v : v)));

  let verdict: { title: string; body: string; tone: string };
  if (score === 0) {
    verdict = { title: "Belum ada tanda bahaya yang Anda centang", body: "Tetap pastikan legalitas lewat kontak resmi OJK sebelum meminjam.", tone: "brand" };
  } else if (score <= 2) {
    verdict = { title: "Ada beberapa tanda yang perlu diwaspadai", body: "Berhati-hatilah. Verifikasi legalitas ke OJK 157 sebelum melanjutkan.", tone: "amber" };
  } else {
    verdict = { title: "Banyak tanda pinjol ilegal", body: "Sangat berisiko. Jangan lanjutkan; cek ke OJK 157 dan laporkan ke Satgas PASTI bila sudah meneror.", tone: "red" };
  }

  const toneCls =
    verdict.tone === "red"
      ? "border-red-300 bg-red-50 text-red-800"
      : verdict.tone === "amber"
      ? "border-amber-300 bg-amber-50 text-amber-800"
      : "border-brand-300 bg-brand-50 text-brand-800";

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-brand-100 bg-white p-5 space-y-3">
        <p className="text-sm text-ink-soft">Centang setiap tanda yang Anda alami:</p>
        {FLAGS.map((f, i) => (
          <label key={i} className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox" checked={checked[i]} onChange={() => toggle(i)}
              className="mt-1 h-4 w-4 rounded border-brand-300 text-brand-600"
            />
            <span className="text-sm text-ink">{f}</span>
          </label>
        ))}
      </div>

      <div className={`rounded-xl border p-5 ${toneCls}`}>
        <div className="text-xs font-semibold uppercase tracking-wide mb-1">
          {score} dari {FLAGS.length} tanda tercentang
        </div>
        <div className="font-bold">{verdict.title}</div>
        <p className="text-sm mt-1">{verdict.body}</p>
        <a
          href="https://panduhukum.com/pinjol/cara-melaporkan-pinjol-ilegal/"
          className="mt-3 inline-block text-sm font-medium underline underline-offset-2"
        >
          Cara melaporkan pinjol ilegal →
        </a>
      </div>

      <p className="text-xs text-ink-muted">
        Cek legalitas resmi: kirim nama aplikasi ke WhatsApp OJK 081-157-157-157 atau telepon 157.
        Alat ini hanya membantu mengenali tanda bahaya, bukan penilaian resmi.
      </p>
    </div>
  );
}
