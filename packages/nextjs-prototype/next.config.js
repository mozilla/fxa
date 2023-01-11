/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, options) => {
    // Need to do this because of this bug detailed in link below.
    // https://github.com/projectfluent/fluent.js/issues/517
    config.module.rules.push({
      include: /@fluent[\\/](bundle|langneg|syntax|dom|sequence)[\\/]/,
      test: /[.]js$/,
      type: 'javascript/esm',
    });

    return config;
  },
};

module.exports = nextConfig;
