"use client";

import { configureAnalytics } from "ga-analytics-harness/trackEvent";
import { useEffect } from "react";

const measurementId =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-GOODZDEV01";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    configureAnalytics({ measurementId });
  }, []);

  return children;
}
