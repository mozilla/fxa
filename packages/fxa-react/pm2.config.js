/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const PATH = process.env.PATH.split(':')
  .filter((p) => !p.includes(process.env.TMPDIR))
  .join(':');

module.exports = {
  apps: [
    {
      name: 'react-tsc',
      script: 'yarn tsc --build --watch',
      cwd: __dirname,
      max_restarts: '1',
      env: {
        PATH,
      },
      filter_env: ['npm_'],
      time: true,
    },
    {
      name: 'react-css',
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
        'configs/tailwind.js',
        'styles',
      ],
      ignore_watch: ['styles/tailwind.out.css'],
      time: true,
    },
  ],
};
