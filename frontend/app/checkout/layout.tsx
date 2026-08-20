import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Checkout at Mihbash Cafe & Dining · إتمام الطلب في مهباش.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
