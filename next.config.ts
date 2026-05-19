import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: "standalone",
  serverExternalPackages: [],
  /* other config options here */
};

export default nextConfig;
