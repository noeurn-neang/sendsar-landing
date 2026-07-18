import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  // Console routes are auth-dynamic; avoid accidental static assumptions.
  experimental: {
    // Keep server actions / RSC payloads lean on hosted deploys.
    optimizePackageImports: ["next-auth"],
  },
};

export default nextConfig;
