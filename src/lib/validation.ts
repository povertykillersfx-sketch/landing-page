import { parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";
import { depositOptions, experienceOptions, previousProductOptions } from "@/config/form-options";

export type CountryName = { name: string };

export type LeadPayload = {
  fullName: string;
  email: string;
  phone: string;
  whatsapp: string;
  country: string;
  tradingExperience: string;
  previouslyPurchased: boolean;
  previousProducts: string[];
  depositRange: string;
  depositRank: number;
};

export type FieldErrors = Record<string, string>;

export function sanitizeText(input: string, max: number, options?: { singleLine?: boolean }) {
  let value = input
    .replace(/\u0000/g, "")
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/<[^>]*>/g, "");
  if (options?.singleLine) value = value.replace(/\s+/g, " ");
  return value.trim().slice(0, max);
}

export function parseE164(raw: string, defaultCountry?: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  const iso = defaultCountry?.toUpperCase() as CountryCode | undefined;
  try {
    const phone = value.startsWith("+")
      ? parsePhoneNumberFromString(value)
      : iso
        ? parsePhoneNumberFromString(value, iso)
        : parsePhoneNumberFromString(value);
    if (!phone?.isValid()) return null;
    return phone.number;
  } catch {
    return null;
  }
}

export function normalizePhone(phoneCountry: string, nationalNumber: string): string | null {
  return parseE164(nationalNumber, phoneCountry);
}

export function formatPhone(phone: string): string {
  try {
    const parsed = parsePhoneNumberFromString(phone);
    return parsed ? parsed.formatInternational() : phone;
  } catch {
    return phone;
  }
}

export function whatsappHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : "";
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function validateAboutYou(
  input: {
    fullName?: unknown;
    email?: unknown;
    phone?: unknown;
    whatsapp?: unknown;
    country?: unknown;
    phoneCountry?: unknown;
  },
  countries: CountryName[],
): FieldErrors {
  const errors: FieldErrors = {};
  const fullName = sanitizeText(asString(input.fullName), 100, { singleLine: true });
  const email = asString(input.email).trim().toLowerCase();
  const country = asString(input.country).trim();
  const isoHint = asString(input.phoneCountry);
  const phone = parseE164(asString(input.phone), isoHint);
  const whatsappRaw = asString(input.whatsapp).trim();
  const whatsapp = whatsappRaw ? parseE164(whatsappRaw, isoHint) : "";

  if (fullName.length < 2 || !/[\p{L}]/u.test(fullName)) {
    errors.fullName = "Enter your full name.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    errors.email = "Enter a valid email address.";
  }
  if (!phone) {
    errors.phone = "Enter a valid phone number, including your country code.";
  }
  if (whatsappRaw && !whatsapp) {
    errors.whatsapp = "Enter a valid WhatsApp number, including your country code.";
  }
  if (!country || !countries.some((item) => item.name === country)) {
    errors.country = "Select your country.";
  }
  return errors;
}

export function validateExperience(input: {
  tradingExperience?: unknown;
  previouslyPurchased?: unknown;
  previousProducts?: unknown;
}): { errors: FieldErrors; value?: Pick<LeadPayload, "tradingExperience" | "previouslyPurchased" | "previousProducts"> } {
  const errors: FieldErrors = {};
  const tradingExperience = asString(input.tradingExperience).trim();
  if (!experienceOptions.includes(tradingExperience as (typeof experienceOptions)[number])) {
    errors.tradingExperience = "Select how long you have been trading.";
  }
  if (typeof input.previouslyPurchased !== "boolean") {
    errors.previouslyPurchased = "Tell us whether you have purchased a trading product before.";
  }
  const allowed = new Set<string>(previousProductOptions);
  const rawProducts = Array.isArray(input.previousProducts) ? input.previousProducts : [];
  const previousProducts = input.previouslyPurchased
    ? [...new Set(rawProducts.filter((item): item is string => typeof item === "string" && allowed.has(item)))]
    : [];
  if (Object.keys(errors).length) return { errors };
  return {
    errors,
    value: {
      tradingExperience,
      previouslyPurchased: input.previouslyPurchased as boolean,
      previousProducts,
    },
  };
}

export function validateCapital(input: { depositRange?: unknown }): {
  errors: FieldErrors;
  value?: Pick<LeadPayload, "depositRange" | "depositRank">;
} {
  const depositRange = asString(input.depositRange).trim();
  const match = depositOptions.find((option) => option.value === depositRange);
  if (!match) {
    return { errors: { depositRange: "Select your typical minimum deposit." } };
  }
  return { errors: {}, value: { depositRange: match.value, depositRank: match.rank } };
}

export function validateLead(input: unknown, countries: CountryName[]): { ok: true; value: LeadPayload } | { ok: false; errors: FieldErrors } {
  const source = typeof input === "object" && input !== null ? (input as Record<string, unknown>) : {};
  const aboutErrors = validateAboutYou(source, countries);
  const experience = validateExperience(source);
  const capital = validateCapital(source);
  const errors = { ...aboutErrors, ...experience.errors, ...capital.errors };
  if (source.consent !== true) {
    errors.consent = "Confirm the risk notice and terms to continue.";
  }
  if (Object.keys(errors).length || !experience.value || !capital.value) {
    return { ok: false, errors };
  }
  const isoHint = asString(source.phoneCountry);
  return {
    ok: true,
    value: {
      fullName: sanitizeText(asString(source.fullName), 100, { singleLine: true }),
      email: asString(source.email).trim().toLowerCase(),
      phone: parseE164(asString(source.phone), isoHint) || "",
      whatsapp: parseE164(asString(source.whatsapp), isoHint) || "",
      country: asString(source.country).trim(),
      ...experience.value,
      ...capital.value,
    },
  };
}
