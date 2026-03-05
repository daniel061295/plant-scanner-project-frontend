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
      // Railway backend (Local Media Fallback)
      {
        protocol: "https",
        hostname: "django-clean-architecture-crud-production.up.railway.app",
      },
      // UI Avatars fallback
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
      // Google Auth Avatars
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  experimental: {
    staleTimes: {
      dynamic: 300,
    },
  },
};

export default nextConfig;
