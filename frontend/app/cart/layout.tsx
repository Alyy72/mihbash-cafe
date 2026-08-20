import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Bag",
  description: "Your Mihbash Cafe & Dining bag · سلة مهباش.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
