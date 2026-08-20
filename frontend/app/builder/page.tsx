"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  beans,
  buildModifiers,
  customFoodicsProduct,
  defaultDishBuild,
  defaultDrinkBuild,
  describeCustomBuild,
  dishExtras,
  dishGrains,
  dishProteins,
  dishSauces,
  drinkBases,
  drinkExtras,
  milks,
  priceCustomBuild,
  syrups,
  temperatures,
} from "@/lib/data/builder";
import { localized } from "@/lib/data/catalog";
import type { BuilderMode, BuilderOption, CustomBuild } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { track } from "@/lib/analytics";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { builderOptionCopy, type Dictionary } from "@/lib/i18n/dictionary";

function optionCopy(option: BuilderOption, t: Dictionary, locale: "en" | "ar") {
  const hit = builderOptionCopy(t, option.id);
  return {
    label: hit?.label ?? localized(locale, option.label, option.labelAr),
    detail: hit?.detail ?? localized(locale, option.detail, option.detailAr),
  };
}

export default function BuilderPage() {
  const [mode, setMode] = useState<BuilderMode>("drink");
  const [build, setBuild] = useState<CustomBuild>(defaultDrinkBuild);
  const addItem = useCart((s) => s.addItem);
  const price = useMemo(() => priceCustomBuild(build), [build]);
  const { t, locale } = useLanguage();
  const labelOf = (option: BuilderOption) => optionCopy(option, t, locale).label;
  const summary = useMemo(
    () => describeCustomBuild(build, labelOf),
    [build, locale, t],
  );

  useEffect(() => {
    track({
      event: "custom_build_change",
      properties: { mode: build.mode, configuration: build, price },
    });
  }, [build, price]);

  function switchMode(next: BuilderMode) {
    setMode(next);
    setBuild(next === "drink" ? defaultDrinkBuild : defaultDishBuild);
  }

  function addToBag() {
    const base = drinkBases.find((b) => b.id === build.baseId);
    const name =
      mode === "drink"
        ? `${t.builder.customDrink}${base ? ` · ${labelOf(base)}` : ""}`
        : t.builder.customPlate;
    addItem({
      kind: "custom",
      sku: mode === "drink" ? "CUSTOM-DRINK" : "CUSTOM-DISH",
      name,
      unitPrice: price,
      image: mode === "drink" ? "/brand/drinks-banner.jpg" : "/brand/banner.jpg",
      notes: build.notes || summary,
      configuration: build,
      foodicsProductId: customFoodicsProduct[mode],
      modifiers: buildModifiers(build),
    });
    track({
      event: "custom_build_add",
      properties: { mode, configuration: build, price, summary },
    });
  }

  return (
    <div className="pb-24 pt-8">
      <header className="mx-auto max-w-6xl px-4 md:px-6">
        <p className="text-[11px] uppercase tracking-[0.28em] text-silver">{t.builder.kicker}</p>
        <h1 className="mt-3 font-display text-5xl md:text-6xl">{t.builder.title}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60">{t.builder.lead}</p>
        <div className="mt-8 flex gap-2">
          <ModeBtn active={mode === "drink"} onClick={() => switchMode("drink")}>
            {t.builder.drink}
          </ModeBtn>
          <ModeBtn active={mode === "dish"} onClick={() => switchMode("dish")}>
            {t.builder.plate}
          </ModeBtn>
        </div>
      </header>

      <div className="mx-auto mt-12 grid max-w-6xl gap-10 px-4 lg:grid-cols-[1fr_360px] md:px-6">
        <div className="space-y-12">
          {mode === "drink" ? (
            <>
              <OptionGroup
                step="01"
                title={t.builder.steps.base}
                options={drinkBases}
                value={build.baseId}
                incl={t.builder.incl}
                onChange={(id) => setBuild({ ...build, baseId: id })}
              />
              <OptionGroup
                step="02"
                title={t.builder.steps.lot}
                options={beans}
                value={build.beanId}
                incl={t.builder.incl}
                onChange={(id) => setBuild({ ...build, beanId: id })}
              />
              <OptionGroup
                step="03"
                title={t.builder.steps.milk}
                options={milks}
                value={build.milkId}
                incl={t.builder.incl}
                onChange={(id) => setBuild({ ...build, milkId: id })}
              />
              <MultiGroup
                step="04"
                title={t.builder.steps.syrups}
                options={syrups.filter((s) => s.id !== "none")}
                values={build.syrupIds}
                onChange={(syrupIds) => setBuild({ ...build, syrupIds })}
              />
              <OptionGroup
                step="05"
                title={t.builder.steps.temperature}
                options={temperatures}
                value={build.temperatureId}
                incl={t.builder.incl}
                onChange={(id) => setBuild({ ...build, temperatureId: id })}
              />
              <MultiGroup
                step="06"
                title={t.builder.steps.extras}
                options={drinkExtras}
                values={build.extraIds}
                onChange={(extraIds) => setBuild({ ...build, extraIds })}
              />
            </>
          ) : (
            <>
              <OptionGroup
                step="01"
                title={t.builder.steps.bowl}
                options={dishGrains}
                value={build.grainId}
                incl={t.builder.incl}
                onChange={(id) => setBuild({ ...build, grainId: id })}
              />
              <OptionGroup
                step="02"
                title={t.builder.steps.protein}
                options={dishProteins}
                value={build.proteinId}
                incl={t.builder.incl}
                onChange={(id) => setBuild({ ...build, proteinId: id })}
              />
              <OptionGroup
                step="03"
                title={t.builder.steps.sauce}
                options={dishSauces}
                value={build.sauceId}
                incl={t.builder.incl}
                onChange={(id) => setBuild({ ...build, sauceId: id })}
              />
              <MultiGroup
                step="04"
                title={t.builder.steps.addons}
                options={dishExtras}
                values={build.extraIds}
                onChange={(extraIds) => setBuild({ ...build, extraIds })}
              />
            </>
          )}

          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.2em] text-silver">{t.builder.notes}</span>
            <textarea
              value={build.notes}
              onChange={(e) => setBuild({ ...build, notes: e.target.value })}
              rows={3}
              placeholder={t.builder.notesPlaceholder}
              className="mt-3 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm outline-none focus:border-silver"
            />
          </label>
        </div>

        <aside className="lg:sticky lg:top-28 h-fit">
          <div className="ticket rounded-3xl p-6">
            <p className="text-[11px] uppercase tracking-[0.22em] text-navy/50">{t.builder.ticket}</p>
            <h2 className="mt-2 font-display text-3xl text-navy">
              {mode === "drink" ? t.builder.customDrink : t.builder.customPlate}
            </h2>
            <p className="mt-3 text-sm leading-6 text-navy/70">{summary}</p>
            {build.notes && (
              <p className="mt-3 border-t border-dashed border-navy/20 pt-3 text-sm italic text-navy/50">
                “{build.notes}”
              </p>
            )}
            <div className="mt-8 flex items-end justify-between border-t border-navy pt-4">
              <span className="text-[11px] uppercase tracking-[0.18em] text-navy/50">{t.builder.liveTotal}</span>
              <span className="font-display text-4xl text-navy">{formatMoney(price)}</span>
            </div>
            <button
              type="button"
              onClick={addToBag}
              className="mt-6 w-full rounded-full bg-navy py-3 text-[12px] uppercase tracking-[0.22em] text-white"
            >
              {t.menu.add}
            </button>
            <p className="mt-3 text-center text-[11px] leading-5 text-navy/45">{t.builder.vatNote}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ModeBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-5 py-2 text-[12px] uppercase tracking-[0.2em] ${
        active ? "rounded-full bg-silver text-navy" : "rounded-full border border-white/20"
      }`}
    >
      {children}
    </button>
  );
}

function OptionGroup({
  step,
  title,
  options,
  value,
  onChange,
  incl,
}: {
  step: string;
  title: string;
  options: BuilderOption[];
  value?: string;
  onChange: (id: string) => void;
  incl: string;
}) {
  const { t, locale } = useLanguage();
  return (
    <section>
      <div className="mb-4 flex items-baseline gap-3">
        <span className="font-display text-silver">{step}</span>
        <h2 className="font-display text-2xl">{title}</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const selected = option.id === value;
          const copy = optionCopy(option, t, locale);
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={`rounded-2xl border p-4 text-start transition-colors ${
                selected ? "border-silver bg-white/10" : "border-white/15 hover:border-silver"
              }`}
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-display text-lg">{copy.label}</span>
                <span className="text-xs text-silver">
                  {option.priceDelta === 0 ? incl : `+${formatMoney(option.priceDelta)}`}
                </span>
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-white/50">{copy.detail}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function MultiGroup({
  step,
  title,
  options,
  values,
  onChange,
}: {
  step: string;
  title: string;
  options: BuilderOption[];
  values: string[];
  onChange: (ids: string[]) => void;
}) {
  const { t, locale } = useLanguage();
  function toggle(id: string) {
    onChange(values.includes(id) ? values.filter((v) => v !== id) : [...values, id]);
  }

  return (
    <section>
      <div className="mb-4 flex items-baseline gap-3">
        <span className="font-display text-silver">{step}</span>
        <h2 className="font-display text-2xl">{title}</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const selected = values.includes(option.id);
          const copy = optionCopy(option, t, locale);
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => toggle(option.id)}
              className={`rounded-2xl border p-4 text-start ${
                selected ? "border-silver bg-white/10" : "border-white/15 hover:border-silver"
              }`}
            >
              <div className="flex items-baseline justify-between">
                <span className="font-display text-lg">{copy.label}</span>
                <span className="text-xs text-silver">+{formatMoney(option.priceDelta)}</span>
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-white/50">{copy.detail}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
