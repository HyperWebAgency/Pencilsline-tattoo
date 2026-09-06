/** @type {import('next').NextConfig} */
const nextConfig = {
  // Dev only: Next blocks cross-origin requests to dev assets, so opening the
  // dev server from a phone on the same wifi (http://192.168.x.x:3000) leaves
  // client JS uninitialised. Needed to test on a real device.
  allowedDevOrigins: ['192.168.1.144', '192.168.1.*'],

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
