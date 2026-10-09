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

/**
 * Typical minimum deposit. Change labels here if the ranges change.
 * `rank` controls "Highest deposit range" sorting. Higher ranks sort first.
 */
export const depositOptions = [
  { value: "Under $100", rank: 1 },
  { value: "$100–$499", rank: 2 },
  { value: "$500–$999", rank: 3 },
  { value: "$1000+", rank: 4 },
] as const;

export type ExperienceOption = (typeof experienceOptions)[number];
export type PreviousProductOption = (typeof previousProductOptions)[number];
export type DepositOption = (typeof depositOptions)[number]["value"];
