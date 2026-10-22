import type { NextConfig } from "next";
import {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
} from "next/constants";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // Off: every page is static, so links should prefetch the complete page and
  // navigate instantly. Partial prefetching only prefetches an app shell and
  // suits pages with request-time content, which this site doesn't have.
  partialPrefetching: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default async function config(phase: string): Promise<NextConfig> {
  // Build content with Velite before Next.js compiles (watching in dev).
  // Next.js loads this config more than once; the env flag runs Velite once.
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;
  const isBuild = phase === PHASE_PRODUCTION_BUILD;
  if ((isDev || isBuild) && !process.env.VELITE_STARTED) {
    process.env.VELITE_STARTED = "1";
    const { build } = await import("velite");
    await build({ watch: isDev, clean: !isDev });
  }

  return nextConfig;
}
