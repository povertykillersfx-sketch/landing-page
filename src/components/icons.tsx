import type { FeatureIcon } from "@/config/features";

const props = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function FeatureIcon({ name }: { name: FeatureIcon }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {name === "scanner" && (
        <>
          <rect x="3" y="4" width="18" height="16" rx="2" {...props} />
          <path d="M7 9h10M7 12h6M7 15h8" {...props} />
        </>
      )}
      {name === "course" && (
        <>
          <path d="M4 6.5 12 4l8 2.5v11L12 20l-8-2.5v-11Z" {...props} />
          <path d="M12 4v16" {...props} />
        </>
      )}
      {name === "live" && (
        <>
          <circle cx="12" cy="12" r="8" {...props} />
          <path d="M10 9.5v5l4.5-2.5-4.5-2.5Z" {...props} />
        </>
      )}
      {name === "community" && (
        <>
          <path d="M8 14.5a3 3 0 1 0-2.2-5" {...props} />
          <path d="M16.2 9.5a3 3 0 1 1 2.2 5" {...props} />
          <path d="M7.2 14.2A3.8 3.8 0 0 0 4 18M16.8 14.2A3.8 3.8 0 0 1 20 18" {...props} />
          <circle cx="12" cy="10" r="2.2" {...props} />
          <path d="M8.6 18.2a4 4 0 0 1 6.8 0" {...props} />
        </>
      )}
      {name === "updates" && (
        <>
          <path d="M5 18V8m4.5 10V6M14 18v-7m4.5 7V5" {...props} />
        </>
      )}
      {name === "risk" && (
        <>
          <path d="M12 3 5 6v5c0 4.2 2.8 7.2 7 8.8 4.2-1.6 7-4.6 7-8.8V6l-7-3Z" {...props} />
          <path d="M12 8v4" {...props} />
          <path d="M12 15.5h.01" {...props} />
        </>
      )}
    </svg>
  );
}
