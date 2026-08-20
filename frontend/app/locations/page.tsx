"use client";

import Image from "next/image";
import { OrderPlatforms } from "@/components/OrderPlatforms";
import { InstagramIcon } from "@/components/InstagramIcon";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { place, reviews } from "@/lib/data/place";

function Stars({ count }: { count: number }) {
  return (
    <span className="tracking-tight text-[#fbbc04]" aria-label={`${count} stars`}>
      {"★".repeat(count)}
      <span className="text-white/20">{"★".repeat(5 - count)}</span>
    </span>
  );
}

export default function LocationsPage() {
  const { t, locale } = useLanguage();
  const shown = reviews.filter((review) => (locale === "ar" ? review.lang === "ar" : review.lang === "en"));
  const fallback = shown.length > 0 ? shown : reviews;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-8 md:px-6">
      <p className="text-[11px] uppercase tracking-[0.28em] text-silver">{t.visit.kicker}</p>
      <h1 className="mt-3 font-display text-5xl md:text-6xl">{t.visit.title}</h1>
      <p className="mt-4 max-w-xl text-sm leading-7 text-white/60">{t.visit.lead}</p>

      <div className="mt-8 flex flex-wrap items-center gap-6">
        <div>
          <p className="font-display text-5xl text-silver">{place.rating.toFixed(1)}</p>
          <Stars count={5} />
          <p className="mt-1 text-xs text-white/50">{t.visit.ratingMeta}</p>
        </div>
        <div className="text-sm leading-7 text-white/70">
          <p>
            <span className="text-white/45">{t.visit.addressLabel}: </span>
            {locale === "ar" ? place.addressAr : place.address}
          </p>
          <p>
            <span className="text-white/45">{t.visit.hours}: </span>
            {t.visit.everyday} · {t.visit.hoursValue}
          </p>
          <p>
            <a href={place.phoneHref} className="text-silver" dir="ltr">
              {place.phone}
            </a>
          </p>
          <p>
            <a
              href={place.instagram}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-silver"
            >
              <InstagramIcon />
              <span>{t.visit.instagram}</span>
              <span dir="ltr">@mihbash.ae</span>
            </a>
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href={place.directions}
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-silver px-5 py-2 text-[11px] uppercase tracking-[0.18em] text-navy"
        >
          {t.visit.directions}
        </a>
        <a
          href={place.mapsShort}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-white/20 px-5 py-2 text-[11px] uppercase tracking-[0.18em]"
        >
          {t.common.openMap}
        </a>
        <a
          href={place.photosUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-white/20 px-5 py-2 text-[11px] uppercase tracking-[0.18em]"
        >
          {t.visit.seePhotos}
        </a>
      </div>

      <section className="mt-12">
        <p className="text-[11px] uppercase tracking-[0.22em] text-silver">{t.visit.photos}</p>
        <div className="menu-card relative mt-4 aspect-[4/5] min-h-[320px] overflow-hidden md:aspect-[16/10]">
          <Image src="/brand/house.png" alt={t.visit.houseAlt} fill className="object-cover" />
        </div>
      </section>

      <section className="mt-12">
        <p className="text-[11px] uppercase tracking-[0.22em] text-silver">{t.visit.map}</p>
        <div className="menu-card mt-4 overflow-hidden">
          <iframe
            title={t.visit.mapTitle}
            src={locale === "ar" ? place.embedAr : place.embed}
            className="h-[380px] w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-silver">{t.visit.rating}</p>
            <h2 className="mt-2 font-display text-4xl">{t.visit.reviews}</h2>
          </div>
          <a
            href={place.reviewsUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] uppercase tracking-[0.18em] text-silver"
          >
            {t.visit.allReviews} →
          </a>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {fallback.map((review) => (
            <article key={`${review.name}-${review.text.slice(0, 24)}`} className="menu-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-xl">{review.name}</p>
                  <Stars count={review.stars} />
                </div>
                <p className="text-[11px] text-white/40">
                  {locale === "ar" ? review.dateAr || review.date : review.date}
                </p>
              </div>
              <p className="mt-3 text-sm leading-7 text-white/70" dir={review.lang === "ar" ? "rtl" : "ltr"}>
                {review.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <p className="text-[11px] uppercase tracking-[0.22em] text-silver">{t.visit.order}</p>
        <h2 className="mt-2 max-w-xl font-display text-4xl">{t.visit.orderLead}</h2>
        <div className="mt-6">
          <OrderPlatforms />
        </div>
      </section>
    </div>
  );
}
