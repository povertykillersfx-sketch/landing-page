export type FeatureIcon =
  | "scanner"
  | "course"
  | "live"
  | "community"
  | "updates"
  | "risk";

export type Feature = {
  title: string;
  description: string;
  icon: FeatureIcon;
};

export const featuresHeading = "What You’ll Get";

export const features: Feature[] = [
  {
    title: "AI Market Scanner",
    description: "Analyze the market using the PKFX AI-powered market scanner.",
    icon: "scanner",
  },
  {
    title: "Free Trading Course",
    description:
      "A structured course covering trading concepts from beginner to more advanced topics.",
    icon: "course",
  },
  {
    title: "Live Trading Sessions",
    description:
      "Follow live market analysis and see how trading decisions are approached in real time.",
    icon: "live",
  },
  {
    title: "Trading Community",
    description: "Connect with other traders, learn and share experiences.",
    icon: "community",
  },
  {
    title: "Market Updates",
    description: "Stay informed with market analysis and updates.",
    icon: "updates",
  },
  {
    title: "Risk Management Education",
    description: "Learn the importance of managing risk as part of a trading process.",
    icon: "risk",
  },
];
