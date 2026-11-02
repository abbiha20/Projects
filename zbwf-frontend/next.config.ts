import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // This disables ESLint during the build
  },
  typescript: {
    ignoreBuildErrors: true, // This disables TypeScript validation during the build
  },
  images: {
    domains: ["zbwf.s3.amazonaws.com", "zbwf.s3.ap-southeast-2.amazonaws.com"],
  },
  // Other config options can go here
};

export default nextConfig;
