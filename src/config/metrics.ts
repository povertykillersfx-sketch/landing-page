export type Metric = {
  id: string;
  label: string;
  value: string;
};

/**
 * Social proof figures. Leave value as an empty string until you have a
 * number you want to publish. Empty values are not shown as fake stats.
 */
export const socialProof = {
  heading: "Built For Traders Who Want To Take Their Trading Seriously",
  supporting: "Trusted by hundreds of global traders",
  ratingLabel: "Average Rate",
  rating: "4.92",
  communityCount: "800+",
  metrics: [
    { id: "community", label: "Community Members", value: "800+" },
    { id: "sessions", label: "Live Sessions", value: "" },
    { id: "resources", label: "Educational Resources", value: "" },
    { id: "traders", label: "Traders Using PKFX", value: "" },
  ] satisfies Metric[],
};

export const trustPoints = [
  {
    title: "Tools",
    text: "A market scanner designed to support analysis, not replace a trading plan.",
  },
  {
    title: "Education",
    text: "A free course and live sessions focused on process, from first concepts onward.",
  },
  {
    title: "Community",
    text: "A place to learn with other traders and stay with one approach long enough to evaluate it.",
  },
  {
    title: "Risk awareness",
    text: "Risk management is taught as part of the process, not as an afterthought.",
  },
];
