import { Markdown } from "./Markdown";
import type { Section } from "@/lib/content";

const STEP_LABELS: Record<number, string> = {
  1: "Diagnosis Situasi",
  2: "Hak Anda",
  3: "Ke Mana & Kapan",
  4: "Dokumen & Bukti",
  5: "Jebakan yang Harus Dihindari",
};

/** Satu section artikel. STEP mendapat penanda nomor bergaya. */
export function StepSection({ section }: { section: Section }) {
  const isStep = section.kind === "step" && section.stepIndex;
  // Judul tanpa prefiks "STEP n —" karena ditampilkan sebagai badge terpisah.
  const cleanHeading = section.heading.replace(/^step\s*\d+\s*[—\-:]*\s*/i, "").trim();

  return (
    <section className="scroll-mt-20" id={isStep ? `step-${section.stepIndex}` : undefined}>
      {isStep ? (
        <div className="flex items-start gap-3 mt-8 mb-2">
          <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white font-bold text-sm">
            {section.stepIndex}
          </span>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-brand-600">
              Langkah {section.stepIndex}
            </div>
            <h2 className="text-xl font-bold text-ink leading-tight">
              {cleanHeading || STEP_LABELS[section.stepIndex!] || section.heading}
            </h2>
          </div>
        </div>
      ) : (
        <h2 className="text-xl font-bold text-ink mt-8 mb-2">{section.heading}</h2>
      )}
      <div className={isStep ? "sm:pl-12" : ""}>
        <Markdown>{section.body}</Markdown>
      </div>
    </section>
  );
}
