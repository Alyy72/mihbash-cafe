"use client";

import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <LanguageProvider>{children}</LanguageProvider>;
}
