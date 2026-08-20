import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Build a cup",
  description: "Compose a custom Mihbash drink or kitchen plate · ركّب كوب مهباش أو طبق.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
