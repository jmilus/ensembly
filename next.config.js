module.exports = {
  reactStrictMode: true,
  experimental: {},
  // webpack5: true,
  webpack: config => {
    config.resolve.fallback = {
      fs: false,
    };

    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.DATABASE_URL,
        port: '',
        pathname: '/**',
      },
    ],
  },
}

