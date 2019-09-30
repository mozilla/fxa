const SentryWebpackPlugin = require('@sentry/webpack-plugin');

module.exports = function override(config, env) {
  config.plugins.push(
    new SentryWebpackPlugin({
      include: '.',
      ignore: ['node_modules'],
    })
  );
  return config;
};
