import Link from "next/link";

export function ToolShell({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-prose px-4 py-8">
      <nav className="text-xs text-ink-muted mb-4" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-brand-600">Beranda</Link>
        <span className="mx-1">/</span>
        <Link href="/#alat" className="hover:text-brand-600">Alat bantu</Link>
      </nav>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-ink leading-tight">{title}</h1>
      <p className="mt-3 text-ink-soft">{intro}</p>
      <div className="mt-6">{children}</div>
      <aside className="mt-8 rounded-xl border border-ink-muted/20 bg-ink/[0.03] p-4 text-sm text-ink-muted">
        <strong className="text-ink-soft">Catatan:</strong> Alat ini hanya perkiraan untuk
        edukasi berdasarkan aturan resmi, bukan nasihat hukum atau keuangan. Angka sebenarnya
        mengikuti perjanjian dan ketentuan resmi penyelenggara.
      </aside>
    </div>
  );
}
