import {
  allProducts,
  diningMenu,
  drinksMenu,
  type CatalogProduct,
} from "./catalog";
import type { BuilderOption, CustomBuild } from "../types";

function fromProduct(product: CatalogProduct, fallbackDetail = ""): BuilderOption {
  return {
    id: String(product.id),
    label: product.name,
    labelAr: product.nameAr,
    detail: product.description || fallbackDetail,
    detailAr: product.descriptionAr || undefined,
    priceDelta: product.price ?? 0,
    foodicsModifierId: `MOD_${product.id}`,
  };
}

const coffee = drinksMenu.categories.find((c) => c.name.toLowerCase() === "coffee")?.products ?? [];
const matcha = drinksMenu.categories.find((c) => c.name.toLowerCase() === "matcha")?.products ?? [];
const signatures =
  drinksMenu.categories.find((c) => c.name.toLowerCase().includes("signature"))?.products ?? [];
const milksCat = drinksMenu.categories.find((c) => c.name.toLowerCase().includes("milk"))?.products ?? [];
const addonsCat = drinksMenu.categories.find((c) => c.name.toLowerCase().includes("add"))?.products ?? [];
const bowls = diningMenu.categories.find((c) => c.name.toLowerCase().includes("bowl"))?.products ?? [];
const sandwiches =
  diningMenu.categories.find((c) => c.name.toLowerCase().includes("sandwich"))?.products ?? [];
const breakfast =
  diningMenu.categories.find((c) => c.name.toLowerCase().includes("breakfast"))?.products ?? [];

export const drinkBases: BuilderOption[] = [
  ...coffee.slice(0, 6),
  ...matcha.slice(0, 3),
  ...signatures.slice(0, 2),
].map((p) => fromProduct(p));

export const beans: BuilderOption[] = [
  { id: "house", label: "House espresso", detail: "Mihbash cold coffee blend / house shot", priceDelta: 0, foodicsModifierId: "MOD_BEAN_HOUSE" },
  { id: "ethiopia", label: "Ethiopia beans", detail: "Specialty bean upgrade", priceDelta: 2, foodicsModifierId: "MOD_BEAN_ETH" },
  { id: "v60", label: "V60 lot", detail: "Ask the bar for today’s origin", priceDelta: 8, foodicsModifierId: "MOD_BEAN_V60" },
];

export const milks: BuilderOption[] = [
  { id: "whole", label: "Mihbash milk", detail: "House dairy — included", priceDelta: 0, foodicsModifierId: "MOD_MILK_HOUSE" },
  ...milksCat.map((p) => fromProduct(p, "Milk alternative")),
];

export const syrups: BuilderOption[] = [
  { id: "none", label: "No extra flavour", detail: "As written", priceDelta: 0 },
  { id: "salted-vanilla", label: "Salted vanilla foam", detail: "The Dirty Dirty finish", priceDelta: 10, foodicsModifierId: "MOD_FOAM" },
  { id: "maple", label: "Salted maple", detail: "From the iced brew", priceDelta: 5, foodicsModifierId: "MOD_MAPLE" },
  { id: "dulce", label: "Dulce de leche foam", detail: "Woody’s Latte", priceDelta: 10, foodicsModifierId: "MOD_DULCE" },
];

export const temperatures: BuilderOption[] = [
  { id: "hot", label: "Hot", detail: "Steamed", priceDelta: 0, foodicsModifierId: "MOD_TEMP_HOT" },
  { id: "iced", label: "Iced", detail: "Extra cold, as the specials are served", priceDelta: 0, foodicsModifierId: "MOD_TEMP_ICED" },
];

export const drinkExtras: BuilderOption[] = addonsCat.map((p) => fromProduct(p));

export const dishGrains: BuilderOption[] = bowls.map((p) => fromProduct(p));
export const dishProteins: BuilderOption[] = [
  { id: "as-written", label: "As written", detail: "Chef’s default protein", priceDelta: 0 },
  { id: "chicken", label: "Chicken", detail: "The-warma / power bowl swap", priceDelta: 0 },
  { id: "beef", label: "Beef", detail: "The-warma beef", priceDelta: 6 },
  { id: "salmon", label: "Salmon teriyaki", detail: "Bowl upgrade", priceDelta: 12 },
];
export const dishSauces: BuilderOption[] = [
  { id: "chimichurri", label: "Chimichurri", detail: "Power bowls", priceDelta: 0 },
  { id: "tahini", label: "Tahini", detail: "The-warma", priceDelta: 0 },
  { id: "sriracha-mayo", label: "Sriracha Japanese mayo", detail: "Salmon teriyaki", priceDelta: 0 },
  { id: "kewpie", label: "Kewpie / spicy mayo", detail: "Sandwiches", priceDelta: 0 },
];
export const dishExtras: BuilderOption[] = sandwiches.slice(0, 4).map((p) => ({
  id: `side-${p.id}`,
  label: `Add ${p.name}`,
  labelAr: p.nameAr ? `أضف ${p.nameAr}` : undefined,
  detail: p.description || "From the sandwich board",
  detailAr: p.descriptionAr,
  priceDelta: 12,
  foodicsModifierId: `MOD_SIDE_${p.id}`,
}));

export const defaultDrinkBuild: CustomBuild = {
  mode: "drink",
  baseId: drinkBases[0]?.id ?? "house",
  beanId: "house",
  milkId: "whole",
  syrupIds: [],
  temperatureId: "iced",
  extraIds: [],
  notes: "",
};

export const defaultDishBuild: CustomBuild = {
  mode: "dish",
  baseId: "bowl",
  grainId: dishGrains[0]?.id,
  proteinId: "as-written",
  sauceId: "chimichurri",
  syrupIds: [],
  extraIds: [],
  notes: "",
};

function findOption(list: BuilderOption[], id?: string): BuilderOption | undefined {
  if (!id) return undefined;
  return list.find((item) => item.id === id);
}

export function priceCustomBuild(build: CustomBuild): number {
  if (build.mode === "drink") {
    const parts = [
      findOption(drinkBases, build.baseId),
      findOption(beans, build.beanId),
      findOption(milks, build.milkId),
      findOption(temperatures, build.temperatureId),
      ...build.syrupIds.map((id) => findOption(syrups, id)),
      ...build.extraIds.map((id) => findOption(drinkExtras, id)),
    ];
    return parts.reduce((sum, part) => sum + (part?.priceDelta ?? 0), 0);
  }
  const parts = [
    findOption(dishGrains, build.grainId),
    findOption(dishProteins, build.proteinId),
    findOption(dishSauces, build.sauceId),
    ...build.extraIds.map((id) => findOption(dishExtras, id)),
  ];
  return parts.reduce((sum, part) => sum + (part?.priceDelta ?? 0), 0);
}

export function describeCustomBuild(
  build: CustomBuild,
  labelOf: (option: BuilderOption) => string = (option) => option.label,
): string {
  const name = (list: BuilderOption[], id?: string) => {
    const option = findOption(list, id);
    return option ? labelOf(option) : undefined;
  };
  if (build.mode === "drink") {
    return [
      name(temperatures, build.temperatureId),
      name(drinkBases, build.baseId),
      name(milks, build.milkId),
      name(beans, build.beanId),
      ...build.syrupIds.map((id) => name(syrups, id)),
      ...build.extraIds.map((id) => name(drinkExtras, id)),
    ]
      .filter(Boolean)
      .join(" · ");
  }
  return [
    name(dishGrains, build.grainId),
    name(dishProteins, build.proteinId),
    name(dishSauces, build.sauceId),
    ...build.extraIds.map((id) => name(dishExtras, id)),
  ]
    .filter(Boolean)
    .join(" · ");
}

export function buildModifiers(build: CustomBuild) {
  const collect = (list: BuilderOption[], ids: (string | undefined)[]) =>
    ids
      .map((id) => findOption(list, id))
      .filter((item): item is BuilderOption => item != null && item.priceDelta >= 0)
      .map((item) => ({
        label: item.label,
        price: item.priceDelta,
        foodicsModifierId: item.foodicsModifierId,
      }));

  if (build.mode === "drink") {
    return [
      ...collect(drinkBases, [build.baseId]),
      ...collect(beans, [build.beanId]),
      ...collect(milks, [build.milkId]),
      ...collect(temperatures, [build.temperatureId]),
      ...collect(syrups, build.syrupIds),
      ...collect(drinkExtras, build.extraIds),
    ];
  }
  return [
    ...collect(dishGrains, [build.grainId]),
    ...collect(dishProteins, [build.proteinId]),
    ...collect(dishSauces, [build.sauceId]),
    ...collect(dishExtras, build.extraIds),
  ];
}

export const customFoodicsProduct = {
  drink: "FOODICS_CUSTOM_DRINK",
  dish: "FOODICS_CUSTOM_DISH",
};

export const breakfastHighlights = breakfast.slice(0, 4);
export const featuredCatalog = allProducts().filter((p) => p.bestseller || p.new);
