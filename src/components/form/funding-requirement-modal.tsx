"use client";

import { useEffect } from "react";
import { PKFX_CONFIG } from "@/config/site";

const TELEGRAM_URL = "https://t.me/pkfxtradingcommunity";

export function FundingRequirementModal({
  telegramUrl = PKFX_CONFIG.telegramUrl || TELEGRAM_URL,
}: {
  telegramUrl?: string;
}) {
  const href = telegramUrl || TELEGRAM_URL;

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);
  return (
    <div className="funding-modal" role="presentation">
      <div
        className="funding-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="funding-modal-title"
      >
        <h2 id="funding-modal-title">Important Platform Requirement</h2>
        <p>
          Our free course, AI market scanner, and VIP Inner Circle require a minimum $100 deposit in your live
          trading account with our partner broker to activate.
        </p>
        <p>
          You are now being redirected to our Free Telegram Community. Once you have your $100 ready to fund, you
          can request full platform access inside the group at any time!
        </p>
        <a className="btn btn-spot funding-modal-btn" href={href}>
          OK, Join Free Telegram
        </a>
      </div>
    </div>
  );
}
