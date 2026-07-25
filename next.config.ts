import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output produces a minimal, self-contained server bundle
  // (node_modules pruned to only what's traced as used) for the Docker image.
  output: "standalone",

  // Server-side proxy for the same-origin `/api/backend/*` path the browser
  // calls when NEXT_PUBLIC_API_URL is a relative path (see docker-compose.yml).
  // Not used in plain local dev, where NEXT_PUBLIC_API_URL is already an
  // absolute backend URL and this rewrite is simply never matched.
  async rewrites() {
    const backendInternalUrl = process.env.BACKEND_INTERNAL_URL ?? "http://localhost:8000";
    return [
      {
        source: "/api/backend/:path*",
        destination: `${backendInternalUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
