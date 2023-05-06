module.exports = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
  },
  webpack5: true,
  webpack: config => {
    config.resolve.fallback = {
      fs: false,
    };

    return config;
  },
}

