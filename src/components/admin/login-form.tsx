"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, next: nextPath }),
      });
      const body = (await response.json()) as { ok?: boolean; error?: string; redirectTo?: string };
      if (!response.ok || !body.ok) {
        setError(body.error || "Incorrect email or password.");
        setPending(false);
        return;
      }
      router.replace(body.redirectTo || "/admin");
      router.refresh();
    } catch {
      setError("We couldn’t sign you in. Check your connection and try again.");
      setPending(false);
    }
  }

  return (
    <form className="fields" onSubmit={onSubmit}>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <label className="field" htmlFor="admin-email">
        <span>Email</span>
        <input id="admin-email" className="input" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required />
      </label>
      <label className="field" htmlFor="admin-password">
        <span>Password</span>
        <input id="admin-password" className="input" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
      </label>
      <button className="btn btn-primary btn-block" type="submit" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
