const SentryWebpackPlugin = require('@sentry/webpack-plugin');

module.exports = {
  // other configuration
  plugins: [
    new SentryWebpackPlugin({
      include: '.',
      // ignoreFile: '.sentrycliignore',
      ignore: ['node_modules'],
      // configFile: 'sentry.properties'
    }),
  ],
};
