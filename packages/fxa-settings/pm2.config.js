/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path = require('path');
const PATH = process.env.PATH.split(':')
  .filter((p) => !p.includes(process.env.TMPDIR))
  .join(':');

module.exports = {
  apps: [
    {
      name: 'settings-react',
      cwd: __dirname,
      script: 'yarn rescripts start',
      max_restarts: '1',
      min_uptime: '2m',
      env: {
        SKIP_PREFLIGHT_CHECK: 'true',
        NODE_ENV: 'development',
        BROWSER: 'NONE',
        PORT: '3000',
        PATH,
        TRACING_SERVICE_NAME: 'fxa-settings-server',
        TRACING_CLIENT_NAME: 'fxa-settings-client',
      },
      filter_env: ['npm_', 'BERRY_BIN_FOLDER'],
      time: true,
    },
    {
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
            require.resolve('fxa-react/configs/tailwind.js')
          )}/../styles`
        ),
        require.resolve('fxa-react/configs/tailwind.js'),
      ],
      ignore_watch: ['src/styles/tailwind.out.*'],
      time: true,
    },
  ],
};
