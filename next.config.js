/** @type {import('next').NextConfig} */

const paths = process.env.NODE_ENV === 'production' ? '/Badminton' : ''
const nextConfig = {
  basePath: paths,
  assetPrefix: paths+'/',
  experimental: {
    appDir: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["localhost"],
    unoptimized: true,
  },
  output: "export",
}

module.exports = nextConfig
