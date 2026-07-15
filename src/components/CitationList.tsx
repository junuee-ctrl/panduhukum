import type { Citation } from "@/lib/content";

/** Badge "✓ Terverifikasi dari sumber resmi" (spec §5). */
function VerifiedBadge({ verified }: { verified: boolean }) {
  if (verified) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Terverifikasi dari sumber resmi
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
      Perlu verifikasi
    </span>
  );
}

/** Blok "Dasar Hukum": daftar peraturan yang dikutip + badge verifikasi. */
export function CitationList({ citations }: { citations: Citation[] }) {
  if (!citations || citations.length === 0) return null;
  return (
    <section className="mt-10" id="dasar-hukum">
      <h2 className="text-xl font-bold text-ink mb-3">Dasar Hukum</h2>
      <ul className="space-y-3">
        {citations.map((c, i) => (
          <li
            key={`${c.ref}-${i}`}
            className="rounded-lg border border-brand-100 bg-white p-4 flex flex-col gap-1.5"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-ink">
                {c.ref}
                {c.pasal ? <span className="font-normal text-ink-soft"> · {c.pasal}</span> : null}
              </span>
              <VerifiedBadge verified={c.verified === true} />
            </div>
            <div className="text-xs text-ink-muted flex flex-wrap gap-x-4 gap-y-1">
              {c.verified_at ? <span>Diverifikasi: {c.verified_at}</span> : null}
              {c.source_url ? (
                <a
                  href={c.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-600 underline underline-offset-2"
                >
                  Sumber resmi ↗
                </a>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
