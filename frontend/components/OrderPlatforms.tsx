"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { orderPlatforms } from "@/lib/data/place";

export function OrderPlatforms({ compact = false }: { compact?: boolean }) {
  const { t } = useLanguage();
  const copy = {
    talabat: { name: t.platforms.talabat, hint: t.platforms.talabatHint },
    deliveroo: { name: t.platforms.deliveroo, hint: t.platforms.deliverooHint },
    beanz: { name: t.platforms.beanz, hint: t.platforms.beanzHint },
  };

  return (
    <div className={compact ? "grid gap-3 sm:grid-cols-3" : "grid gap-4 md:grid-cols-3"}>
      {orderPlatforms.map((platform) => {
        const labels = copy[platform.id];
        return (
          <a
            key={platform.id}
            href={platform.href}
            target="_blank"
            rel="noopener noreferrer"
            className="menu-card group p-5 transition hover:border-silver/50"
          >
            <p className="font-display text-2xl text-white">{labels.name}</p>
            <p className="mt-1 text-xs leading-5 text-white/55">{labels.hint}</p>
          </a>
        );
      })}
    </div>
  );
}
