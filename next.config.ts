import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output produces a minimal, self-contained server bundle
  // (node_modules pruned to only what's traced as used) for the Docker image.
  output: "standalone",
};

export default nextConfig;
