import type { ArticleFrontmatter } from "@/lib/content";

/**
 * Notis transparansi (permintaan pemilik): tampilkan di ATAS artikel bila belum
 * ditinjau advokat (reviewer null). Setelah advokat mengisi `reviewer`, notis hilang
 * dan digantikan badge "Ditinjau oleh …".
 */
export function LegalReviewNotice({ fm }: { fm: ArticleFrontmatter }) {
  const reviewed = fm.reviewer && String(fm.reviewer).trim();
  if (reviewed) return null;
  return (
    <div
      role="note"
      className="my-4 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mt-0.5 shrink-0 text-amber-600">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <p>
        <strong>Artikel ini belum diverifikasi oleh ahli hukum (advokat).</strong>{" "}
        Materi disusun dan dicek faktual oleh tim PanduHukum dengan kutipan dari sumber resmi,
        namun belum ditinjau advokat. Gunakan sebagai informasi umum — bukan nasihat hukum.
        Untuk kasus spesifik, konsultasikan dengan advokat.
      </p>
    </div>
  );
}
