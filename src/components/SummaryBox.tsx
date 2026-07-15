import { Markdown } from "./Markdown";

/** Kotak ringkasan 3 kalimat — target Featured Snippet (spec §3). */
export function SummaryBox({ summary }: { summary: string }) {
  if (!summary) return null;
  return (
    <aside
      className="rounded-xl border border-brand-200 bg-brand-50 p-5 my-6"
      aria-label="Ringkasan jawaban"
    >
      <div className="flex items-center gap-2 mb-2 text-brand-700 font-semibold text-sm uppercase tracking-wide">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M9 12l2 2 4-4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        </svg>
        Jawaban singkat
      </div>
      <div className="text-ink [&_p]:my-1 [&_p]:text-ink">
        <Markdown>{summary}</Markdown>
      </div>
    </aside>
  );
}
