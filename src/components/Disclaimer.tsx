/** Fandu wajib di setiap artikel (spec §7). */
export function Disclaimer() {
  return (
    <aside className="mt-10 rounded-xl border border-ink-muted/20 bg-ink/[0.03] p-4 text-sm text-ink-muted">
      <strong className="text-ink-soft">Catatan:</strong> Artikel ini bersifat informasi
      umum, <strong className="text-ink-soft">bukan nasihat hukum</strong>. Setiap kasus
      memiliki detail yang berbeda. Untuk kasus spesifik, konsultasikan dengan advokat atau
      lembaga bantuan hukum. PanduHukum tidak menganjurkan menghindari kewajiban yang sah —
      fokus kami adalah membantu Anda menempuh jalur yang legal dan aman.
    </aside>
  );
}
