import { Markdown } from "./Markdown";
import type { FaqItem } from "@/lib/content";

/** Daftar FAQ (juga dipakai untuk FAQPage JSON-LD di halaman). */
export function Faq({ items }: { items: FaqItem[] }) {
  if (!items || items.length === 0) return null;
  return (
    <section className="mt-10" id="faq">
      <h2 className="text-xl font-bold text-ink mb-4">Pertanyaan yang Sering Diajukan</h2>
      <div className="divide-y divide-brand-100 rounded-xl border border-brand-100 bg-white">
        {items.map((item, i) => (
          <details key={i} className="group p-4" {...(i === 0 ? { open: true } : {})}>
            <summary className="cursor-pointer list-none font-semibold text-ink flex items-center justify-between gap-2">
              <span>{item.question}</span>
              <span className="text-brand-500 transition-transform group-open:rotate-45 text-xl leading-none">
                +
              </span>
            </summary>
            <div className="mt-2 text-sm">
              <Markdown>{item.answer}</Markdown>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
