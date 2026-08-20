import type { CafeEvent, CafeLocation, TeamMember } from "../types";
import { categoryPhoto, diningMenu, drinksMenu } from "./catalog";

export const cafe = {
  name: "Mihbash Cafe & Dining",
  shortName: "Mihbash",
  tagline: "Need money for Mihbash matcha.",
  established: 2023,
  city: "Dubai",
  email: "hello@mihbash.ae",
  phone: "+971 4 552 4904",
  instagram: "https://www.instagram.com/mihbash.ae",
  mission:
    "A navy room, a silver cup, and a board that moves between specialty coffee, house matcha, all-day breakfast, and proper dining.",
  story: [
    "Mihbash is a cafe and dining room built around a cold coffee blend, a serious matcha bar, and a kitchen that starts at pancakes and runs through power bowls.",
    "The digital menu — the one on the table QR — is the house itself: grid of rooms, photographs as they are plated, bestsellers marked, new drinks dropped in silver.",
  ],
};

export const locations: CafeLocation[] = [
  {
    id: "umm-suqeim",
    name: "Umm Suqeim",
    neighborhood: "Umm Suqeim",
    address: "651 – 1, Umm Suqeim / Jumeirah Road, Dubai",
    city: "Dubai",
    phone: "+971 4 552 4904",
    hours: [{ days: "Everyday", open: "08:00", close: "02:00" }],
    mapUrl: "https://maps.app.goo.gl/w7bGyeHbyBX3kdUCA",
    image: categoryPhoto(diningMenu.categories[0]),
    foodicsBranchId: "FOODICS_BRANCH_UMM",
    note: "Cafe & dining flagship. Open every day 8:00 AM – 2:00 AM. Coffee and matcha at the bar, all-day breakfast, then the evening board.",
  },
];

const coffeeImg = categoryPhoto(
  drinksMenu.categories.find((c) => c.name.toLowerCase() === "coffee") ?? drinksMenu.categories[0],
);
const matchaImg = categoryPhoto(
  drinksMenu.categories.find((c) => c.name.toLowerCase() === "matcha") ?? drinksMenu.categories[1],
);
const kitchenImg = categoryPhoto(
  diningMenu.categories.find((c) => c.name.toLowerCase().includes("dining")) ??
    diningMenu.categories[0],
);

export const team: TeamMember[] = [
  {
    id: "coffee",
    name: "The coffee bar",
    role: "Espresso, cold blend, V60 lots",
    department: "Coffee",
    bio: "Dirty Dirty Mihbash, Spanish lattes, and a V60 list that moves from Ethiopia to PNG. This is the house shot.",
    image: coffeeImg,
  },
  {
    id: "matcha",
    name: "The matcha bar",
    role: "Ceremonial + house signatures",
    department: "Matcha",
    bio: "Mango sticky rice matcha, Earth Matcha, salted vanilla, houjicha foam. The shirt on the floor says the rest.",
    image: matchaImg,
  },
  {
    id: "kitchen",
    name: "The kitchen",
    role: "Breakfast through bowls",
    department: "Dining",
    bio: "Unlimited pancakes until 3, then clubs, katsu, power bowls, and oven-fresh from the same pass.",
    image: kitchenImg,
  },
];

export const events: CafeEvent[] = [
  {
    id: "pancakes",
    title: "Unlimited pancakes",
    date: "2026-08-19",
    startTime: "08:00",
    endTime: "15:00",
    locationId: "umm-suqeim",
    kind: "supper",
    description:
      "60 AED per person. Four pancakes at a time, butter, maple, and a choice of orange juice or unlimited americano. On the board every day until 3.",
    capacity: 80,
    price: 60,
  },
  {
    id: "dirty",
    title: "Dirty Dirty Mihbash",
    date: "2026-08-22",
    startTime: "10:00",
    endTime: "18:00",
    locationId: "umm-suqeim",
    kind: "tasting",
    description:
      "The house bestseller: iced milk latte, Mihbash cold coffee blend, salted vanilla foam, cocoa, espresso shot. Served extra cold.",
    capacity: 40,
    price: 32,
  },
  {
    id: "earth",
    title: "Earth Matcha drop",
    date: "2026-08-25",
    startTime: "12:00",
    endTime: "16:00",
    locationId: "umm-suqeim",
    kind: "workshop",
    description:
      "Blue curaçao, coconut water, double matcha, salted vanilla foam. A tasting of the new matcha line including mango sticky rice.",
    capacity: 16,
    price: 48,
  },
];

export const coreDishes = diningMenu.categories
  .find((c) => c.name.toLowerCase().includes("breakfast"))
  ?.products.slice(0, 4)
  .map((p) => ({
    name: p.name,
    copy: p.description,
    price: p.price ?? 0,
    image: p.image || p.thumb || "/brand/banner.jpg",
  })) ?? [];

export const bestSellers = [];
