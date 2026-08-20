import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "The house",
  description: "Coffee, matcha, and kitchen stations at Mihbash Cafe & Dining · مهباش.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
