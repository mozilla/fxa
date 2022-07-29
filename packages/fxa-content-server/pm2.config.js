/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const PATH = process.env.PATH.split(':')
  .filter((p) => !p.includes(process.env.TMPDIR))
  .join(':');

module.exports = {
  apps: [
    {
      name: 'content',
      script: 'node --inspect=9130 server/bin/fxa-content-server.js',
      cwd: __dirname,
      env: {
        NODE_ENV: 'development',
        CONFIG_FILES: 'server/config/local.json',
        PORT: 3030,
        PATH,
        SENTRY_ENV: 'local',
        SENTRY_DSN: process.env.SENTRY_DSN_CONTENT,
      },
      filter_env: ['npm_'],
      watch: ['server'],
      max_restarts: '1',
      min_uptime: '2m',
      time: true,
    },
    {
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
        require.resolve('fxa-react/configs/tailwind.js'),
      ],
      time: true,
    },
  ],
};
