/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const PATH = process.env.PATH.split(':')
  .filter((p) => !p.includes(process.env.TMPDIR))
  .join(':');

module.exports = {
  apps: [
    {
      name: 'customs',
      script: 'node bin/customs_server.js',
      cwd: __dirname,
      max_restarts: '1',
      env: {
        IP_ADDRESS: 'localhost',
        MEMCACHE_ADDRESS: 'localhost:11211',
        NODE_ENV: 'dev',
        PATH,
        PORT: 7000,
        PUBLIC_URL: 'http://localhost:7000',
        REPUTATION_SERVICE_BASE_URL: 'http://localhost:8080/',
      },
      filter_env: ['npm_'],
      watch: ['bin', 'lib'],
      min_uptime: '2m',
      time: true,
    },
  ],
};
