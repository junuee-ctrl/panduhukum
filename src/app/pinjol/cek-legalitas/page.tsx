import type { Metadata } from "next";
import { ToolShell } from "@/components/tools/ToolShell";
import { CekLegalitas } from "@/components/tools/CekLegalitas";

export const metadata: Metadata = {
  title: "Cek Legalitas Pinjol — Terdaftar OJK atau Tidak?",
  description:
    "Periksa apakah aplikasi pinjaman online terdaftar/berizin OJK. Cari di daftar contoh, lalu konfirmasi resmi lewat WhatsApp OJK 157 sebagai sumber final.",
  alternates: { canonical: "https://panduhukum.com/pinjol/cek-legalitas/" },
};

export default function Page() {
  return (
    <ToolShell
      title="Cek Legalitas Pinjol"
      intro="Cek apakah sebuah aplikasi pinjaman online terdaftar/berizin OJK. Sumber legalitas yang final adalah kontak resmi OJK 157."
    >
      <CekLegalitas />
    </ToolShell>
  );
}
