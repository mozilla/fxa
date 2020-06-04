/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

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
      },
      filter_env: ['npm_', 'BERRY_BIN_FOLDER'],
    },
    {
      name: 'settings-css',
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
    },
  ],
};
