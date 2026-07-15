import type { Metadata } from "next";
import { ToolShell } from "@/components/tools/ToolShell";
import { BungaCalculator } from "@/components/tools/BungaCalculator";

export const metadata: Metadata = {
  title: "Kalkulator Bunga Pinjol Maksimal (Aturan OJK 2026)",
  description:
    "Hitung batas maksimal bunga harian dan denda pinjaman online menurut aturan OJK (SEOJK 19/2023). Bandingkan dengan tagihan Anda untuk mengenali pinjol ilegal.",
  alternates: { canonical: "https://panduhukum.com/kalkulator/bunga-harian/" },
};

export default function Page() {
  return (
    <ToolShell
      title="Kalkulator Bunga Pinjol Maksimal"
      intro="Masukkan jumlah dan tenor pinjaman untuk melihat batas maksimal bunga dan denda menurut aturan OJK 2026. Berguna untuk memeriksa apakah tagihan Anda wajar."
    >
      <BungaCalculator />
    </ToolShell>
  );
}
