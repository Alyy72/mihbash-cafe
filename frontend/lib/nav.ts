import type { Dictionary } from "@/lib/i18n/dictionary";

export function siteNav(t: Dictionary) {
  return [
    { href: "/", label: t.nav.home },
    { href: "/menu", label: t.nav.menu },
    { href: "/locations", label: t.nav.location },
    { href: "/collaborate", label: t.nav.collab },
    { href: "/events", label: t.nav.hours },
  ];
}
