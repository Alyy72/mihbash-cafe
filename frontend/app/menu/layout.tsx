import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Menu",
  description: "Mihbash Cafe & Dining live menu · مهباش — drinks and dining boards, photos, and prices in AED.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
