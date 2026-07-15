"use client";
import { useState } from "react";

const RATES = {
  konsumtif: { label: "Konsumtif (kebutuhan pribadi)", daily: 0.001 },   // 0,1%/hari (2026)
  produktif: { label: "Produktif (modal usaha)", daily: 0.00067 },       // 0,067%/hari (2026)
};

function rp(n: number) {
  return "Rp " + Math.round(n).toLocaleString("id-ID");
}

export function BungaCalculator() {
  const [pokok, setPokok] = useState(1000000);
  const [tenor, setTenor] = useState(30);
  const [jenis, setJenis] = useState<keyof typeof RATES>("konsumtif");

  const rate = RATES[jenis].daily;
  const bungaHarian = pokok * rate;
  const totalBunga = bungaHarian * tenor;
  const capBiaya = pokok; // total biaya maksimal 100% dari pokok
  const bungaDibatasiCap = Math.min(totalBunga, capBiaya);
  const dendaHarianMax = pokok * 0.001; // denda konsumtif maks 0,1%/hari (2026)

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-brand-100 bg-white p-5 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-ink">Jumlah pokok pinjaman</span>
          <input
            type="number" min={0} value={pokok}
            onChange={(e) => setPokok(Math.max(0, Number(e.target.value)))}
            className="mt-1 w-full rounded-lg border border-brand-200 px-3 py-2 focus:border-brand-500 focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink">Tenor (jumlah hari)</span>
          <input
            type="number" min={1} value={tenor}
            onChange={(e) => setTenor(Math.max(1, Number(e.target.value)))}
            className="mt-1 w-full rounded-lg border border-brand-200 px-3 py-2 focus:border-brand-500 focus:outline-none"
          />
        </label>
        <div>
          <span className="text-sm font-medium text-ink">Jenis pendanaan</span>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            {(Object.keys(RATES) as (keyof typeof RATES)[]).map((k) => (
              <button
                key={k} type="button" onClick={() => setJenis(k)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm ${
                  jenis === k
                    ? "border-brand-500 bg-brand-50 text-brand-700 font-medium"
                    : "border-brand-200 text-ink-soft"
                }`}
              >
                {RATES[k].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-brand-200 bg-brand-50 p-5">
        <div className="text-sm font-semibold text-brand-700 uppercase tracking-wide mb-3">
          Batas maksimal menurut aturan OJK (2026)
        </div>
        <dl className="space-y-2 text-sm">
          <Row label="Manfaat ekonomi (bunga) per hari" value={`${(rate * 100).toLocaleString("id-ID")}% × pokok = ${rp(bungaHarian)}`} />
          <Row label={`Total bunga maksimal (${tenor} hari)`} value={rp(totalBunga)} />
          <Row label="Denda keterlambatan maksimal / hari" value={rp(dendaHarianMax)} />
          <Row label="Batas total biaya atas 1 pinjaman" value={`${rp(capBiaya)} (100% pokok)`} strong />
        </dl>
        {totalBunga > capBiaya ? (
          <p className="mt-3 text-xs text-amber-700">
            Catatan: total bunga selama tenor melampaui batas 100% pokok — biaya yang boleh ditagih
            tetap dibatasi maksimal {rp(bungaDibatasiCap)}.
          </p>
        ) : null}
      </div>

      <p className="text-xs text-ink-muted">
        Dasar: SEOJK 19/2023 (batas manfaat ekonomi & denda pendanaan fintech P2P). Untuk 2026,
        pinjaman konsumtif dibatasi 0,1% per hari. Jika sebuah aplikasi menarik jauh di atas ini,
        besar kemungkinan ilegal.
      </p>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-brand-100 pb-2 last:border-0">
      <dt className="text-ink-soft">{label}</dt>
      <dd className={strong ? "font-bold text-ink text-right" : "text-ink text-right"}>{value}</dd>
    </div>
  );
}
