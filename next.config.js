/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['picsum.photos', 'images.unsplash.com', 'via.placeholder.com'],
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_AMAP_KEY: process.env.NEXT_PUBLIC_AMAP_KEY,
    NEXT_PUBLIC_IFLYTEK_APP_ID: process.env.NEXT_PUBLIC_IFLYTEK_APP_ID,
    NEXT_PUBLIC_IFLYTEK_API_KEY: process.env.NEXT_PUBLIC_IFLYTEK_API_KEY,
    NEXT_PUBLIC_IFLYTEK_API_SECRET: process.env.NEXT_PUBLIC_IFLYTEK_API_SECRET,
    NEXT_PUBLIC_UNSPLASH_ACCESS_KEY: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY,
  },
}

module.exports = nextConfig
