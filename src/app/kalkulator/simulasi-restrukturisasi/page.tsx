import type { Metadata } from "next";
import { ToolShell } from "@/components/tools/ToolShell";
import { RestrukturisasiSimulator } from "@/components/tools/RestrukturisasiSimulator";

export const metadata: Metadata = {
  title: "Simulasi Restrukturisasi Kredit — Kalkulator Cicilan",
  description:
    "Bandingkan cicilan sebelum dan sesudah restrukturisasi (perubahan bunga & tenor) untuk membantu Anda bernegosiasi dengan kreditur secara realistis.",
  alternates: { canonical: "https://panduhukum.com/kalkulator/simulasi-restrukturisasi/" },
};

export default function Page() {
  return (
    <ToolShell
      title="Simulasi Restrukturisasi Kredit"
      intro="Bandingkan cicilan skema sekarang dengan usulan restrukturisasi (bunga & tenor baru), sebagai bahan negosiasi dengan kreditur."
    >
      <RestrukturisasiSimulator />
    </ToolShell>
  );
}
