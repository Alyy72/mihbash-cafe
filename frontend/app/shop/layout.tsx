import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Bakery",
  description: "Oven-fresh pastry and house merch from Mihbash Cafe & Dining · مهباش.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
