import type { ArticleFrontmatter } from "@/lib/content";

/**
 * Status tinjauan ahli (spec req. 4 / SETUP.md):
 * - queue "green" & reviewer null  → "Belum ditinjau ahli hukum" (transparansi)
 * - reviewer terisi                → "Ditinjau oleh [nama]" (badge kepercayaan)
 */
export function ReviewerBadge({ fm }: { fm: ArticleFrontmatter }) {
  const reviewer = fm.reviewer && String(fm.reviewer).trim() ? String(fm.reviewer).trim() : null;

  if (reviewer) {
    return (
      <div className="inline-flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-brand-600">
          <path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 14.8 7.2 17l.9-5.4L4.2 7.7l5.4-.8L12 2z" fill="currentColor" />
        </svg>
        <span className="text-ink">
          Ditinjau oleh <strong className="font-semibold">{reviewer}</strong>
          {fm.reviewed_at ? (
            <span className="text-ink-muted font-normal"> · {fm.reviewed_at}</span>
          ) : null}
        </span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-amber-600">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="text-ink-soft">Belum ditinjau ahli hukum</span>
    </div>
  );
}
