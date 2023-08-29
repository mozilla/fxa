/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const PATH = process.env.PATH.split(':')
  .filter((p) => !p.includes(process.env.TMPDIR))
  .join(':');

const nest = require.resolve('@nestjs/cli/bin/nest.js');
const getDevScript = () => `${nest} start --debug=9150 --watch`;
const getProdScript = () => 'node dist/packages/fxa-admin-server/src/main.js';

const script =
  process.env.CI === 'true' || process.env.NODE_ENV === 'production'
    ? getProdScript()
    : getDevScript();

module.exports = {
  apps: [
    {
      name: 'admin-server',
      script,
      cwd: __dirname,
      max_restarts: '1',
      min_uptime: '2m',
      env: {
        CONFIG_FILES: 'secrets.json',
        PATH,
        NODE_ENV: 'development',
        TS_NODE_TRANSPILE_ONLY: 'true',
        TS_NODE_FILES: 'true',
        PORT: '8095',
        SENTRY_ENV: 'local',
        SENTRY_DSN: process.env.SENTRY_DSN_ADMIN_PANEL,
        FIRESTORE_EMULATOR_HOST: 'localhost:9090',
        TRACING_SERVICE_NAME: 'fxa-admin-server',
      },
      filter_env: ['npm_'],
      watch: ['src'],
      ignore_watch: [
        'src/graphql.ts',
        'src/schema.gql',
        'src/config/gql/allowlist/*.json',
      ],
      time: true,
    },
  ],
};
