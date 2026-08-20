"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { cartTotals, useCart } from "@/lib/cart";
import { locations } from "@/lib/data/site";
import { formatMoney } from "@/lib/format";
import { apiPost } from "@/lib/api";
import { track } from "@/lib/analytics";
import type { CheckoutPayload, OrderConfirmation } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const { subtotal, tax, total } = cartTotals(items);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const { t } = useLanguage();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (items.length === 0) return;
    const form = new FormData(event.currentTarget);
    const payload: CheckoutPayload = {
      customer: {
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        phone: String(form.get("phone") ?? ""),
        dialCode: "971",
      },
      locationId: String(form.get("locationId") ?? "umm-suqeim"),
      fulfillment: (form.get("fulfillment") as "pickup" | "delivery") ?? "pickup",
      paymentGateway: (form.get("paymentGateway") as CheckoutPayload["paymentGateway"]) ?? "mock",
      notes: String(form.get("notes") ?? ""),
      items,
    };

    setPending(true);
    setError(null);
    track({ event: "checkout_submit", properties: { total, gateway: payload.paymentGateway } });

    try {
      const order = await apiPost<OrderConfirmation>("/api/v1/orders", payload);
      track({
        event: "purchase",
        properties: { orderId: order.orderId, total: order.total, orderNumber: order.orderNumber },
      });
      clear();
      router.push(`/order/confirmation/${order.orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.checkout.failed);
    } finally {
      setPending(false);
    }
  }

  useEffect(() => {
    track({ event: "checkout_start", properties: { itemCount: items.length, total } });
  }, [items.length, total]);

  useEffect(() => {
    if (items.length === 0) router.replace("/cart");
  }, [items.length, router]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-4 pb-24 pt-10 lg:grid-cols-12 md:px-6">
      <form onSubmit={onSubmit} className="space-y-8 lg:col-span-7">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-silver">{t.checkout.kicker}</p>
          <h1 className="mt-2 font-display text-5xl">{t.checkout.title}</h1>
        </div>

        <fieldset className="grid gap-4 sm:grid-cols-2">
          <Field label={t.checkout.name} name="name" required />
          <Field label={t.checkout.email} name="email" type="email" required />
          <Field label={t.checkout.phone} name="phone" required placeholder="501234567" />
          <label className="block sm:col-span-2">
            <span className="text-[11px] uppercase tracking-[0.16em] text-silver">{t.checkout.room}</span>
            <select
              name="locationId"
              defaultValue="umm-suqeim"
              className="mt-2 w-full rounded-2xl border border-white/15 bg-white/5 px-3 py-3 text-sm outline-none focus:border-silver"
            >
              {locations.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name} — {room.city}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.16em] text-silver">{t.checkout.fulfillment}</span>
            <select
              name="fulfillment"
              defaultValue="pickup"
              className="mt-2 w-full rounded-2xl border border-white/15 bg-white/5 px-3 py-3 text-sm outline-none focus:border-silver"
            >
              <option value="pickup">{t.checkout.pickup}</option>
              <option value="delivery">{t.checkout.delivery}</option>
            </select>
          </label>
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.16em] text-silver">{t.checkout.payment}</span>
            <select
              name="paymentGateway"
              defaultValue="mock"
              className="mt-2 w-full rounded-2xl border border-white/15 bg-white/5 px-3 py-3 text-sm outline-none focus:border-silver"
            >
              <option value="mock">{t.checkout.demoCard}</option>
              <option value="stripe">Stripe</option>
              <option value="ziina">Ziina</option>
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className="text-[11px] uppercase tracking-[0.16em] text-silver">{t.checkout.notes}</span>
            <textarea
              name="notes"
              rows={3}
              className="mt-2 w-full rounded-2xl border border-white/15 bg-white/5 px-3 py-3 text-sm outline-none focus:border-silver"
            />
          </label>
        </fieldset>

        {error && <p className="text-sm text-silver">{error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-silver px-8 py-3 text-[12px] uppercase tracking-[0.22em] text-navy disabled:opacity-50"
        >
          {pending ? t.checkout.authorising : `${t.checkout.pay} ${formatMoney(total)}`}
        </button>
        <p className="text-xs leading-5 text-white/45">{t.checkout.note}</p>
      </form>

      <aside className="ticket h-fit rounded-3xl p-6 lg:sticky lg:top-24 lg:col-span-5">
        <p className="text-[11px] uppercase tracking-[0.2em] text-navy/50">{t.checkout.order}</p>
        <ul className="mt-5 space-y-3 text-sm text-navy">
          {items.map((line) => (
            <li key={line.id} className="flex justify-between gap-4">
              <span>
                {line.quantity} × {line.name}
              </span>
              <span>{formatMoney(line.unitPrice * line.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-6 space-y-2 border-t border-navy/15 pt-4 text-sm text-navy">
          <div className="flex justify-between">
            <dt>{t.cart.subtotal}</dt>
            <dd>{formatMoney(subtotal)}</dd>
          </div>
          <div className="flex justify-between text-navy/50">
            <dt>{t.cart.vat}</dt>
            <dd>{formatMoney(tax)}</dd>
          </div>
          <div className="flex justify-between font-display text-2xl">
            <dt>{t.cart.total}</dt>
            <dd>{formatMoney(total)}</dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.16em] text-silver">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-white/15 bg-white/5 px-3 py-3 text-sm outline-none focus:border-silver"
      />
    </label>
  );
}
