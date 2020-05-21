/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = {
  apps: [
    {
      name: 'fortress',
      script: 'server.js',
      cwd: __dirname,
      max_restarts: '1',
      env: {
        CONFIG_FORTRESS: './config-local.json',
        NODE_ENV: 'dev',
        PORT: '9292',
      },
      filter_env: ['npm_'],
      min_uptime: '2m',
    },
  ],
};
