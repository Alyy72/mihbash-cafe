"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteNav } from "@/lib/nav";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function NavIndex({ size = "page" }: { size?: "page" | "overlay" }) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const links = siteNav(t);
  const large = size === "page";

  return (
    <nav
      aria-label={t.nav.menu}
      className={large ? "flex w-full items-baseline justify-between gap-4 overflow-x-auto" : "flex flex-col gap-4"}
    >
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`font-display leading-none tracking-wide transition-colors ${
              large ? "text-xl sm:text-2xl md:text-4xl" : "text-[2rem]"
            } ${active ? "text-silver" : "text-white hover:text-silver"}`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
