/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = {
  apps: [
    {
      name: '123done',
      script: 'server.js',
      cwd: __dirname,
      max_restarts: '1',
      env: {
        CONFIG_123DONE: './config-local.json',
        NODE_ENV: 'dev',
        PORT: '8080',
      },
      filter_env: ['npm_'],
      min_uptime: '2m',
    },
    {
      name: '321done',
      script: 'server.js',
      cwd: __dirname,
      max_restarts: '1',
      env: {
        CONFIG_123DONE: './config-local-untrusted.json',
        NODE_ENV: 'dev',
        PORT: '10139',
      },
      filter_env: ['npm_'],
      min_uptime: '2m',
    },
  ],
};
