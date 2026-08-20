import type { ShopCategory, ShopProduct } from "../types";
import { diningMenu, productPhoto } from "./catalog";

const oven = diningMenu.categories.find((c) => c.name.toLowerCase().includes("oven"));
const desserts = diningMenu.categories.find((c) => c.name.toLowerCase().includes("dessert"));

export const shopCategories: { id: ShopCategory; labelKey: "ovenFresh" | "desserts" | "merch" }[] = [
  { id: "merchandise", labelKey: "ovenFresh" },
  { id: "beans", labelKey: "desserts" },
  { id: "gear", labelKey: "merch" },
];

const bakery: ShopProduct[] = (oven?.products ?? []).map((p) => ({
  id: `oven-${p.id}`,
  sku: `BAKE-${p.id}`,
  name: p.name,
  nameAr: p.nameAr,
  description: p.description || "Baked in the Mihbash kitchen.",
  descriptionAr: p.descriptionAr,
  price: p.price ?? 0,
  category: "merchandise" as const,
  image: productPhoto(p, "/brand/banner.jpg"),
  foodicsProductId: `FOODICS_${p.id}`,
}));

const sweets: ShopProduct[] = (desserts?.products ?? []).map((p) => ({
  id: `des-${p.id}`,
  sku: `DES-${p.id}`,
  name: p.name,
  nameAr: p.nameAr,
  description: p.description || "Pastry kitchen.",
  descriptionAr: p.descriptionAr,
  price: p.price ?? 0,
  category: "beans" as const,
  image: productPhoto(p, "/brand/banner.jpg"),
  foodicsProductId: `FOODICS_${p.id}`,
}));

export const shopProducts: ShopProduct[] = [
  ...bakery,
  ...sweets,
  {
    id: "merch-matcha",
    sku: "MERCH-MATCHA-TEE",
    name: "Need Money For Mihbash Matcha",
    nameAr: "نحتاج فلوس لماتشا مهباش",
    description: "The house tee from the bar. Wear it like the floor does.",
    descriptionAr: "تيشيرت البيت من البار.",
    price: 120,
    category: "gear",
    image: "/brand/drinks-banner.jpg",
    foodicsProductId: "FOODICS_MERCH_TEE",
  },
];
