import type { NextConfig } from "next";

/**
 * Allow next/image to load uploaded media from Supabase Storage.
 *
 * The exact project hostname comes from the environment variable, but that is
 * only read at build time: a deploy that runs before the variable is set would
 * otherwise ship an empty allow list and break every uploaded image. The
 * scoped wildcard keeps images working in that case, and is limited to the
 * public storage path so it cannot be used to proxy arbitrary URLs.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHostname = supabaseUrl ? new URL(supabaseUrl).hostname : null;
const STORAGE_PATH = "/storage/v1/object/public/**";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      ...(supabaseHostname
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHostname,
              pathname: STORAGE_PATH,
            },
          ]
        : []),
      {
        protocol: "https" as const,
        hostname: "*.supabase.co",
        pathname: STORAGE_PATH,
      },
    ],
  },
};

export default nextConfig;
