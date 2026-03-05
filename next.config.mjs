/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ne casse pas le build si ESLint râle
  },
  async redirects() {
    return [{ source: "/contact", destination: "/about", permanent: true }];
  },
};

export default nextConfig;
