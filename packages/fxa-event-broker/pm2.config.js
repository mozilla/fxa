/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = {
  apps: [
    {
      name: 'event-broker',
      script: 'ts-node src/bin/workerDev.ts',
      cwd: __dirname,
      max_restarts: '1',
      env: {
        NODE_ENV: 'development',
        NODE_OPTIONS: '--inspect=9180',
        TS_NODE_TRANSPILE_ONLY: 'true',
        TS_NODE_FILES: 'true',
        WORKER_HOST: '0.0.0.0',
        PUBSUB_EMULATOR_HOST: 'localhost:8085',
        FIRESTORE_EMULATOR_HOST: 'localhost:9090',
        PUBSUB_PROXY_PORT: '8090'
      },
      watch: ['src', 'config'],
      min_uptime: '2m'
    }
  ]
};
