import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Staff inbox",
  description: "Mihbash Cafe & Dining collaboration inbox.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
