/** @type {import('next').NextConfig} */
const paths = process.env.NODE_ENV === 'production' ? '/Badminton/' : ''
const nextConfig = {
  basePath: paths,
  assetPrefix: paths,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: "export",
}

export default nextConfig
