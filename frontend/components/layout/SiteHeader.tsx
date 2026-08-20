"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart, cartTotals } from "@/lib/cart";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { InstagramIcon } from "@/components/InstagramIcon";
import { NavIndex } from "@/components/NavIndex";
import { cafe } from "@/lib/data/site";
import { siteNav } from "@/lib/nav";

export function SiteHeader() {
  const pathname = usePathname();
  const items = useCart((s) => s.items);
  const [mounted, setMounted] = useState(false);
  const { count } = cartTotals(mounted ? items : []);
  const [open, setOpen] = useState(false);
  const { t, locale, setLocale } = useLanguage();
  const links = siteNav(t);

  useEffect(() => setMounted(true), []);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-navy/92 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-6">
        <Link
          href="/"
          className="min-w-0 shrink font-display text-2xl tracking-wide text-white md:text-[1.75rem]"
        >
          {t.brand.word}
        </Link>

        <nav className="hidden items-center gap-5 xl:flex">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[11px] tracking-[0.18em] ${
                  locale === "en" ? "uppercase" : ""
                } ${active ? "text-silver" : "text-white/70 hover:text-white"}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
          <a
            href={cafe.instagram}
            target="_blank"
            rel="noreferrer"
            className="flex h-9 w-9 items-center justify-center text-white/70 transition hover:text-silver"
            aria-label={`${t.footer.instagram} @mihbash.ae`}
          >
            <InstagramIcon className="h-4 w-4" />
          </a>
          <button
            type="button"
            onClick={() => setLocale(locale === "en" ? "ar" : "en")}
            className="h-9 shrink-0 rounded-full border border-white/20 px-3 text-[11px] uppercase leading-none tracking-[0.16em] text-silver transition hover:border-silver hover:text-white"
            aria-label="Switch language"
          >
            {locale === "en" ? "عربي" : "EN"}
          </button>
          <Link
            href="/cart"
            className={`flex h-9 shrink-0 items-center gap-1.5 px-1 text-[11px] tracking-[0.18em] text-silver transition hover:text-white ${
              locale === "en" ? "uppercase" : ""
            }`}
          >
            {t.nav.bag}
            {count > 0 && (
              <span className="min-w-4 text-center font-medium tabular-nums text-white">{count}</span>
            )}
          </Link>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-silver transition hover:border-silver hover:bg-white/5 hover:text-white active:scale-95 xl:hidden"
            aria-expanded={open}
            aria-label={open ? t.nav.close : t.nav.menu}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <span className="font-display text-xl leading-none">×</span>
            ) : (
              <span className="flex flex-col gap-[3px]" aria-hidden>
                <span className="block h-px w-3.5 bg-current" />
                <span className="block h-px w-3.5 bg-current" />
                <span className="block h-px w-3.5 bg-current" />
              </span>
            )}
          </button>
        </div>
      </div>

      {open && (
        <div className="mobile-nav border-t border-[#c9c8cc]/20 bg-navy/98 xl:hidden">
          <div className="mx-auto max-w-md px-6 py-8">
            <NavIndex size="overlay" />
          </div>
        </div>
      )}
    </header>
  );
}
