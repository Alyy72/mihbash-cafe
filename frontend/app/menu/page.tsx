"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  categoryPhoto,
  diningMenu,
  drinksMenu,
  localized,
  menus,
  productPhoto,
  skuFor,
  type CatalogCategory,
  type CatalogMenu,
  type CatalogProduct,
} from "@/lib/data/catalog";
import { formatMoney } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { track } from "@/lib/analytics";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { Locale } from "@/lib/i18n/dictionary";

export default function MenuPage() {
  const { t } = useLanguage();
  return (
    <Suspense fallback={<div className="px-4 py-20 text-center text-white/50">{t.menu.loading}</div>}>
      <MenuExplorer />
    </Suspense>
  );
}

function MenuExplorer() {
  const params = useSearchParams();
  const router = useRouter();
  const addItem = useCart((s) => s.addItem);
  const { t, locale } = useLanguage();

  const boardId = Number(params.get("board") || 0);
  const catId = Number(params.get("cat") || 0);

  const board = menus.find((m) => m.id === boardId);
  const category = board?.categories.find((c) => c.id === catId);

  function go(next: { board?: number; cat?: number }) {
    const q = new URLSearchParams();
    if (next.board) q.set("board", String(next.board));
    if (next.cat) q.set("cat", String(next.cat));
    const qs = q.toString();
    router.push(qs ? `/menu?${qs}` : "/menu");
  }

  const title = useMemo(() => {
    if (category) return localized(locale, category.name, category.nameAr);
    if (board) return localized(locale, board.name, board.nameAr);
    return t.menu.title;
  }, [board, category, locale, t.menu.title]);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-8 md:px-6">
      <div className="mb-8 flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-white/50">
        <button type="button" onClick={() => go({})} className="hover:text-silver">
          {t.menu.crumbHome}
        </button>
        {board && (
          <>
            <span>/</span>
            <button type="button" onClick={() => go({ board: board.id })} className="hover:text-silver">
              {localized(locale, board.name, board.nameAr)}
            </button>
          </>
        )}
        {category && (
          <>
            <span>/</span>
            <span className="text-silver">{localized(locale, category.name, category.nameAr)}</span>
          </>
        )}
      </div>

      <p className="text-[11px] uppercase tracking-[0.28em] text-silver">{t.menu.live}</p>
      <h1 className="mt-2 font-display text-5xl capitalize md:text-6xl">{title}</h1>
      <p className="mt-3 max-w-xl text-sm leading-7 text-white/60">{t.menu.lead}</p>

      {!board && (
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {[drinksMenu, diningMenu].map((menu) => (
            <button
              key={menu.id}
              type="button"
              onClick={() => go({ board: menu.id })}
              className="menu-card relative min-h-[240px] text-start"
            >
              <Image
                src={menu.banner || categoryPhoto(menu.categories[0])}
                alt={localized(locale, menu.name, menu.nameAr)}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/30 to-transparent" />
              <div className="absolute bottom-0 p-6">
                <p className="text-[11px] uppercase tracking-[0.2em] text-silver">
                  {menu.categories.length} {t.menu.categories}
                </p>
                <h2 className="font-display text-4xl">{localized(locale, menu.name, menu.nameAr)}</h2>
              </div>
            </button>
          ))}
          <Link href="/shop" className="menu-card relative min-h-[240px]">
            <Image src="/brand/drinks-banner.jpg" alt={t.nav.bakery} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/30 to-transparent" />
            <div className="absolute bottom-0 p-6">
              <p className="text-[11px] uppercase tracking-[0.2em] text-silver">{t.shop.kicker}</p>
              <h2 className="font-display text-4xl">{t.nav.bakery}</h2>
            </div>
          </Link>
          <Link href="/team" className="menu-card relative min-h-[240px]">
            <Image src="/brand/house.png" alt={t.nav.house} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/30 to-transparent" />
            <div className="absolute bottom-0 p-6">
              <p className="text-[11px] uppercase tracking-[0.2em] text-silver">{t.team.kicker}</p>
              <h2 className="font-display text-4xl">{t.nav.house}</h2>
            </div>
          </Link>
        </div>
      )}

      {board && !category && (
        <CategoryGrid
          menu={board}
          locale={locale}
          itemsLabel={t.menu.items}
          onOpen={(id) => go({ board: board.id, cat: id })}
        />
      )}

      {board && category && (
        <ProductGrid
          category={category}
          locale={locale}
          addLabel={t.menu.add}
          bestsellerLabel={t.menu.bestseller}
          newLabel={t.menu.new}
          onAdd={(product) => {
            addItem({
              kind: "menu",
              sku: skuFor(product),
              name: localized(locale, product.name, product.nameAr),
              unitPrice: product.price ?? 0,
              image: productPhoto(product),
              notes: localized(locale, product.description, product.descriptionAr) || undefined,
              foodicsProductId: `FOODICS_${product.id}`,
            });
            track({
              event: "add_to_cart",
              properties: { sku: skuFor(product), name: product.name, price: product.price },
            });
          }}
        />
      )}
    </div>
  );
}

function CategoryGrid({
  menu,
  onOpen,
  locale,
  itemsLabel,
}: {
  menu: CatalogMenu;
  onOpen: (id: number) => void;
  locale: Locale;
  itemsLabel: string;
}) {
  return (
    <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3">
      {menu.categories.map((category) => {
        const name = localized(locale, category.name, category.nameAr);
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onOpen(category.id)}
            className="menu-card text-start"
          >
            <div className="relative aspect-square bg-navy-deep">
              {category.image || category.products.find((p) => p.image) ? (
                <Image src={categoryPhoto(category)} alt={name} fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-silver">{name}</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-navy/85 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3">
                <h2 className="font-display text-xl capitalize leading-tight">{name}</h2>
                <p className="text-[11px] text-white/55">
                  {category.products.length} {itemsLabel}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function ProductGrid({
  category,
  onAdd,
  locale,
  addLabel,
  bestsellerLabel,
  newLabel,
}: {
  category: CatalogCategory;
  onAdd: (product: CatalogProduct) => void;
  locale: Locale;
  addLabel: string;
  bestsellerLabel: string;
  newLabel: string;
}) {
  return (
    <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3">
      {category.products.map((product) => {
        const name = localized(locale, product.name, product.nameAr);
        return (
          <article key={product.id} className="menu-card flex flex-col">
            <div className="relative aspect-square bg-navy-deep">
              {product.image || product.thumb ? (
                <Image src={productPhoto(product)} alt={name} fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center px-4 text-center font-display text-2xl text-silver">
                  {name}
                </div>
              )}
              <div className="absolute left-2 top-2 flex flex-col gap-1">
                {product.bestseller && <Chip>{bestsellerLabel}</Chip>}
                {product.new && <Chip>{newLabel}</Chip>}
              </div>
            </div>
            <div className="flex flex-1 flex-col p-3">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-display text-lg leading-tight">{name}</h2>
                <span className="shrink-0 text-sm text-silver">
                  {product.price != null ? formatMoney(product.price) : ""}
                </span>
              </div>
              {product.variants.length > 0 && (
                <p className="mt-1 text-[11px] text-white/45">
                  {product.variants
                    .map((v) => `${localized(locale, v.name, v.nameAr)} ${formatMoney(v.price)}`)
                    .join(" · ")}
                </p>
              )}
              {product.description && (
                <p className="mt-2 line-clamp-3 flex-1 text-[12px] leading-5 text-white/55">
                  {localized(locale, product.description, product.descriptionAr)}
                </p>
              )}
              <button
                type="button"
                className="mt-3 self-start text-[11px] uppercase tracking-[0.16em] text-silver"
                onClick={() => onAdd(product)}
              >
                {addLabel}
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function Chip({ children }: { children: string }) {
  return (
    <span className="rounded-full bg-navy/80 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-silver">
      {children}
    </span>
  );
}
