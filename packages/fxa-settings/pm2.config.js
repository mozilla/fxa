/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path = require('path');
const PATH = process.env.PATH.split(':')
  .filter((p) => !p.includes(process.env.TMPDIR))
  .join(':');

const apps = [];

apps.push({
  name: 'settings-react',
  cwd: __dirname,
  script: 'node scripts/start.js',
  max_restarts: '1',
  min_uptime: '2m',
  env: {
    SKIP_PREFLIGHT_CHECK: 'true',
    NODE_ENV: 'development',
    NODE_OPTIONS: '--openssl-legacy-provider --dns-result-order=ipv4first',
    BROWSER: 'NONE',
    PORT: '3000',
    PATH,
    TRACING_SERVICE_NAME: 'fxa-settings-server',
    TRACING_CLIENT_NAME: 'fxa-settings-client',
  },
  filter_env: ['npm_', 'BERRY_BIN_FOLDER'],
  time: true,
});

if (process.env.CI !== 'true') {
  apps.push({
    name: 'settings-css',
    script: 'yarn build-css',
    cwd: __dirname,
    env: {
      PATH,
      SENTRY_ENV: 'local',
      SENTRY_DSN: process.env.SENTRY_DSN_CONTENT, // NOTE: Shared with content server intentionally
    },
    filter_env: ['npm_'],
    autorestart: false,
    watch: [
      'postcss.config.js',
      'tailwind.config.js',
      'src/styles',
      'src/**/*.tsx',
      path.normalize(
        `${path.dirname(
          require.resolve('fxa-react/configs/tailwind')
        )}/../styles`
      ),
      require.resolve('fxa-react/configs/tailwind'),
    ],
    ignore_watch: ['src/styles/tailwind.out.*'],
    time: true,
  });

  apps.push({
    name: 'settings-ftl',
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
