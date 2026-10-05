export type Testimonial = {
  name: string;
  role: string;
  image: string;
  testimonial: string;
  screenshot: string;
};

/**
 * Sample testimonials for layout preview only.
 * They are not real customer reviews.
 * Replace the entries below, then set testimonialsArePlaceholders to false
 * before publishing real quotes.
 */
export const testimonialsArePlaceholders = true;

export const testimonials: Testimonial[] = [
  {
    name: "Sample Trader A",
    role: "Placeholder — replace in config",
    image: "",
    testimonial:
      "This is sample copy for layout preview only. Replace it with a real testimonial before publishing.",
    screenshot: "",
  },
  {
    name: "Sample Trader B",
    role: "Placeholder — replace in config",
    image: "",
    testimonial:
      "Sample quote about the education and community. This person is not a real PKFX member.",
    screenshot: "",
  },
  {
    name: "Sample Trader C",
    role: "Placeholder — replace in config",
    image: "",
    testimonial:
      "Sample quote about using a clearer process. Do not present this as a genuine review.",
    screenshot: "",
  },
];
