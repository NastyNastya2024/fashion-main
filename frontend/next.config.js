/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  basePath: process.env.NODE_ENV === 'production' && process.env.BASE_PATH ? process.env.BASE_PATH : '',
  assetPrefix: process.env.NODE_ENV === 'production' && process.env.BASE_PATH ? process.env.BASE_PATH : undefined,
  env: { NEXT_PUBLIC_BASE_PATH: process.env.BASE_PATH || '' },
  images: {
    unoptimized: true,
    domains: ['localhost', 'api.stylegenie.com', 'via.placeholder.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.replicate.delivery',
      },
      {
        protocol: 'https',
        hostname: 'replicate.delivery',
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '**.s3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      // Add specific domains as needed instead of allowing all
    ],
  },
}

module.exports = nextConfig
