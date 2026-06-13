/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Allow all image domains (local images from public/ folder)
  images: {
    unoptimized: false,
  },
};

module.exports = nextConfig;