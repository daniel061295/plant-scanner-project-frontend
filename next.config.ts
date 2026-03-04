import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Cloudflare R2 / any R2 bucket subdomain
      {
        protocol: "https",
        hostname: "**.cloudflarestorage.com",
      },
      // Cloudflare R2 public bucket custom domains (if configured)
      {
        protocol: "https",
        hostname: "**.r2.dev",
      },
      // UI Avatars fallback
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
    ],
  },
};

export default nextConfig;
