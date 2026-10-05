"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { CountryOption } from "@/lib/countries";
import { depositOptions, experienceOptions, previousProductOptions } from "@/config/form-options";
import { track, trackOnce } from "@/lib/analytics-client";
import { formatPhone, normalizePhone, validateAboutYou, validateCapital, validateExperience, validateLead } from "@/lib/validation";

const STEPS = ["About You", "Your Trading Experience", "Your Trading Capital", "Ready To Continue"] as const;

type FormState = {
  fullName: string;
  email: string;
  phoneCountry: string;
  phoneNational: string;
  country: string;
  tradingExperience: string;
  previouslyPurchased: "" | "yes" | "no";
  previousProducts: string[];
  depositRange: string;
  companyWebsite: string;
};

const initial: FormState = {
  fullName: "",
  email: "",
  phoneCountry: "",
  phoneNational: "",
  country: "",
  tradingExperience: "",
  previouslyPurchased: "",
  previousProducts: [],
  depositRange: "",
  companyWebsite: "",
};

function payloadFrom(state: FormState) {
  const phone = normalizePhone(state.phoneCountry, state.phoneNational) || "";
  return {
    fullName: state.fullName,
    email: state.email,
    phone,
    country: state.country,
    tradingExperience: state.tradingExperience,
    previouslyPurchased: state.previouslyPurchased === "" ? undefined : state.previouslyPurchased === "yes",
    previousProducts: state.previousProducts,
    depositRange: state.depositRange,
  };
}

export function ApplyForm({ countries }: { countries: CountryOption[] }) {
  const router = useRouter();
  const startedAt = useRef(0);
  const [step, setStep] = useState(1);
  const [state, setState] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const phoneTouched = useRef(false);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  }

  function validateCurrent() {
    const draft = payloadFrom(state);
    if (step === 1) {
      const next = validateAboutYou(draft, countries);
      if (!state.phoneCountry) next.phone = "Select a country code.";
      else if (!draft.phone) next.phone = "Enter a valid phone number, including your country code.";
      return next;
    }
    if (step === 2) return validateExperience(draft).errors;
    if (step === 3) return validateCapital(draft).errors;
    const full = validateLead({ ...draft, previouslyPurchased: draft.previouslyPurchased }, countries);
    return full.ok ? {} : full.errors;
  }

  function focusFirst(nextErrors: Record<string, string>) {
    const key = Object.keys(nextErrors).find((item) => nextErrors[item]);
    if (!key) return;
    document.getElementById(key === "phone" ? "phoneNational" : key)?.focus();
  }

  function onNext() {
    const nextErrors = validateCurrent();
    const visible = Object.fromEntries(Object.entries(nextErrors).filter(([, message]) => message));
    setErrors(visible);
    if (Object.keys(visible).length) {
      setFormError("Please fix the highlighted fields.");
      focusFirst(visible);
      return;
    }
    setFormError("");
    setStep((current) => Math.min(4, current + 1));
  }

  async function onSubmit(event: { preventDefault: () => void }) {
    event.preventDefault();
    if (step < 4) {
      onNext();
      return;
    }
    const draft = payloadFrom(state);
    const checked = validateLead(draft, countries);
    if (!checked.ok) {
      setErrors(checked.errors);
      setFormError("Please fix the highlighted fields.");
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
          companyWebsite: state.companyWebsite,
          startedAt: startedAt.current,
        }),
      });
      const body = (await response.json()) as { ok?: boolean; redirectTo?: string; errors?: Record<string, string> };
      if (!response.ok || !body.ok || !body.redirectTo) {
        setErrors(body.errors || {});
        setFormError(body.errors?.form || "We couldn’t submit your application. Please try again.");
        setSubmitting(false);
        return;
      }
      track("form_completed");
      router.push(body.redirectTo);
    } catch {
      setFormError("We couldn’t submit your application. Check your connection and try again.");
      setSubmitting(false);
    }
  }

  const phone = normalizePhone(state.phoneCountry, state.phoneNational);
  const selectedProducts = state.previousProducts.join(", ");

  return (
    <form className="form-card" onSubmit={onSubmit} noValidate data-testid="apply-form">
      <div className="progress-meta">
        <span>Step {step} of 4</span>
        <span>{STEPS[step - 1]}</span>
      </div>
      <div className="progress-track" aria-hidden="true">
        <div className="progress-bar" style={{ width: `${(step / 4) * 100}%` }} />
      </div>
      <p className="sr-only" aria-live="polite">Step {step} of 4, {STEPS[step - 1]}</p>
      {formError ? <p className="form-error" role="alert">{formError}</p> : null}

      {step === 1 ? (
        <div className="form-step fields">
          <h2>About You</h2>
          <label className="field" htmlFor="fullName">
            <span>Full name</span>
            <input id="fullName" className="input" name="name" autoComplete="name" value={state.fullName} aria-invalid={Boolean(errors.fullName)} onFocus={() => trackOnce("form_started")} onChange={(event) => update("fullName", event.target.value)} />
            {errors.fullName ? <p className="field-error">{errors.fullName}</p> : null}
          </label>
          <label className="field" htmlFor="email">
            <span>Email</span>
            <input id="email" className="input" name="email" type="email" autoComplete="email" inputMode="email" value={state.email} aria-invalid={Boolean(errors.email)} onChange={(event) => update("email", event.target.value)} />
            {errors.email ? <p className="field-error">{errors.email}</p> : null}
          </label>
          <fieldset className="field">
            <legend>Phone number</legend>
            <div className="phone-row">
              <select
                id="phoneCountry"
                className="input"
                aria-label="Country code"
                value={state.phoneCountry}
                onChange={(event) => {
                  phoneTouched.current = true;
                  update("phoneCountry", event.target.value);
                }}
              >
                <option value="">Code</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name} {country.dial}
                  </option>
                ))}
              </select>
              <input
                id="phoneNational"
                className="input"
                name="tel"
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder="Phone number"
                value={state.phoneNational}
                aria-invalid={Boolean(errors.phone)}
                onChange={(event) => update("phoneNational", event.target.value)}
              />
            </div>
            {errors.phone ? <p className="field-error">{errors.phone}</p> : null}
          </fieldset>
          <label className="field" htmlFor="country">
            <span>Country</span>
            <select
              id="country"
              className="input"
              name="country"
              autoComplete="country-name"
              value={state.country}
              aria-invalid={Boolean(errors.country)}
              onChange={(event) => {
                const name = event.target.value;
                const match = countries.find((country) => country.name === name);
                setState((current) => ({
                  ...current,
                  country: name,
                  phoneCountry: !phoneTouched.current && match ? match.code : current.phoneCountry,
                }));
                setErrors((current) => ({ ...current, country: "" }));
              }}
            >
              <option value="">Select country</option>
              {countries.map((country) => (
                <option key={country.code} value={country.name}>{country.name}</option>
              ))}
            </select>
            {errors.country ? <p className="field-error">{errors.country}</p> : null}
          </label>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="form-step fields">
          <h2>Your Trading Experience</h2>
          <fieldset className="field">
            <legend>How long have you been trading?</legend>
            <div className="choices">
              {experienceOptions.map((option) => (
                <label className="choice" key={option}>
                  <input type="radio" name="tradingExperience" checked={state.tradingExperience === option} onChange={() => update("tradingExperience", option)} />
                  <span>{option}</span>
                </label>
              ))}
            </div>
            {errors.tradingExperience ? <p className="field-error">{errors.tradingExperience}</p> : null}
          </fieldset>
          <fieldset className="field">
            <legend>Have you ever purchased a trading course, EA, signals or another paid trading service?</legend>
            <div className="choices">
              {(["Yes", "No"] as const).map((option) => (
                <label className="choice" key={option}>
                  <input
                    type="radio"
                    name="previouslyPurchased"
                    checked={state.previouslyPurchased === option.toLowerCase()}
                    onChange={() => update("previouslyPurchased", option.toLowerCase() as "yes" | "no")}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
            {errors.previouslyPurchased ? <p className="field-error">{errors.previouslyPurchased}</p> : null}
          </fieldset>
          {state.previouslyPurchased === "yes" ? (
            <fieldset className="field">
              <legend>What have you purchased before?</legend>
              <div className="choices">
                {previousProductOptions.map((option) => (
                  <label className="choice" key={option}>
                    <input
                      type="checkbox"
                      checked={state.previousProducts.includes(option)}
                      onChange={(event) => {
                        update(
                          "previousProducts",
                          event.target.checked
                            ? [...state.previousProducts, option]
                            : state.previousProducts.filter((item) => item !== option),
                        );
                      }}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ) : null}
        </div>
      ) : null}

      {step === 3 ? (
        <div className="form-step fields">
          <h2>Your Trading Capital</h2>
          <fieldset className="field">
            <legend>What is the minimum amount you usually deposit when trading?</legend>
            <div className="choices">
              {depositOptions.map((option) => (
                <label className="choice" key={option.value}>
                  <input type="radio" name="depositRange" checked={state.depositRange === option.value} onChange={() => update("depositRange", option.value)} />
                  <span>{option.value}</span>
                </label>
              ))}
            </div>
            {errors.depositRange ? <p className="field-error">{errors.depositRange}</p> : null}
          </fieldset>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="form-step">
          <h2>Ready To Continue</h2>
          <p className="note">Review your answers, then submit to book a call.</p>
          <dl className="review">
            <div><dt>Name</dt><dd>{state.fullName}</dd></div>
            <div><dt>Email</dt><dd>{state.email}</dd></div>
            <div><dt>Phone</dt><dd>{phone ? formatPhone(phone) : state.phoneNational}</dd></div>
            <div><dt>Country</dt><dd>{state.country}</dd></div>
            <div><dt>Trading experience</dt><dd>{state.tradingExperience}</dd></div>
            <div><dt>Previous purchases</dt><dd>{state.previouslyPurchased === "yes" ? `Yes${selectedProducts ? ` — ${selectedProducts}` : ""}` : "No"}</dd></div>
            <div><dt>Typical minimum deposit</dt><dd>{state.depositRange}</dd></div>
          </dl>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>Edit details</button>
            <button type="button" className="btn btn-ghost" onClick={() => setStep(2)}>Edit experience</button>
            <button type="button" className="btn btn-ghost" onClick={() => setStep(3)}>Edit deposit</button>
          </div>
        </div>
      ) : null}

      <div className="hp" aria-hidden="true">
        <label>
          Company website
          <input tabIndex={-1} autoComplete="off" value={state.companyWebsite} onChange={(event) => update("companyWebsite", event.target.value)} />
        </label>
      </div>

      <div className="form-actions">
        {step > 1 ? (
          <button type="button" className="btn btn-ghost" onClick={() => { setFormError(""); setStep((current) => current - 1); }} disabled={submitting}>
            Back
          </button>
        ) : <span />}
        <button
          type="button"
          className="btn btn-primary"
          disabled={submitting}
          data-testid={step === 4 ? "submit-application" : "continue-application"}
          onClick={(event) => {
            if (step < 4) onNext();
            else void onSubmit(event);
          }}
        >
          {step < 4 ? "Continue" : submitting ? "Saving your application…" : "Submit and book my call"}
        </button>
      </div>
    </form>
  );
}
