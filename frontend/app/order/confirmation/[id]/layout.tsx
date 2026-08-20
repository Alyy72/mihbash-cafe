export const runtime = "edge";

import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Order confirmed",
  description: "Your Mihbash Cafe & Dining order receipt · إيصال طلب مهباش.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
