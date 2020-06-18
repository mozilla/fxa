/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const PATH = process.env.PATH.split(':')
  .filter((p) => !p.includes(process.env.TMPDIR))
  .join(':');

module.exports = {
  apps: [
    {
      name: 'auth-db',
      script: 'node bin/server.js',
      cwd: __dirname,
      env: {
        NODE_ENV: 'dev',
        PORT: '8000',
        PATH,
      },
      filter_env: ['npm_'],
      max_restarts: '2',
      min_uptime: '2m',
      time: true,
    },
  ],
};
