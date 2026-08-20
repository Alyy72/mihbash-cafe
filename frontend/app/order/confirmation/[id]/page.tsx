"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import type { OrderConfirmation } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function ConfirmationPage() {
  const params = useParams<{ id: string }>();
  const { t, locale } = useLanguage();
  const [order, setOrder] = useState<OrderConfirmation | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<OrderConfirmation>(`/api/v1/orders/${params.id}`)
      .then(setOrder)
      .catch((err: Error) => setError(err.message));
  }, [params.id]);

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-5 pt-36 text-center">
        <h1 className="font-display text-4xl">{t.confirm.missing}</h1>
        <p className="mt-3 text-sm text-white/55">{error}</p>
        <Link href="/menu" className="mt-8 inline-block text-silver">
          {t.confirm.back}
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-xl px-5 pt-36 text-center text-white/50">{t.confirm.loading}</div>
    );
  }

  const receipt = order.receipt;
  const time = new Date(order.estimatedReadyAt).toLocaleTimeString(locale === "ar" ? "ar-AE" : "en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-10 md:px-6">
      <p className="text-[11px] uppercase tracking-[0.28em] text-silver">{t.confirm.kicker}</p>
      <h1 className="mt-3 font-display text-5xl">{t.confirm.title}</h1>
      <p className="mt-4 text-sm leading-7 text-white/60">
        {t.checkout.order} {order.orderNumber} · {time} · {order.locationName}
      </p>

      <article className="ticket mt-10 rounded-3xl p-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-display text-2xl">{t.brand.full}</p>
            <p className="text-xs text-navy/50">{receipt.location}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-[0.16em] text-navy/50">{t.confirm.receipt}</p>
            <p className="font-mono text-sm">{receipt.number}</p>
          </div>
        </div>
        <p className="mt-4 text-xs text-navy/50">
          {new Date(receipt.issuedAt).toLocaleString(locale === "ar" ? "ar-AE" : "en-GB")} · {receipt.customer}
        </p>
        <ul className="mt-6 space-y-2 border-y border-dashed border-navy/20 py-5 text-sm">
          {receipt.lines.map((line) => (
            <li key={line.name + line.quantity} className="flex justify-between gap-4">
              <span>
                {line.quantity} × {line.name}
              </span>
              <span>{formatMoney(line.total, receipt.currency)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-1 text-sm">
          <div className="flex justify-between">
            <dt>{t.cart.subtotal}</dt>
            <dd>{formatMoney(receipt.subtotal, receipt.currency)}</dd>
          </div>
          <div className="flex justify-between text-navy/50">
            <dt>{t.cart.vat}</dt>
            <dd>{formatMoney(receipt.tax, receipt.currency)}</dd>
          </div>
          <div className="flex justify-between border-t border-ink pt-3 font-display text-2xl">
            <dt>{t.cart.total}</dt>
            <dd>{formatMoney(receipt.total, receipt.currency)}</dd>
          </div>
        </dl>
        <p className="mt-6 text-xs uppercase tracking-[0.16em] text-navy/45">
          {t.confirm.paidVia} {receipt.paymentMethod} · {order.paymentStatus}
        </p>
      </article>

      <div className="no-print mt-8 flex gap-4">
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-full border border-white/20 px-5 py-3 text-[12px] uppercase tracking-[0.2em]"
        >
          {t.confirm.print}
        </button>
        <Link href="/menu" className="px-5 py-3 text-[12px] uppercase tracking-[0.2em] text-silver">
          {t.confirm.again}
        </Link>
      </div>
    </div>
  );
}
