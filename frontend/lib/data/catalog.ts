import catalog from "./mihbash.json";

export type CatalogVariant = { name: string; nameAr?: string; price: number };
export type CatalogProduct = {
  id: number;
  name: string;
  nameAr?: string;
  description: string;
  descriptionAr?: string;
  price: number | null;
  oldPrice: number | null;
  variants: CatalogVariant[];
  image: string | null;
  thumb: string | null;
  bestseller: boolean;
  new: boolean;
};
export type CatalogCategory = {
  id: number;
  name: string;
  nameAr?: string;
  description: string;
  image: string | null;
  type: string | null;
  products: CatalogProduct[];
};
export type CatalogMenu = {
  id: number;
  slug: string;
  name: string;
  nameAr?: string;
  banner: string | null;
  categories: CatalogCategory[];
};

export const cafeName = catalog.name;
export const cafeLogo = "/brand/logo.png";
export const cafeBanner = "/brand/banner.jpg";
export const drinksBanner = "/brand/drinks-banner.jpg";
export const colors = catalog.colors;
export const menus = catalog.menus as CatalogMenu[];

export const drinksMenu = menus[0] as CatalogMenu;
export const diningMenu = menus[1] as CatalogMenu;

export function categoryPhoto(category: CatalogCategory): string {
  return (
    category.image ||
    category.products.find((p) => p.image)?.image ||
    cafeBanner
  );
}

export function productPhoto(product: CatalogProduct, fallback = cafeBanner): string {
  return product.image || product.thumb || fallback;
}

export function allProducts(): (CatalogProduct & { menuName: string; categoryName: string; categoryId: number })[] {
  return menus.flatMap((menu) =>
    menu.categories.flatMap((category) =>
      category.products.map((product) => ({
        ...product,
        menuName: menu.name,
        categoryName: category.name,
        categoryId: category.id,
      })),
    ),
  );
}

export const bestsellers = allProducts().filter((p) => p.bestseller);
export const newItems = allProducts().filter((p) => p.new);

export function skuFor(product: CatalogProduct): string {
  return `MB-${product.id}`;
}

export function localized(
  locale: "en" | "ar",
  en: string,
  ar?: string | null,
): string {
  if (locale === "ar" && ar) return ar;
  return en;
}

export const PLACEHOLDER = catalog.logo;
