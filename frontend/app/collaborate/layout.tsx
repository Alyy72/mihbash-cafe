import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Collaborate",
  description: "Brand, creator, and event collaborations with Mihbash Cafe & Dining · تعاون مع مهباش.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
