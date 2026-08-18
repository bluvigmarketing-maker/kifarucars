import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allows next/image to load admin-uploaded vehicle photos from Supabase
    // Storage's public URLs (https://<project-ref>.supabase.co/storage/v1/...).
    remotePatterns: [{ protocol: "https", hostname: "**.supabase.co" }],
  },
};

export default nextConfig;
