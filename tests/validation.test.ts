import { describe, expect, it } from "vitest";
import { getCountryOptions } from "@/lib/countries";
import { formatPhone, normalizePhone, sanitizeText, validateLead } from "@/lib/validation";

const countries = [{ name: "United States" }, { name: "United Kingdom" }];

const valid = {
  fullName: "Ada Lovelace",
  email: "Ada@Example.com",
  phone: "+14155552671",
  whatsapp: "+14155552671",
  country: "United States",
  tradingExperience: "1–2 years",
  previouslyPurchased: true,
  previousProducts: ["Trading course", "<script>alert(1)</script>"],
  depositRange: "$1,000–$4,999",
  consent: true,
};

describe("lead validation", () => {
  it("accepts a complete application and normalizes it", () => {
    const result = validateLead(valid, countries);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.email).toBe("ada@example.com");
    expect(result.value.previousProducts).toEqual(["Trading course"]);
    expect(result.value.whatsapp).toBe("+14155552671");
    expect(result.value.depositRank).toBe(4);
  });

  it("rejects missing and invalid fields", () => {
    const result = validateLead({ ...valid, fullName: "A", email: "not-an-email", phone: "123", country: "Atlantis", tradingExperience: "", previouslyPurchased: "yes", depositRange: "" }, countries);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.fullName).toBeTruthy();
    expect(result.errors.email).toBeTruthy();
    expect(result.errors.phone).toBeTruthy();
    expect(result.errors.country).toBeTruthy();
    expect(result.errors.tradingExperience).toBeTruthy();
    expect(result.errors.previouslyPurchased).toBeTruthy();
    expect(result.errors.depositRange).toBeTruthy();
  });

  it("requires consent and a WhatsApp number", () => {
    const result = validateLead({ ...valid, consent: false, whatsapp: "" }, countries);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.consent).toBeTruthy();
    expect(result.errors.whatsapp).toBeTruthy();
  });

  it("drops products when the lead has not purchased before", () => {
    const result = validateLead({ ...valid, previouslyPurchased: false, previousProducts: ["Mentorship"] }, countries);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.previousProducts).toEqual([]);
  });

  it("normalizes international phone numbers", () => {
    expect(normalizePhone("GB", "020 7183 8750")).toBe("+442071838750");
    expect(normalizePhone("US", "not a phone")).toBeNull();
    expect(formatPhone("+14155552671")).toContain("+1");
  });

  it("strips markup from free text", () => {
    expect(sanitizeText("<b>Hello</b> there", 100)).toBe("Hello there");
  });

  it("loads a country list for the form", () => {
    const options = getCountryOptions();
    expect(options.some((country) => country.code === "US" && country.dial === "+1")).toBe(true);
  });
});
