"use client";

import { trackEvent } from "ga-analytics-harness/trackEvent";
import { useEffect } from "react";

export function PageViewTracker({
  pagePath,
  componentName,
}: {
  pagePath: string;
  componentName: string;
}) {
  useEffect(() => {
    trackEvent("page_view", {
      page_path: pagePath,
      component_name: componentName,
    });
  }, [pagePath, componentName]);

  return null;
}
