import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Hours",
  description: "Mihbash Cafe & Dining hours — everyday 8:00 AM – 2:00 AM. Breakfast all day. Unlimited pancakes until 3:00 PM. أوقات مهباش.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
