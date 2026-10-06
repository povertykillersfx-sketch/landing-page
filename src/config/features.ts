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
      "Get access to our comprehensive A-Z trading course. Learn everything from market basics to advanced institutional concepts, proper risk management, and trading psychology. Perfect for both beginners and experienced traders looking to refine their edge.",
    icon: "course",
  },
  {
    title: "Live Trading Sessions",
    description:
      "Watch over our shoulders as we analyze the charts, execute trades, and manage positions in real-time. We host live sessions during the most volatile market hours (London and New York sessions) so you can learn exactly how we navigate live market conditions.",
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
    description:
      "Join a global network of like-minded traders. Share your setups, ask questions, and learn together in a supportive environment focused on process and consistency.",
    icon: "community",
  },
  {
    title: "No Experience Required",
    description:
      "Whether you've never opened a chart or you've been trading for years, our system meets you where you are.",
    icon: "updates",
  },
  {
    title: "Live Support",
    description:
      "Get help from real traders in our Telegram community whenever you need it. Ask questions, share ideas, and never trade alone.",
    icon: "risk",
  },
];
