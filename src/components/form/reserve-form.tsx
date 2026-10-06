"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { experienceOptions } from "@/config/form-options";
import { RESERVE, TERMS_URL } from "@/config/content";
import type { CountryOption } from "@/lib/countries";
import { track, trackOnce } from "@/lib/analytics-client";
import { parseE164, validateLead } from "@/lib/validation";

type FormState = {
  fullName: string;
  email: string;
  whatsapp: string;
  phone: string;
  country: string;
  tradingExperience: string;
  consent: boolean;
  companyWebsite: string;
};

const initial: FormState = {
  fullName: "",
  email: "",
  whatsapp: "",
  phone: "",
  country: "",
  tradingExperience: "",
  consent: false,
  companyWebsite: "",
};

function formatTimer(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export function ReserveForm({
  countries,
  onClose,
}: {
  countries: CountryOption[];
  onClose?: () => void;
}) {
  const router = useRouter();
  const startedAt = useRef(Date.now());
  const [state, setState] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [remaining, setRemaining] = useState(5 * 60);

  useEffect(() => {
    startedAt.current = Date.now();
    const timer = window.setInterval(() => {
      setRemaining((current) => (current <= 1 ? 5 * 60 : current - 1));
    }, 1000);
    const previous = document.body.style.overflow;
    if (onClose) document.body.style.overflow = "hidden";
    return () => {
      window.clearInterval(timer);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose?.();
    }
    if (onClose) {
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
  }, [onClose]);

  const selected = useMemo(
    () => countries.find((country) => country.name === state.country),
    [countries, state.country],
  );

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  }

  async function onSubmit(event: { preventDefault: () => void }) {
    event.preventDefault();
    const iso = selected?.code || "";
    const draft = {
      fullName: state.fullName,
      email: state.email,
      phone: parseE164(state.phone, iso) || state.phone,
      whatsapp: parseE164(state.whatsapp, iso) || state.whatsapp,
      phoneCountry: iso,
      country: state.country,
      tradingExperience: state.tradingExperience,
      previouslyPurchased: false,
      previousProducts: [] as string[],
      depositRange: "Prefer not to say",
      consent: state.consent,
    };
    const checked = validateLead(draft, countries);
    if (!checked.ok) {
      setErrors(checked.errors);
      setFormError("Please fix the highlighted fields.");
      const key = Object.keys(checked.errors).find((item) => checked.errors[item]);
      if (key) document.getElementById(key)?.focus();
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...checked.value,
          consent: true,
          companyWebsite: state.companyWebsite,
          startedAt: startedAt.current,
        }),
      });
      const body = (await response.json()) as { ok?: boolean; redirectTo?: string; errors?: Record<string, string> };
      if (!response.ok || !body.ok || !body.redirectTo) {
        setErrors(body.errors || {});
        setFormError(body.errors?.form || "We couldn’t reserve your spot. Please try again.");
        setSubmitting(false);
        return;
      }
      track("form_completed");
      router.push(body.redirectTo);
    } catch {
      setFormError("We couldn’t reserve your spot. Check your connection and try again.");
      setSubmitting(false);
    }
  }

  const form = (
    <form className="reserve-card" onSubmit={onSubmit} noValidate data-testid="apply-form">
      {onClose ? (
        <button type="button" className="reserve-close" aria-label="Close" onClick={onClose}>
          ×
        </button>
      ) : null}
      <div className="reserve-timer" role="status">
        <span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
            <path d="M12 8v4l2.5 1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          {RESERVE.timerLabel}
        </span>
        <b>{formatTimer(remaining)}</b>
      </div>
      <h2 id="reserve-title">{RESERVE.title}</h2>
      <p className="reserve-kicker">{RESERVE.kicker}</p>
      {formError ? <p className="form-error" role="alert">{formError}</p> : null}
      <div className="reserve-grid">
        <label className="field" htmlFor="fullName">
          <span>Full name</span>
          <input
            id="fullName"
            className="input"
            name="name"
            autoComplete="name"
            placeholder="John Smith"
            value={state.fullName}
            aria-invalid={Boolean(errors.fullName)}
            onFocus={() => trackOnce("form_started")}
            onChange={(event) => update("fullName", event.target.value)}
          />
          {errors.fullName ? <p className="field-error">{errors.fullName}</p> : null}
        </label>
        <label className="field" htmlFor="email">
          <span>Email address</span>
          <input
            id="email"
            className="input"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            value={state.email}
            aria-invalid={Boolean(errors.email)}
            onChange={(event) => update("email", event.target.value)}
          />
          {errors.email ? <p className="field-error">{errors.email}</p> : null}
        </label>
        <label className="field" htmlFor="whatsapp">
          <span>WhatsApp number</span>
          <input
            id="whatsapp"
            className="input"
            name="whatsapp"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder={`${selected?.dial || "+27"} (WhatsApp)`}
            value={state.whatsapp}
            aria-invalid={Boolean(errors.whatsapp)}
            onChange={(event) => update("whatsapp", event.target.value)}
          />
          {errors.whatsapp ? <p className="field-error">{errors.whatsapp}</p> : null}
        </label>
        <label className="field" htmlFor="phone">
          <span>Phone number (calls/SMS)</span>
          <input
            id="phone"
            className="input"
            name="tel"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder={`${selected?.dial || "+27"} (Direct)`}
            value={state.phone}
            aria-invalid={Boolean(errors.phone)}
            onChange={(event) => update("phone", event.target.value)}
          />
          {errors.phone ? <p className="field-error">{errors.phone}</p> : null}
        </label>
        <label className="field" htmlFor="country">
          <span>Country</span>
          <select
            id="country"
            className="input"
            name="country"
            autoComplete="country-name"
            value={state.country}
            aria-invalid={Boolean(errors.country)}
            onChange={(event) => update("country", event.target.value)}
          >
            <option value="">Select Country...</option>
            {countries.map((country) => (
              <option key={country.code} value={country.name}>
                {country.name}
              </option>
            ))}
          </select>
          {errors.country ? <p className="field-error">{errors.country}</p> : null}
        </label>
        <label className="field" htmlFor="tradingExperience">
          <span>Experience</span>
          <select
            id="tradingExperience"
            className="input"
            name="experience"
            value={state.tradingExperience}
            aria-invalid={Boolean(errors.tradingExperience)}
            onChange={(event) => update("tradingExperience", event.target.value)}
          >
            <option value="">Select...</option>
            {experienceOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.tradingExperience ? <p className="field-error">{errors.tradingExperience}</p> : null}
        </label>
      </div>
      <label className="reserve-consent">
        <input
          id="consent"
          type="checkbox"
          checked={state.consent}
          onChange={(event) => update("consent", event.target.checked)}
        />
        <span>
          I understand that forex trading involves significant risk. By submitting, I also agree to the{" "}
          <a href={TERMS_URL} target="_blank" rel="noopener noreferrer">
            Terms and Conditions
          </a>{" "}
          of Poverty Killers FX (Pty) Ltd, including group chat guidelines and consent for marketing communications as per POPIA regulations.
        </span>
      </label>
      {errors.consent ? <p className="field-error">{errors.consent}</p> : null}
      <div className="hp" aria-hidden="true">
        <label>
          Company website
          <input tabIndex={-1} autoComplete="off" value={state.companyWebsite} onChange={(event) => update("companyWebsite", event.target.value)} />
        </label>
      </div>
      <button type="submit" className="btn btn-spot reserve-submit" disabled={submitting} data-testid="submit-application">
        {submitting ? RESERVE.submitting : RESERVE.submit}
      </button>
    </form>
  );

  if (!onClose) {
    return <div className="reserve-page">{form}</div>;
  }
  return (
    <div className="reserve-overlay" onClick={onClose} role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reserve-title"
        onClick={(event) => event.stopPropagation()}
      >
        {form}
      </div>
    </div>
  );
}
