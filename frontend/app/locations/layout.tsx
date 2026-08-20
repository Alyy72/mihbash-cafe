import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Visit",
  description:
    "Visit Mihbash Cafe & Dining in Umm Suqeim, Dubai. Open everyday 8:00 AM – 2:00 AM. +971 4 552 4904. زورونا في أم سقيم.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
