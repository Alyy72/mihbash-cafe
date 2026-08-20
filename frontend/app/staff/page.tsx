"use client";

import { FormEvent, useState } from "react";
import { API_URL } from "@/lib/api";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type Inquiry = {
  id: string;
  reference: string;
  name: string;
  brand: string;
  email: string;
  phone: string;
  instagram: string;
  type: string;
  message: string;
  language: string;
  status: string;
  createdAt: string;
};

export default function StaffInboxPage() {
  const { t } = useLanguage();
  const [token, setToken] = useState("");
  const [items, setItems] = useState<Inquiry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function loadInbox(staffToken: string) {
    const res = await fetch(`${API_URL}/api/v1/collaborations`, {
      headers: { "X-Staff-Token": staffToken },
      cache: "no-store",
    });
    if (!res.ok) throw new Error("unauthorized");
    setItems(await res.json());
  }

  async function unlock(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      await loadInbox(token);
    } catch {
      setError("Could not open inbox.");
    } finally {
      setPending(false);
    }
  }

  async function setStatus(id: string, status: string) {
    const res = await fetch(`${API_URL}/api/v1/collaborations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "X-Staff-Token": token },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) return;
    await loadInbox(token);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-8 md:px-6">
      <p className="text-[11px] uppercase tracking-[0.28em] text-silver">Staff</p>
      <h1 className="mt-3 font-display text-5xl">{t.staff.title}</h1>

      {!items && (
        <form onSubmit={unlock} className="mt-10 max-w-md space-y-4">
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.16em] text-silver">{t.staff.token}</span>
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              type="password"
              className="mt-2 w-full rounded-2xl border border-white/15 bg-white/5 px-3 py-3 text-sm outline-none focus:border-silver"
            />
          </label>
          {error && <p className="text-sm text-silver">{error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-silver px-6 py-2 text-[12px] uppercase tracking-[0.18em] text-navy"
          >
            {t.staff.unlock}
          </button>
        </form>
      )}

      {items && items.length === 0 && <p className="mt-10 text-white/50">{t.staff.empty}</p>}

      {items && items.length > 0 && (
        <ul className="mt-10 space-y-3">
          {items.map((item) => (
            <li key={item.id} className="menu-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-silver">{item.reference}</p>
                  <h2 className="mt-1 font-display text-2xl">{item.name}</h2>
                  <p className="text-sm text-white/55">
                    {item.brand} · {item.type} · {item.email}
                  </p>
                </div>
                <select
                  value={item.status}
                  onChange={(e) => setStatus(item.id, e.target.value)}
                  className="rounded-full border border-white/20 bg-navy px-3 py-1 text-xs"
                >
                  <option value="new">new</option>
                  <option value="reviewed">reviewed</option>
                  <option value="closed">closed</option>
                </select>
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-white/70">{item.message}</p>
              <p className="mt-3 text-[11px] text-white/35">
                {item.phone} {item.instagram ? `· ${item.instagram}` : ""} · {item.createdAt}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
