"use client";

import { FormEvent, useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { apiPost } from "@/lib/api";

const TYPES = ["brand", "creator", "event", "content", "other"] as const;

type CollabOut = { id: string; reference: string; status: string };

export default function CollaboratePage() {
  const { t, locale } = useLanguage();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [thanksOpen, setThanksOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = thanksOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [thanksOpen]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setPending(true);
    setError(null);
    try {
      await apiPost<CollabOut>("/api/v1/collaborations", {
        name: String(data.get("name") ?? ""),
        brand: String(data.get("brand") ?? ""),
        email: String(data.get("email") ?? ""),
        phone: String(data.get("phone") ?? ""),
        instagram: String(data.get("instagram") ?? ""),
        type: String(data.get("type") ?? "other"),
        message: String(data.get("message") ?? ""),
        language: locale,
      });
      form.reset();
      setThanksOpen(true);
    } catch {
      setError(t.collab.error);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-8 md:px-6">
      <p className="text-[11px] uppercase tracking-[0.28em] text-silver">{t.collab.kicker}</p>
      <h1 className="mt-3 font-display text-5xl md:text-6xl">{t.collab.title}</h1>
      <p className="mt-4 max-w-xl text-sm leading-7 text-white/60">{t.collab.lead}</p>

      <form onSubmit={onSubmit} className="mt-10 grid gap-4">
        <Field label={t.collab.name} name="name" required />
        <Field label={t.collab.brand} name="brand" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.collab.email} name="email" type="email" required />
          <Field label={t.collab.phone} name="phone" />
        </div>
        <Field label={t.collab.instagram} name="instagram" placeholder="@handle" />
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.16em] text-silver">{t.collab.type}</span>
          <select
            name="type"
            defaultValue="brand"
            className="mt-2 w-full rounded-2xl border border-white/15 bg-white/5 px-3 py-3 text-sm outline-none focus:border-silver"
          >
            {TYPES.map((type) => (
              <option key={type} value={type}>
                {t.collab.types[type]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.16em] text-silver">{t.collab.message}</span>
          <textarea
            name="message"
            required
            rows={6}
            className="mt-2 w-full rounded-2xl border border-white/15 bg-white/5 px-3 py-3 text-sm outline-none focus:border-silver"
          />
        </label>
        {error && <p className="text-sm text-silver">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="mt-2 w-fit rounded-full bg-silver px-8 py-3 text-[12px] uppercase tracking-[0.22em] text-navy disabled:opacity-50"
        >
          {pending ? t.collab.sending : t.collab.submit}
        </button>
      </form>

      {thanksOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-navy/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="collab-thanks-title"
        >
          <div className="menu-card w-full max-w-md p-8 text-center">
            <p id="collab-thanks-title" className="font-display text-4xl">
              {t.collab.thanksTitle}
            </p>
            <p className="mt-4 text-sm leading-7 text-white/70">{t.collab.success}</p>
            <button
              type="button"
              onClick={() => setThanksOpen(false)}
              className="mt-8 rounded-full bg-silver px-8 py-3 text-[12px] uppercase tracking-[0.22em] text-navy"
            >
              {t.collab.thanksClose}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.16em] text-silver">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-white/15 bg-white/5 px-3 py-3 text-sm outline-none focus:border-silver"
      />
    </label>
  );
}
