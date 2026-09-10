import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* allow product images pasted as external URLs from the admin panel */
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
