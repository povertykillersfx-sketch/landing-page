export const experienceOptions = [
  "I'm completely new",
  "Less than 6 months",
  "6–12 months",
  "1–2 years",
  "2–5 years",
  "5+ years",
] as const;

export const previousProductOptions = [
  "Trading course",
  "EA / Trading Bot",
  "Paid signals",
  "Mentorship",
  "Copy trading",
  "Other",
] as const;

export const DEPOSIT_LABEL = "ARE YOU READY TO FUND YOUR TRADING ACCOUNT WITH AT LEAST $100 TO UNLOCK ACCESS?";

/**
 * Funding readiness. `rank` controls "Highest deposit range" sorting.
 * Higher ranks sort first. `ready` is false for the Telegram-only path.
 */
export const depositOptions = [
  { value: "Yes, I am ready to fund $100–$499", rank: 2, ready: true },
  { value: "Yes, I am ready to fund $500–$1,000", rank: 3, ready: true },
  { value: "Yes, I am ready to fund $1,000+", rank: 4, ready: true },
  { value: "Not ready yet (Under $100)", rank: 1, ready: false },
] as const;

export type ExperienceOption = (typeof experienceOptions)[number];
export type PreviousProductOption = (typeof previousProductOptions)[number];
export type DepositOption = (typeof depositOptions)[number]["value"];

export function isReadyToFund(value: string) {
  return depositOptions.some((option) => option.value === value && option.ready);
}
