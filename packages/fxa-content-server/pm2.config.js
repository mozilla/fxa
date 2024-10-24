/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path = require('path');
const PATH = process.env.PATH.split(':')
  .filter((p) => !p.includes(process.env.TMPDIR))
  .join(':');

const apps = [];

apps.push({
  name: 'content',
  script:
    'node -r esbuild-register --inspect=9130 server/bin/fxa-content-server.js',
  cwd: __dirname,
  env: {
    NODE_ENV: 'development',
    NODE_OPTIONS: '--openssl-legacy-provider --dns-result-order=ipv4first',
    CONFIG_FILES: 'server/config/local.json',
    PORT: 3030,
    PATH,
    SENTRY_ENV: 'local',
    SENTRY_DSN: process.env.SENTRY_DSN_CONTENT,
    TRACING_SERVICE_NAME: 'fxa-content-server',
    TRACING_CLIENT_NAME: 'fxa-content-client',
  },
});

if (process.env.CI !== 'true') {
  apps.push({
    name: 'content-css',
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
      'app/scripts/templates/**/*.mustache',
      'app/styles/tailwind.css',
      'app/styles/tailwind/**/*.css',
      require.resolve('fxa-react/configs/tailwind'),
      path.normalize(
        `${path.dirname(
          require.resolve('fxa-react/configs/tailwind')
        )}/../styles`
      ),
    ],
    time: true,
  });
}

module.exports = {
  apps,
};
