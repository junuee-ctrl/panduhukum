import type { ArticleFrontmatter } from "@/lib/content";

/**
 * Badge status tinjauan (permintaan pemilik):
 * - reviewer terisi -> "✓ Telah diverifikasi oleh advokat: [nama]" (badge kepercayaan).
 * - reviewer kosong -> tidak tampil di sini; notis "belum diverifikasi advokat" ditangani
 *   oleh <LegalReviewNotice /> di atas artikel.
 */
export function ReviewerBadge({ fm }: { fm: ArticleFrontmatter }) {
  const reviewer = fm.reviewer && String(fm.reviewer).trim() ? String(fm.reviewer).trim() : null;
  if (!reviewer) return null;

  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-brand-300 bg-brand-50 px-3 py-2 text-sm">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-brand-600">
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      </svg>
      <span className="text-ink">
        Telah diverifikasi oleh advokat: <strong className="font-semibold">{reviewer}</strong>
        {fm.reviewed_at ? <span className="text-ink-muted font-normal"> · {fm.reviewed_at}</span> : null}
      </span>
    </div>
  );
}
