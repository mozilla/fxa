/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path = require('path');
const PATH = process.env.PATH.split(':')
  .filter((p) => !p.includes(process.env.TMPDIR))
  .join(':');

const apps = [];
apps.push({
  name: 'payments',
  cwd: __dirname,
  script: 'node -r esbuild-register server/bin/fxa-payments-server.js',
  max_restarts: '1',
  min_uptime: '2m',
  env: {
    LOGGING_FORMAT: 'pretty',
    NODE_ENV: 'development',
    NODE_OPTIONS: '--inspect=9170 --dns-result-order=ipv4first',
    PROXY_STATIC_RESOURCES_FROM: 'http://localhost:3032',
    CONFIG_FILES: 'server/config/secrets.json',
    PORT: '3031',
    PATH,
    SENTRY_ENV: 'local',
    SENTRY_DSN: process.env.SENTRY_DSN_PAYMENTS,
    TRACING_SERVICE_NAME: 'fxa-payments-server',
    TS_NODE_PROJECT: 'server/tsconfig.json',
  },
  filter_env: ['npm_'],
  time: true,
});
apps.push({
  name: 'payments-react',
  cwd: __dirname,
  script: 'yarn rescripts start',
  max_restarts: '1',
  min_uptime: '2m',
  env: {
    SKIP_PREFLIGHT_CHECK: 'true',
    NODE_ENV: 'development',
    NODE_OPTIONS: '--openssl-legacy-provider',
    PUBLIC_URL: 'http://localhost:3031',
    BROWSER: 'NONE',
    PORT: '3032',
    PATH,
  },
  filter_env: ['npm_', 'BERRY_BIN_FOLDER'],
  time: true,
});

if (process.env.CI !== 'true') {
  apps.push({
    name: 'payments-css',
    script: 'yarn build-css',
    cwd: __dirname,
    env: {
      PATH,
    },
    filter_env: ['npm_'],
    autorestart: false,
    watch: [
      'postcss.config.js',
      'tailwind.config.js',
      'src/styles',
      'src/components/**/*.css',
      'src/**/*.tsx',
      require.resolve('fxa-react/configs/tailwind'),
      path.normalize(
        `${path.dirname(
          require.resolve('fxa-react/configs/tailwind')
        )}/../styles`
      ),
    ],
    ignore_watch: ['src/styles/tailwind.out.*'],
    time: true,
  });
  apps.push({
    name: 'payments-ftl',
    script: 'yarn grunt watch-ftl',
    cwd: __dirname,
    filter_env: ['npm_'],
    max_restarts: '1',
    min_uptime: '2m',
    time: true,
  });
}

module.exports = {
  apps,
};
