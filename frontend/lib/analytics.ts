import { apiPost } from "./api";

export type AnalyticsEventName =
  | "page_view"
  | "menu_filter"
  | "menu_item_view"
  | "add_to_cart"
  | "custom_build_change"
  | "custom_build_add"
  | "checkout_start"
  | "checkout_submit"
  | "purchase";

interface AnalyticsPayload {
  event: AnalyticsEventName;
  path?: string;
  properties?: Record<string, unknown>;
}

function sessionId(): string {
  if (typeof window === "undefined") return "ssr";
  const key = "mihbash_session";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const next = `ses_${crypto.randomUUID()}`;
  window.localStorage.setItem(key, next);
  return next;
}

export function track(payload: AnalyticsPayload): void {
  if (typeof window === "undefined") return;
  const body = {
    event: payload.event,
    path: payload.path ?? window.location.pathname,
    session_id: sessionId(),
    occurred_at: new Date().toISOString(),
    user_agent: navigator.userAgent,
    referrer: document.referrer,
    properties: payload.properties ?? {},
  };

  void apiPost("/api/v1/analytics/events", body).catch(() => {
    // Analytics must never block the guest experience.
  });
}
