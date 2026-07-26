import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output produces a minimal, self-contained server bundle
  // (node_modules pruned to only what's traced as used) for the Docker image.
  output: "standalone",

  // The same-origin `/api/backend/*` proxy (for Docker/Codespaces, where
  // NEXT_PUBLIC_API_URL is a relative path) is implemented as a Route
  // Handler — src/app/api/backend/[...path]/route.ts — not a rewrite here,
  // since rewrites buffer/re-forward the body and hit real size limits on
  // large uploads. Not used in plain local dev, where NEXT_PUBLIC_API_URL
  // is already an absolute backend URL and that route is never called.
};

export default nextConfig;
