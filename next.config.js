/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/search-cards',
        destination: '/api/search',
      },
    ];
  },
};


module.exports = nextConfig;
