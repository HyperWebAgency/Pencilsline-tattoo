/** @type {import('next').NextConfig} */
const nextConfig = {
  // Dev only: Next blocks cross-origin requests to dev assets, so opening the
  // dev server from a phone on the same wifi (http://192.168.x.x:3000) leaves
  // client JS uninitialised. Needed to test on a real device.
  allowedDevOrigins: ['192.168.1.144', '192.168.1.*'],

  // The pages of Alexandra's previous site (IONOS MyWebsite, on the same
  // domain until 5 October 2026), from its sitemap. Permanent, so the ranking
  // they built passes to the pages that replace them.
  async redirects() {
    return [
      { source: '/contact-tatoueuse-montpellier', destination: '/contact', permanent: true },
      { source: '/reservation-tatouage-montpellier', destination: '/contact', permanent: true },
      { source: '/galerie-tatouages', destination: '/portfolio', permanent: true },
      { source: '/dessins-flashs-tatouages', destination: '/portfolio', permanent: true },
      // Two placeholder posts the site builder shipped with.
      { source: '/my-first-blog-postdf896e93', destination: '/', permanent: true },
      { source: '/10-reasons-you-should-love-blogging5659edd9', destination: '/', permanent: true },
    ];
  },

  // Browser protections on every page (HSTS comes from Vercel):
  // - no other site may show these pages in a frame, so nobody can lay a
  //   trap over /admin and make her click « Supprimer » unawares;
  // - files are taken for what they're served as, never sniffed;
  // - other sites get the origin at most, never a path such as /projet/<id>.
  //   Formspree's domain check only needs the origin;
  // - no camera, microphone or location.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },

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
