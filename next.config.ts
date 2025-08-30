// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      // keep the next line only if you sometimes use Unsplash URLs
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
