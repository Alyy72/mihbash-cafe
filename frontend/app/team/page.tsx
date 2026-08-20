"use client";

import Image from "next/image";
import { team } from "@/lib/data/site";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function TeamPage() {
  const { t } = useLanguage();
  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-8 md:px-6">
      <p className="text-[11px] uppercase tracking-[0.28em] text-silver">{t.team.kicker}</p>
      <h1 className="mt-3 max-w-3xl font-display text-5xl md:text-6xl">{t.team.title}</h1>
      <p className="mt-5 max-w-xl text-sm leading-7 text-white/60">{t.team.lead}</p>
      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {team.map((person) => {
          const copy = t.team.members[person.id as keyof typeof t.team.members];
          return (
          <article key={person.id} className="menu-card">
            <div className="relative aspect-[4/5]">
              <Image src={person.image} alt={copy.name} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="text-[11px] uppercase tracking-[0.18em] text-silver">
                  {copy.department}
                </p>
                <h2 className="font-display text-3xl">{copy.name}</h2>
                <p className="mt-1 text-sm text-white/80">{copy.role}</p>
              </div>
            </div>
            <p className="p-5 text-sm leading-7 text-white/60">{copy.bio}</p>
          </article>
          );
        })}
      </div>
    </div>
  );
}
