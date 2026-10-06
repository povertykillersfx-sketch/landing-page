export type Testimonial = {
  name: string;
  role: string;
  image: string;
  testimonial: string;
  screenshot: string;
};

export const testimonialsArePlaceholders = false;

export const resultsHeading = "Student / Member Results";
export const resultsNote =
  "Screenshots shared by PKFX members. Individual results vary. Trading involves risk and past results do not guarantee future results.";

export const testimonials: Testimonial[] = [
  {
    name: "PKFX member",
    role: "Market scanner",
    image: "",
    testimonial: "Started using the market scanner on Friday, the results are crazy",
    screenshot: "/results/member-scanner-friday.jpg",
  },
  {
    name: "PKFX member",
    role: "Market scanner",
    image: "",
    testimonial: "The market scanner is too much",
    screenshot: "/results/member-scanner-too-much.jpg",
  },
  {
    name: "PKFX member",
    role: "First day with the scanner",
    image: "",
    testimonial: "First day having access to the AI market scanner. Managed to secure £30",
    screenshot: "/results/member-first-day.jpg",
  },
  {
    name: "Kelvin",
    role: "PKFX member",
    image: "",
    testimonial: "I was scalping gold using the market scanner. Made $186 profits",
    screenshot: "/results/member-kelvin-gold.jpg",
  },
  {
    name: "Ahmed G",
    role: "PKFX member",
    image: "",
    testimonial: "Ever since I started using the Market Scanner, trading has become so much easier",
    screenshot: "/results/member-ahmed-scanner.jpg",
  },
];
