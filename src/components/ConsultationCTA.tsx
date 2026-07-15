/**
 * Slot CTA konsultasi (spec §7 — roadmap monetisasi).
 * Fase 1: KOMPONEN DINONAKTIFKAN. Hanya menempati layout di bawah STEP 3.
 * Aktifkan dengan `enabled` saat kemitraan (mis. Justika) siap.
 */
export function ConsultationCTA({ enabled = false }: { enabled?: boolean }) {
  if (!enabled) {
    // Placeholder tak terlihat: menahan posisi layout tanpa merender apa pun ke pembaca.
    return (
      <div
        data-cta-slot="konsultasi"
        data-enabled="false"
        aria-hidden="true"
        className="hidden"
      />
    );
  }

  return (
    <aside className="my-6 rounded-xl border border-brand-200 bg-white p-5" data-cta-slot="konsultasi">
      <div className="font-semibold text-ink mb-1">Butuh bantuan untuk kasus Anda?</div>
      <p className="text-sm text-ink-soft mb-3">
        Kasus spesifik sebaiknya ditangani advokat. Kami dapat menghubungkan Anda dengan
        layanan konsultasi hukum tepercaya.
      </p>
      <button
        type="button"
        className="inline-flex items-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
      >
        Konsultasi dengan advokat
      </button>
    </aside>
  );
}
