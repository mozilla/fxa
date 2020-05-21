/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = {
  apps: [
    {
      name: 'admin-server',
      script: 'node -r ts-node/register src/bin/main.ts',
      cwd: __dirname,
      max_restarts: '1',
      min_uptime: '2m',
      env: {
        NODE_ENV: 'development',
        NODE_OPTIONS: '--inspect=9150',
        TS_NODE_TRANSPILE_ONLY: 'true',
        TS_NODE_FILES: 'true',
        PORT: '8090' // TODO: this needs to get added to src/config.ts
      },
      filter_env: ['npm_'],
      watch: ['src']
    }
  ]
};
