/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { resolve } = require('path');
const PATH = process.env.PATH.split(':')
  .filter((p) => !p.includes(process.env.TMPDIR))
  .join(':');

module.exports = {
  apps: [
    {
      name: 'admin',
      cwd: resolve(__dirname, 'server'),
      script: 'node -r ts-node/register bin/fxa-admin-panel.ts',
      max_restarts: '1',
      min_uptime: '2m',
      env: {
        LOGGING_FORMAT: 'pretty',
        NODE_ENV: 'development',
        NODE_OPTIONS: '--inspect=9140',
        PROXY_STATIC_RESOURCES_FROM: 'http://localhost:8092',
        CONFIG_FILES: '../config/secrets.json',
        PORT: '8091',
        PATH,
      },
      filter_env: ['npm_'],
      time: true,
    },
    {
      name: 'admin-react',
      cwd: __dirname,
      script: 'yarn rescripts start',
      max_restarts: '1',
      min_uptime: '2m',
      env: {
        SKIP_PREFLIGHT_CHECK: 'true',
        NODE_ENV: 'development',
        PUBLIC_URL: 'http://localhost:8091',
        BROWSER: 'NONE',
        PORT: '8092',
        PATH,
      },
      filter_env: ['npm_', 'BERRY_BIN_FOLDER'],
      time: true,
    },
    {
      name: 'admin-css',
      script: 'yarn build-postcss',
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
        'src/components/**/*.scss',
        require.resolve('fxa-react/configs/tailwind.js'),
      ],
      ignore_watch: ['src/styles/tailwind.out.css'],
      time: true,
    },
  ],
};
