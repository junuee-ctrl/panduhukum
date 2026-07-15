import type { Metadata } from "next";
import { ToolShell } from "@/components/tools/ToolShell";
import { CekIlegalChecklist } from "@/components/tools/CekIlegalChecklist";

export const metadata: Metadata = {
  title: "Cek: Pinjol Ini Ilegal? — Checklist Tanda Bahaya",
  description:
    "Checklist interaktif untuk mengenali ciri pinjol ilegal: bunga tak wajar, akses kontak, penagihan mengancam, dan lainnya. Verifikasi legalitas ke OJK 157.",
  alternates: { canonical: "https://panduhukum.com/pinjol/cek-ilegal/" },
};

export default function Page() {
  return (
    <ToolShell
      title="Pinjol Ini Ilegal? Cek Tanda Bahayanya"
      intro="Jawab checklist berikut untuk menilai seberapa besar kemungkinan sebuah aplikasi pinjaman online ilegal atau berbahaya."
    >
      <CekIlegalChecklist />
    </ToolShell>
  );
}
