/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@melhore/types'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
}

module.exports = nextConfig
