"use client";
import { useState } from "react";

function rp(n: number) {
  return "Rp " + Math.round(n).toLocaleString("id-ID");
}

// Cicilan flat sederhana (edukasi): bunga dihitung atas pokok awal.
function cicilanFlat(pokok: number, bulananPersen: number, bulan: number) {
  const bungaTotal = pokok * (bulananPersen / 100) * bulan;
  const total = pokok + bungaTotal;
  return { perBulan: total / bulan, total, bungaTotal };
}

export function RestrukturisasiSimulator() {
  const [pokok, setPokok] = useState(5000000);
  const [bungaLama, setBungaLama] = useState(3);
  const [tenorLama, setTenorLama] = useState(6);
  const [bungaBaru, setBungaBaru] = useState(1.5);
  const [tenorBaru, setTenorBaru] = useState(12);

  const lama = cicilanFlat(pokok, bungaLama, tenorLama);
  const baru = cicilanFlat(pokok, bungaBaru, tenorBaru);
  const selisihPerBulan = lama.perBulan - baru.perBulan;

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-brand-100 bg-white p-5 space-y-4">
        <Num label="Sisa pokok utang" value={pokok} set={setPokok} />
        <div className="grid grid-cols-2 gap-3">
          <Num label="Bunga lama (%/bulan)" value={bungaLama} set={setBungaLama} step={0.1} />
          <Num label="Tenor lama (bulan)" value={tenorLama} set={setTenorLama} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Num label="Usulan bunga baru (%/bulan)" value={bungaBaru} set={setBungaBaru} step={0.1} />
          <Num label="Usulan tenor baru (bulan)" value={tenorBaru} set={setTenorBaru} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card title="Skema sekarang" per={lama.perBulan} total={lama.total} bunga={lama.bungaTotal} tenor={tenorLama} tone="plain" />
        <Card title="Skema usulan" per={baru.perBulan} total={baru.total} bunga={baru.bungaTotal} tenor={tenorBaru} tone="brand" />
      </div>

      <div className="rounded-xl border border-brand-200 bg-brand-50 p-5 text-sm">
        {selisihPerBulan > 0 ? (
          <p className="text-ink">
            Cicilan bulanan turun sekitar <strong>{rp(selisihPerBulan)}</strong> per bulan
            (dari {rp(lama.perBulan)} menjadi {rp(baru.perBulan)}). Tenor lebih panjang biasanya
            memperbesar total bunga meski cicilan bulanan lebih ringan — perhatikan keduanya.
          </p>
        ) : (
          <p className="text-ink">
            Dengan angka ini, cicilan usulan tidak lebih ringan. Coba perpanjang tenor atau
            turunkan bunga usulan.
          </p>
        )}
      </div>

      <p className="text-xs text-ink-muted">
        Perhitungan memakai model bunga flat sederhana untuk gambaran. Skema resmi restrukturisasi
        (mis. bunga efektif, keringanan denda) ditentukan penyelenggara. Ajukan langsung ke layanan
        resmi kreditur Anda.
      </p>
    </div>
  );
}

function Num({ label, value, set, step = 1 }: { label: string; value: number; set: (n: number) => void; step?: number }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink">{label}</span>
      <input
        type="number" min={0} step={step} value={value}
        onChange={(e) => set(Math.max(0, Number(e.target.value)))}
        className="mt-1 w-full rounded-lg border border-brand-200 px-3 py-2 focus:border-brand-500 focus:outline-none"
      />
    </label>
  );
}

function Card({ title, per, total, bunga, tenor, tone }: { title: string; per: number; total: number; bunga: number; tenor: number; tone: "plain" | "brand" }) {
  return (
    <div className={`rounded-xl border p-4 ${tone === "brand" ? "border-brand-300 bg-brand-50" : "border-brand-100 bg-white"}`}>
      <div className="text-sm font-semibold text-ink mb-2">{title}</div>
      <div className="text-2xl font-extrabold text-brand-700">{rp(per)}<span className="text-sm font-normal text-ink-muted">/bulan</span></div>
      <dl className="mt-2 space-y-1 text-xs text-ink-soft">
        <div className="flex justify-between"><dt>Tenor</dt><dd>{tenor} bulan</dd></div>
        <div className="flex justify-between"><dt>Total bunga</dt><dd>{rp(bunga)}</dd></div>
        <div className="flex justify-between"><dt>Total bayar</dt><dd className="font-semibold text-ink">{rp(total)}</dd></div>
      </dl>
    </div>
  );
}
