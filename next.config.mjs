/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Portfolio images are served from Supabase Storage. Uses remotePatterns
    // (images.domains is deprecated in Next 16).
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rizweifbhhosnylnxmio.supabase.co',
        pathname: '/storage/v1/object/public/portfolio/**',
      },
    ],
  },
};

export default nextConfig;
