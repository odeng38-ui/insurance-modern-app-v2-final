/** @type {import('next').NextConfig} */
const nextConfig = {
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
