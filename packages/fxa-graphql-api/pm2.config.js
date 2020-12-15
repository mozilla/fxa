/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const PATH = process.env.PATH.split(':')
  .filter((p) => !p.includes(process.env.TMPDIR))
  .join(':');

module.exports = {
  apps: [
    {
      name: 'gql-api',
      script: 'nest start --debug=9200 --watch',
      cwd: __dirname,
      max_restarts: '1',
      min_uptime: '2m',
      env: {
        ACCESS_TOKEN_REDIS_HOST: 'localhost',
        AUTH_SERVER_URL: 'http://localhost:9000/v1',
        CUSTOMS_SERVER_URL: 'none',
        NODE_ENV: 'development',
        PATH,
        PORT: '8290', // TODO: this needs to get added to src/config.ts
        PROFILE_SERVER_URL: 'http://localhost:1111/v1',
        TS_NODE_FILES: 'true',
        TS_NODE_TRANSPILE_ONLY: 'true',
      },
      filter_env: ['npm_'],
      watch: ['src'],
      time: true,
    },
  ],
};
