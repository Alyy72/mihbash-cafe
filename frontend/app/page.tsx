"use client";

import Image from "next/image";
import Link from "next/link";
import {
  bestsellers,
  categoryPhoto,
  diningMenu,
  drinksBanner,
  drinksMenu,
  localized,
  newItems,
  productPhoto,
} from "@/lib/data/catalog";
import { formatMoney } from "@/lib/format";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { OrderPlatforms } from "@/components/OrderPlatforms";
import { NavIndex } from "@/components/NavIndex";
import { PlaceAmenities } from "@/components/PlaceAmenities";

export default function HomePage() {
  const { t, locale } = useLanguage();
  const sipId = 232434;
  const pool = [...bestsellers, ...newItems.filter((item) => !item.bestseller)];
  const sip = pool.find((item) => item.id === sipId);
  const homeSignatures = sip
    ? [...pool.filter((item) => item.id !== sipId).slice(0, 5), sip]
    : pool.slice(0, 6);

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="relative mx-auto max-w-6xl px-4 pt-8 md:px-6 md:pt-12">
          <NavIndex />
          <div className="menu-card relative mt-8 aspect-[4/5] min-h-[280px] md:mt-10 md:aspect-[16/9]">
            <Image
              src="/brand/hero.png"
              alt={t.brand.full}
              fill
              priority
              className="object-cover object-center"
            />
          </div>
          <div className="mt-8 text-center">
            <p className="text-[11px] uppercase tracking-[0.32em] text-silver">{t.home.kicker}</p>
            <h1 className="mt-3 font-display text-5xl md:text-7xl">{t.brand.word}</h1>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-white/70">{t.home.lead}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-6xl px-4 md:px-6">
        <p className="text-[11px] uppercase tracking-[0.22em] text-silver">{t.home.orderNow}</p>
        <h2 className="mt-2 font-display text-3xl md:text-4xl">{t.home.orderLead}</h2>
        <div className="mt-6">
          <OrderPlatforms compact />
        </div>
      </section>

      <section className="mx-auto mt-14 grid max-w-6xl gap-4 px-4 md:grid-cols-2 md:px-6">
        <MenuTile
          href={`/menu?board=${drinksMenu.id}`}
          title={localized(locale, drinksMenu.name, drinksMenu.nameAr)}
          count={`${drinksMenu.categories.length} ${t.menu.categories}`}
          image={drinksMenu.banner || drinksBanner}
        />
        <MenuTile
          href={`/menu?board=${diningMenu.id}`}
          title={localized(locale, diningMenu.name, diningMenu.nameAr)}
          count={`${diningMenu.categories.length} ${t.menu.categories}`}
          image={categoryPhoto(diningMenu.categories[0])}
        />
      </section>

      <section className="mx-auto mt-16 max-w-6xl px-4 md:px-6">
        <p className="text-[11px] uppercase tracking-[0.22em] text-silver">{t.home.signatures}</p>
        <h2 className="mt-2 font-display text-4xl">{t.home.bestsellers}</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {homeSignatures.map((item) => (
            <article key={item.id} className="menu-card">
              <div className="relative aspect-[4/5]">
                <Image
                  src={productPhoto(item)}
                  alt={localized(locale, item.name, item.nameAr)}
                  fill
                  className="object-cover"
                />
                <div className="absolute left-3 top-3 flex gap-2">
                  {item.bestseller && <Badge>{t.menu.bestseller}</Badge>}
                  {item.new && <Badge>{t.menu.new}</Badge>}
                </div>
              </div>
              <div className="flex items-start justify-between gap-3 p-4">
                <div>
                  <h3 className="font-display text-xl leading-tight">
                    {localized(locale, item.name, item.nameAr)}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/55">
                    {localized(locale, item.description, item.descriptionAr)}
                  </p>
                </div>
                <span className="shrink-0 text-sm text-silver">
                  {item.price != null ? formatMoney(item.price) : ""}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-6xl px-4 pb-20 md:px-6">
        <PlaceAmenities />
      </section>
    </>
  );
}

function Badge({ children }: { children: string }) {
  return (
    <span className="rounded-full bg-navy/80 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-silver">
      {children}
    </span>
  );
}

function MenuTile({
  href,
  title,
  count,
  image,
}: {
  href: string;
  title: string;
  count: string;
  image: string;
}) {
  return (
    <Link href={href} className="menu-card group relative min-h-[220px]">
      <Image src={image} alt={title} fill className="object-cover opacity-80 transition group-hover:opacity-100" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-6">
        <p className="text-[11px] uppercase tracking-[0.2em] text-silver">{count}</p>
        <h2 className="mt-1 font-display text-4xl">{title}</h2>
      </div>
    </Link>
  );
}
