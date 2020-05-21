/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = {
  apps: [
    {
      name: 'profile',
      script: 'bin/server.js',
      cwd: __dirname,
      max_restarts: '1',
      env: {
        NODE_ENV: 'development',
        HOST: '0.0.0.0',
        DB: 'mysql',
        PORT: '1111',
      },
      filter_env: ['npm_'],
      min_uptime: '2m',
    },
    {
      name: 'profile-worker',
      script: 'bin/worker.js',
      cwd: __dirname,
      max_restarts: '1',
      env: {
        NODE_ENV: 'development',
        HOST: '0.0.0.0',
        DB: 'mysql',
      },
      filter_env: ['npm_'],
      min_uptime: '2m',
    },
    {
      name: 'profile-static',
      script: 'bin/_static.js',
      cwd: __dirname,
      max_restarts: '1',
      env: {
        NODE_ENV: 'development',
        HOST: '0.0.0.0',
        DB: 'mysql',
      },
      filter_env: ['npm_'],
      min_uptime: '2m',
    },
  ],
};
