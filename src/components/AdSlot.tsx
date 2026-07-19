"use client";
import { useEffect } from "react";
import { siteConfig } from "@/lib/siteConfig";

declare global {
  interface Window { adsbygoogle?: unknown[] }
}

/**
 * Unit iklan AdSense. Merender <ins class="adsbygoogle"> hanya bila slot terisi
 * (isi ID di siteConfig.adsense.slots). Jika kosong -> tidak merender apa pun,
 * sehingga tanpa slot pun layout tetap bersih (Auto Ads tetap jalan via skrip akun).
 */
export function AdSlot({ slot, className = "" }: { slot: string; className?: string }) {
  useEffect(() => {
    if (!slot) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* noop */
    }
  }, [slot]);

  if (!siteConfig.adsense.client || !slot) return null;

  return (
    <div className={`my-6 ${className}`} aria-label="Iklan">
      <div className="mb-1 text-[10px] uppercase tracking-wide text-ink-muted">Iklan</div>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={siteConfig.adsense.client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
