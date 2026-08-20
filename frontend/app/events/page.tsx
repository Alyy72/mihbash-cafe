"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { eventCopy } from "@/lib/i18n/dictionary";

const hours = ["open", "breakfast", "lunch", "pancakes"] as const;

export default function EventsPage() {
  const { t } = useLanguage();
  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-8 md:px-6">
      <p className="text-[11px] uppercase tracking-[0.28em] text-silver">{t.events.kicker}</p>
      <h1 className="mt-3 font-display text-5xl md:text-6xl">{t.events.title}</h1>
      <p className="mt-4 max-w-xl text-sm leading-7 text-white/60">{t.events.lead}</p>
      <ul className="mt-12 space-y-2">
        {hours.map((id) => {
          const copy = eventCopy(t, id);
          if (!copy) return null;
          return (
            <li key={id} className="menu-card grid gap-4 p-6 md:grid-cols-12 md:items-start">
              <div className="md:col-span-3">
                <p className="font-display text-2xl">{copy.time}</p>
              </div>
              <div className="md:col-span-9">
                <p className="text-[11px] uppercase tracking-[0.18em] text-silver">{copy.kind}</p>
                <h3 className="mt-1 font-display text-2xl">{copy.title}</h3>
                <p className="mt-2 text-sm leading-7 text-white/60">{copy.description}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
