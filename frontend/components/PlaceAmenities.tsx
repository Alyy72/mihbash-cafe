"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function PlaceAmenities() {
  const { t } = useLanguage();
  const groups = t.amenities;

  return (
    <div className="grid grid-cols-2 gap-x-10 gap-y-8">
      {Object.entries(groups).map(([key, group]) => (
        <div key={key}>
          <p className="text-[11px] uppercase tracking-[0.22em] text-silver">{group.title}</p>
          <p className="mt-2 text-sm leading-6 text-white/70">{group.items.join(", ")}</p>
        </div>
      ))}
    </div>
  );
}
