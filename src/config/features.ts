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

export const featuresHeading = "What You Get Inside";

export const features: Feature[] = [
  {
    title: "Education Content",
    description:
      "Get access to the PKFX trading course. Learn market basics, how the scanner is used, risk management, and trading psychology. Built for beginners and for traders who want a clearer process.",
    icon: "course",
  },
  {
    title: "Live Trading Sessions",
    description:
      "Follow live market analysis and see how a trading process is applied in real time.",
    icon: "live",
  },
  {
    title: "AI Market Scanner",
    description:
      "Use the PKFX AI market scanner to review sessions and conditions across major markets. It supports analysis. It is not a signal service.",
    icon: "scanner",
  },
  {
    title: "Community of Traders",
    description: "Learn with other traders inside the PKFX community and stay with one process long enough to evaluate it.",
    icon: "community",
  },
  {
    title: "No Experience Required",
    description: "The course starts from the basics, so you can begin without a trading background.",
    icon: "updates",
  },
  {
    title: "Live Support",
    description: "Get help while you learn the tools, the course, and the process.",
    icon: "risk",
  },
];
