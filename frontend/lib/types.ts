export type MenuCategory =
  | "espresso"
  | "brew"
  | "kitchen"
  | "pastry"
  | "seasonal";

export type MenuTag =
  | "signature"
  | "vegan"
  | "gluten-free"
  | "new"
  | "chef-pick"
  | "limited";

export interface MenuItem {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  tags: MenuTag[];
  availableToday: boolean;
  image: string;
  foodicsProductId?: string;
}

export type ShopCategory = "beans" | "merchandise" | "gear";

export interface ShopProduct {
  id: string;
  sku: string;
  name: string;
  nameAr?: string;
  description: string;
  descriptionAr?: string;
  price: number;
  category: ShopCategory;
  weight?: string;
  origin?: string;
  image: string;
  foodicsProductId?: string;
}

export interface LocationHours {
  days: string;
  open: string;
  close: string;
}

export interface CafeLocation {
  id: string;
  name: string;
  neighborhood: string;
  address: string;
  city: string;
  phone: string;
  hours: LocationHours[];
  mapUrl: string;
  image: string;
  foodicsBranchId: string;
  note: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  bio: string;
  image: string;
}

export interface CafeEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  locationId: string;
  kind: "cupping" | "workshop" | "supper" | "tasting" | "live";
  description: string;
  capacity: number;
  price: number | "complimentary";
}

export interface BuilderOption {
  id: string;
  label: string;
  labelAr?: string;
  detail: string;
  detailAr?: string;
  priceDelta: number;
  foodicsModifierId?: string;
}

export interface CartLine {
  id: string;
  kind: "menu" | "shop" | "custom";
  sku: string;
  name: string;
  unitPrice: number;
  quantity: number;
  image: string;
  notes?: string;
  configuration?: CustomBuild;
  foodicsProductId?: string;
  modifiers?: { label: string; price: number; foodicsModifierId?: string }[];
}

export type BuilderMode = "drink" | "dish";

export interface CustomBuild {
  mode: BuilderMode;
  baseId: string;
  beanId?: string;
  milkId?: string;
  syrupIds: string[];
  temperatureId?: string;
  extraIds: string[];
  grainId?: string;
  proteinId?: string;
  sauceId?: string;
  notes: string;
}

export interface CheckoutPayload {
  customer: {
    name: string;
    email: string;
    phone: string;
    dialCode: string;
  };
  locationId: string;
  fulfillment: "pickup" | "delivery";
  paymentGateway: "stripe" | "ziina" | "mock";
  notes?: string;
  items: CartLine[];
}

export interface OrderConfirmation {
  orderId: string;
  orderNumber: string;
  status: string;
  total: number;
  currency: string;
  estimatedReadyAt: string;
  locationName: string;
  paymentStatus: string;
  receipt: Receipt;
  foodics: {
    dispatched: boolean;
    dryRun: boolean;
    orderId?: string;
  };
}

export interface Receipt {
  number: string;
  issuedAt: string;
  cafe: string;
  location: string;
  customer: string;
  lines: { name: string; quantity: number; unitPrice: number; total: number }[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  paymentMethod: string;
}
