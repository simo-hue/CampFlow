import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.NEXT_PUBLIC_BUILD_MODE === 'static' ? 'export' : undefined,
  basePath: '/CampFlow',
  images: {
    unoptimized: process.env.NEXT_PUBLIC_BUILD_MODE === 'static',
  },
};

export default nextConfig;
