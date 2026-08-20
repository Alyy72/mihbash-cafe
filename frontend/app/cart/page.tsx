"use client";

import Image from "next/image";
import Link from "next/link";
import { cartTotals, useCart } from "@/lib/cart";
import { formatMoney } from "@/lib/format";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function CartPage() {
  const items = useCart((s) => s.items);
  const setQuantity = useCart((s) => s.setQuantity);
  const removeItem = useCart((s) => s.removeItem);
  const { subtotal, tax, total } = cartTotals(items);
  const { t } = useLanguage();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 pb-24 pt-20 text-center">
        <h1 className="font-display text-5xl">{t.cart.empty}</h1>
        <p className="mt-4 text-sm text-white/55">{t.cart.emptyLead}</p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/menu" className="rounded-full bg-silver px-5 py-3 text-[12px] uppercase tracking-[0.2em] text-navy">
            {t.nav.menu}
          </Link>
          <Link href="/builder" className="rounded-full border border-white/20 px-5 py-3 text-[12px] uppercase tracking-[0.2em]">
            {t.nav.build}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-4 pb-24 pt-10 lg:grid-cols-12 md:px-6">
      <div className="lg:col-span-7">
        <h1 className="font-display text-5xl">{t.cart.title}</h1>
        <ul className="mt-10 divide-y divide-white/10 border-y border-white/10">
          {items.map((line) => (
            <li key={line.id} className="flex gap-4 py-6">
              <div className="relative h-24 w-24 flex-none overflow-hidden rounded-2xl bg-navy-deep">
                <Image src={line.image} alt={line.name} fill className="object-cover" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-display text-xl">{line.name}</h2>
                    {line.notes && (
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/45">{line.notes}</p>
                    )}
                  </div>
                  <span className="text-sm text-silver">{formatMoney(line.unitPrice * line.quantity)}</span>
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex items-center rounded-full border border-white/15">
                    <button type="button" className="px-3 py-1" onClick={() => setQuantity(line.id, line.quantity - 1)}>
                      –
                    </button>
                    <span className="min-w-6 text-center text-sm">{line.quantity}</span>
                    <button type="button" className="px-3 py-1" onClick={() => setQuantity(line.id, line.quantity + 1)}>
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    className="text-[11px] uppercase tracking-[0.16em] text-white/40 hover:text-silver"
                    onClick={() => removeItem(line.id)}
                  >
                    {t.cart.remove}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <aside className="ticket h-fit rounded-3xl p-6 lg:sticky lg:top-24 lg:col-span-5">
        <p className="text-[11px] uppercase tracking-[0.2em] text-navy/50">{t.cart.summary}</p>
        <dl className="mt-6 space-y-3 text-sm text-navy">
          <div className="flex justify-between">
            <dt>{t.cart.subtotal}</dt>
            <dd>{formatMoney(subtotal)}</dd>
          </div>
          <div className="flex justify-between text-navy/50">
            <dt>{t.cart.vat}</dt>
            <dd>{formatMoney(tax)}</dd>
          </div>
          <div className="flex justify-between border-t border-navy/15 pt-3 font-display text-2xl">
            <dt>{t.cart.total}</dt>
            <dd>{formatMoney(total)}</dd>
          </div>
        </dl>
        <Link
          href="/checkout"
          className="mt-8 block rounded-full bg-navy py-3 text-center text-[12px] uppercase tracking-[0.22em] text-white"
        >
          {t.cart.checkout}
        </Link>
      </aside>
    </div>
  );
}
