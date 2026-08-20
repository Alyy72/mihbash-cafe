"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { shopCategories, shopProducts } from "@/lib/data/shop";
import type { ShopCategory } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { track } from "@/lib/analytics";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { localized } from "@/lib/data/catalog";

export default function ShopPage() {
  const [category, setCategory] = useState<ShopCategory | "all">("all");
  const addItem = useCart((s) => s.addItem);
  const { t, locale } = useLanguage();
  const products = useMemo(
    () => shopProducts.filter((p) => category === "all" || p.category === category),
    [category],
  );

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-8 md:px-6">
      <p className="text-[11px] uppercase tracking-[0.28em] text-silver">{t.shop.kicker}</p>
      <h1 className="mt-3 font-display text-5xl md:text-6xl">{t.shop.title}</h1>
      <p className="mt-4 max-w-xl text-sm leading-7 text-white/60">{t.shop.lead}</p>

      <div className="mt-8 flex flex-wrap gap-2">
        <Filter active={category === "all"} onClick={() => setCategory("all")}>
          {t.shop.all}
        </Filter>
        {shopCategories.map((c) => (
          <Filter key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
            {t.shop[c.labelKey]}
          </Filter>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3">
        {products.map((product) => {
          const name = localized(locale, product.name, product.nameAr);
          return (
            <article key={product.id} className="menu-card flex flex-col">
              <div className="relative aspect-square">
                <Image src={product.image} alt={name} fill className="object-cover" />
              </div>
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-display text-xl leading-tight">{name}</h2>
                  <span className="text-sm text-silver">{formatMoney(product.price)}</span>
                </div>
                <p className="mt-2 line-clamp-3 flex-1 text-xs leading-5 text-white/55">
                  {localized(locale, product.description, product.descriptionAr)}
                </p>
                <button
                  type="button"
                  className="mt-4 self-start text-[11px] uppercase tracking-[0.16em] text-silver"
                  onClick={() => {
                    addItem({
                      kind: "shop",
                      sku: product.sku,
                      name,
                      unitPrice: product.price,
                      image: product.image,
                      foodicsProductId: product.foodicsProductId,
                    });
                    track({
                      event: "add_to_cart",
                      properties: { sku: product.sku, name: product.name, price: product.price },
                    });
                  }}
                >
                  {t.menu.add}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function Filter({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-[11px] uppercase tracking-[0.16em] ${
        active ? "bg-silver text-navy" : "border border-white/20 text-white/70"
      }`}
    >
      {children}
    </button>
  );
}
