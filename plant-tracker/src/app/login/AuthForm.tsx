"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(e.currentTarget);
    const payload: Record<string, string> = {
      email: String(form.get("email") || "").trim(),
      password: String(form.get("password") || ""),
    };
    if (mode === "signup") {
      const name = String(form.get("name") || "").trim();
      if (name) payload.name = name;
    }
    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    setPending(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error || "Erreur");
      return;
    }
    router.refresh();
    router.push("/collection");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {mode === "signup" && (
        <div>
          <label className="label" htmlFor="name">
            Prénom (facultatif)
          </label>
          <input id="name" name="name" className="input" autoComplete="given-name" />
        </div>
      )}
      <div>
        <label className="label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="input"
        />
      </div>
      <div>
        <label className="label" htmlFor="password">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          minLength={mode === "signup" ? 8 : 1}
          required
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          className="input"
        />
      </div>
      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      <button className="btn-primary w-full" disabled={pending}>
        {pending ? "…" : mode === "login" ? "Se connecter" : "Créer mon compte"}
      </button>
    </form>
  );
}
