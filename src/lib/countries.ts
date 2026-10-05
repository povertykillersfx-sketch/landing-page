import { getCountries, getCountryCallingCode, type CountryCode } from "libphonenumber-js";

export type CountryOption = {
  code: CountryCode;
  name: string;
  dial: string;
};

let cache: CountryOption[] | null = null;

export function getCountryOptions(): CountryOption[] {
  if (cache) return cache;
  const names = new Intl.DisplayNames(["en"], { type: "region" });
  cache = getCountries()
    .map((code) => {
      const name = names.of(code);
      if (!name || name === code) return null;
      return {
        code,
        name,
        dial: `+${getCountryCallingCode(code)}`,
      };
    })
    .filter((country): country is CountryOption => Boolean(country))
    .sort((a, b) => a.name.localeCompare(b.name, "en"));
  return cache;
}

export function flagEmoji(code: string): string {
  return code
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}
