"use client";
import { useState } from "react";

// Contoh penyelenggara berizin OJK (bukan daftar lengkap; diperbarui berkala).
// Sumber tunggal & final tetap OJK. Verifikasi via WA 081-157-157-157.
const SEED = [
  "Kredivo", "Akulaku", "EasyCash", "AdaKami", "Kredit Pintar", "JULO",
  "UangMe", "Indodana", "Rupiah Cepat", "MauCash", "DanaRupiah", "KTA Kilat",
  "360Kredi", "Modalku", "Amartha", "Investree", "Koinworks",
];
const UPDATED = "Juli 2026";

export function CekLegalitas() {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const match = query
    ? SEED.filter((n) => n.toLowerCase().includes(query))
    : [];

  return (
    <div className="space-y-5">
      <label className="block rounded-xl border border-brand-100 bg-white p-5">
        <span className="text-sm font-medium text-ink">Ketik nama aplikasi pinjol</span>
        <input
          type="text" value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="mis. Kredivo"
          className="mt-1 w-full rounded-lg border border-brand-200 px-3 py-2 focus:border-brand-500 focus:outline-none"
        />
      </label>

      {query ? (
        match.length > 0 ? (
          <div className="rounded-xl border border-brand-200 bg-brand-50 p-5">
            <div className="font-semibold text-brand-800 mb-2">
              Ditemukan di daftar contoh penyelenggara berizin:
            </div>
            <ul className="space-y-1 text-sm">
              {match.map((n) => (
                <li key={n} className="flex items-center gap-2 text-ink">
                  <span className="text-brand-600">✓</span> {n}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-ink-muted">
              Tetap konfirmasi ke OJK karena status dapat berubah.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-5">
            <div className="font-semibold text-amber-800">
              Tidak ada di daftar contoh kami
            </div>
            <p className="text-sm text-amber-800 mt-1">
              Ini <strong>bukan berarti pasti ilegal</strong> — daftar kami tidak lengkap.
              Wajib cek ke sumber resmi OJK di bawah.
            </p>
          </div>
        )
      ) : null}

      <div className="rounded-xl border border-brand-300 bg-white p-5">
        <div className="font-semibold text-ink mb-1">Cek resmi &amp; final ke OJK</div>
        <p className="text-sm text-ink-soft">
          Kirim nama aplikasi ke WhatsApp resmi OJK <strong>081-157-157-157</strong>, atau telepon{" "}
          <strong>157</strong>. Ini sumber legalitas yang paling akurat dan selalu terbarui.
        </p>
        <a
          href="https://api.whatsapp.com/send?phone=6281157157157"
          target="_blank" rel="noopener noreferrer"
          className="mt-3 inline-flex items-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
        >
          Cek via WhatsApp OJK 157
        </a>
      </div>

      <p className="text-xs text-ink-muted">
        Daftar contoh di atas diperbarui berkala (versi: {UPDATED}) dan tidak menggantikan daftar
        resmi OJK. Jika sebuah aplikasi menagih dengan ancaman atau menyebar data, lihat panduan{" "}
        <a href="/pinjol/cara-melaporkan-pinjol-ilegal/" className="text-brand-600 underline">cara melaporkan pinjol ilegal</a>.
      </p>
    </div>
  );
}
