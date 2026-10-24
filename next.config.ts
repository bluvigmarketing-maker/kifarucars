import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allows next/image to load admin-uploaded vehicle photos from Supabase
    // Storage's public URLs (https://<project-ref>.supabase.co/storage/v1/...).
    remotePatterns: [{ protocol: "https", hostname: "**.supabase.co" }],
  },
  // The PDF invoice (src/lib/invoices/pdf.ts) reads the logo from disk, so
  // ship it with every server function that can send one.
  outputFileTracingIncludes: {
    "/*": ["./public/images/Kifaru-logo.png"],
  },
};

export default nextConfig;
