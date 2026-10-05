"use client";

import { useEffect } from "react";
import { trackOnce } from "@/lib/analytics-client";

export function TrackView({ event }: { event: string }) {
  useEffect(() => {
    trackOnce(event);
  }, [event]);
  return null;
}
