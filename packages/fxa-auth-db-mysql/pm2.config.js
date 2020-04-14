/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = {
  apps: [
    {
      name: 'auth-db',
      script: './bin/server.js',
      cwd: __dirname,
      env: {
        NODE_ENV: 'dev',
        PORT: '8000',
      },
      max_restarts: '2',
      min_uptime: '2m',
    },
  ],
};
