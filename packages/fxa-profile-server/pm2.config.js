/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const PATH = process.env.PATH.split(':')
  .filter((p) => !p.includes(process.env.TMPDIR))
  .join(':');

module.exports = {
  apps: [
    {
      name: 'profile',
      script: 'node bin/server.js',
      cwd: __dirname,
      max_restarts: '1',
      env: {
        NODE_ENV: 'development',
        HOST: '0.0.0.0',
        DB: 'mysql',
        PORT: '1111',
        PATH,
      },
      filter_env: ['npm_'],
      min_uptime: '2m',
      time: true,
    },
    {
      name: 'profile-worker',
      script: 'node bin/worker.js',
      cwd: __dirname,
      max_restarts: '1',
      env: {
        NODE_ENV: 'development',
        HOST: '0.0.0.0',
        DB: 'mysql',
        PATH,
      },
      filter_env: ['npm_'],
      min_uptime: '2m',
      time: true,
    },
    {
      name: 'profile-static',
      script: 'node bin/_static.js',
      cwd: __dirname,
      max_restarts: '1',
      env: {
        NODE_ENV: 'development',
        HOST: '0.0.0.0',
        DB: 'mysql',
        PATH,
      },
      filter_env: ['npm_'],
      min_uptime: '2m',
      time: true,
    },
  ],
};
