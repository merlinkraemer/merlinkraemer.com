import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    images: {
    remotePatterns: [
            {
            protocol: "https",
            hostname: "**.r2.dev"
            }
    ]
    },
    experimental: {
        serverActions: {
            bodySizeLimit: "500mb"
        }
    }
};

export default nextConfig;
