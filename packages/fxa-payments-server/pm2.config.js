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
      name: 'payments',
      cwd: __dirname,
      script: 'node server/bin/fxa-payments-server.js',
      max_restarts: '1',
      min_uptime: '2m',
      env: {
        LOGGING_FORMAT: 'pretty',
        NODE_ENV: 'development',
        NODE_OPTIONS: '--inspect=9170',
        PROXY_STATIC_RESOURCES_FROM: 'http://localhost:3032',
        CONFIG_FILES: 'server/config/secrets.json',
        PORT: '3031',
        PATH,
        SENTRY_ENV: 'local',
        SENTRY_DSN: process.env.SENTRY_DSN_PAYMENTS,
      },
      filter_env: ['npm_'],
      time: true,
    },
    {
      name: 'payments-react',
      cwd: __dirname,
      script: 'yarn rescripts start',
      max_restarts: '1',
      min_uptime: '2m',
      env: {
        SKIP_PREFLIGHT_CHECK: 'true',
        NODE_ENV: 'development',
        PUBLIC_URL: 'http://localhost:3031',
        BROWSER: 'NONE',
        PORT: '3032',
        PATH,
      },
      filter_env: ['npm_', 'BERRY_BIN_FOLDER'],
      time: true,
    },
    {
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
        require.resolve('fxa-react/configs/tailwind.js'),
        path.normalize(
          `${path.dirname(
            require.resolve('fxa-react/configs/tailwind.js')
          )}/../styles`
        ),
      ],
      ignore_watch: ['src/styles/tailwind.out.*'],
      time: true,
    },
  ],
};
