import { socialProof } from "@/config/metrics";

const AVATARS = ["purple", "pink", "blue", "amber"] as const;

export function SocialProof() {
  if (!socialProof.communityCount.trim() && !socialProof.rating.trim()) return null;
  return (
    <div className="lp-proof" aria-label="Community social proof">
      {socialProof.communityCount.trim() ? (
        <div className="lp-avatars" aria-hidden="true">
          {AVATARS.map((tone) => (
            <span className={`lp-avatar ${tone}`} key={tone}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6" />
                <path d="M6 18.2c.6-3 3-4.6 6-4.6s5.4 1.6 6 4.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </span>
          ))}
          <span className="lp-avatar count">{socialProof.communityCount}</span>
        </div>
      ) : null}
      <div className="lp-proof-copy">
        {socialProof.rating.trim() ? (
          <p className="lp-rating">
            <span aria-hidden="true">⭐</span> {socialProof.rating}{" "}
            <span>{socialProof.ratingLabel}</span>
          </p>
        ) : null}
        <p>{socialProof.supporting}</p>
      </div>
    </div>
  );
}
