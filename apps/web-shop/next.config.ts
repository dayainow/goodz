import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@goodz/ui", "@goodz/types", "ga-analytics-harness"],
};

export default nextConfig;
