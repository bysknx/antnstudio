/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ne casse pas le build si ESLint râle
  },
};

export default nextConfig;
