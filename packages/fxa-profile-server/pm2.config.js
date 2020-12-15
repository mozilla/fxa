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
        AUTH_SERVER_URL: 'http://localhost:9000/v1',
        DB: 'mysql',
        HOST: '0.0.0.0',
        IMG_PROVIDERS_FXA: '^http://localhost:1112/a/[0-9a-f]{32}$',
        IMG_URL: 'http://localhost:1112/a/{id}',
        MYSQL_HOST: 'localhost',
        NODE_ENV: 'development',
        OAUTH_SERVER_URL: 'http://localhost:9000/v1',
        PATH,
        PORT: '1111',
        PUBLIC_URL: 'http://localhost:1111',
        REDIS_HOST: 'localhost',
        WORKER_HOST: 'localhost',
        WORKER_URL: 'http://localhost:1113',
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
        DB: 'mysql',
        HOST: '0.0.0.0',
        NODE_ENV: 'development',
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
        DB: 'mysql',
        HOST: '0.0.0.0',
        NODE_ENV: 'development',
        PATH,
      },
      filter_env: ['npm_'],
      min_uptime: '2m',
      time: true,
    },
  ],
};
