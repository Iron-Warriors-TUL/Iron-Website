/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  async rewrites() {
    // Maski adresów zgodne z docelowym serwisem WordPress.
    return [
      { source: '/zespol-:year', destination: '/zespol/:year' },
      { source: '/partnerzy-:year', destination: '/partnerzy/:year' },
      { source: '/rada-kol-naukowych-pl', destination: '/projekty/rada-kol' },
      { source: '/projekty-:slug', destination: '/projekty/:slug' },
      { source: '/eco-arrow-3', destination: '/bolidy/eco-arrow-3' },
      { source: '/eco-arrow-2-electric', destination: '/bolidy/eco-arrow-2-electric' },
      { source: '/eco-arrow-2', destination: '/bolidy/eco-arrow-2' },
      { source: '/eco-arrow-1', destination: '/bolidy/eco-arrow-1' },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        source: '/iw-panel-7k2q/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
    ]
  },
}

export default nextConfig
