import en from "./en.json";
import ar from "./ar.json";

export type Locale = "en" | "ar";

export const dictionaries = { en, ar };

export type Dictionary = typeof en;

export function builderOptionCopy(t: Dictionary, id: string): { label: string; detail: string } | undefined {
  return (t.builder.options as Record<string, { label: string; detail: string } | undefined>)[id];
}

export function eventCopy(
  t: Dictionary,
  id: string,
): { kind: string; title: string; time: string; description: string } | undefined {
  return (t.events.items as Record<string, { kind: string; title: string; time: string; description: string } | undefined>)[id];
}
