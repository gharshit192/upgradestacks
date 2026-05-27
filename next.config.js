/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  // Enable ISR globally
  experimental: {
    staleTimes: {
      dynamic: 86400, // 24 hours
    },
  },
}

module.exports = nextConfig
