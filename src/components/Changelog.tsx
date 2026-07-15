import type { ChangelogEntry } from "@/lib/content";

/** Riwayat Pembaruan — sinyal kesegaran (spec §1). */
export function Changelog({ entries }: { entries?: ChangelogEntry[] }) {
  if (!entries || entries.length === 0) return null;
  const sorted = [...entries].sort((a, b) => (a.date < b.date ? 1 : -1));
  return (
    <section className="mt-10" id="riwayat-pembaruan">
      <h2 className="text-lg font-bold text-ink mb-3">Riwayat Pembaruan</h2>
      <ul className="space-y-2 border-l-2 border-brand-100 pl-4">
        {sorted.map((e, i) => (
          <li key={i} className="text-sm text-ink-soft">
            <time className="font-medium text-ink-muted">{e.date}</time> — {e.note}
          </li>
        ))}
      </ul>
    </section>
  );
}
