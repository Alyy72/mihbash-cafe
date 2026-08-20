"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { place } from "@/lib/data/place";
import { InstagramIcon } from "@/components/InstagramIcon";

export function SiteFooter() {
  const { t, locale } = useLanguage();
  return (
    <footer className="mt-auto border-t border-white/10 bg-navy-deep">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <p className="text-[11px] uppercase tracking-[0.22em] text-silver">{t.footer.visit}</p>
        <p className="mt-4 max-w-md text-sm leading-7 text-white/70">
          {locale === "ar" ? place.addressAr : place.address}
          <br />
          {t.footer.hours}
        </p>
        <div className="mt-4 flex flex-col gap-2 text-sm">
          <a href={place.phoneHref} className="text-silver" dir="ltr">
            {place.phone}
          </a>
          <a
            href={place.instagram}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-white/70 hover:text-silver"
          >
            <InstagramIcon />
            @mihbash.ae
          </a>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 text-[11px] tracking-[0.08em] text-white/35 md:flex-row md:items-center md:justify-between md:px-6">
          <span>
            © {new Date().getFullYear()} {t.footer.copyright}
          </span>
          <span>
            {t.footer.credit}{" "}
            <a
              href="https://my-portfolio.alyyconnect.workers.dev"
              target="_blank"
              rel="noreferrer"
              className="font-semibold tracking-normal text-[#e10600] hover:underline"
            >
              alyyConnect
            </a>
          </span>
          <span>{t.footer.prices}</span>
        </div>
      </div>
    </footer>
  );
}
