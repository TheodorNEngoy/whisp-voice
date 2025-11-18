import { createRequire } from "module";

const require = createRequire(import.meta.url);
const withNextIntl = (config = {}) => config;

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: false
  }
};

export default withNextIntl(nextConfig);
