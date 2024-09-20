/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const PATH = process.env.PATH.split(':')
  .filter((p) => !p.includes(process.env.TMPDIR))
  .join(':');

const nest = require.resolve('@nestjs/cli/bin/nest.js');
const getNestScript = () => `${nest} start`;
const getProdScript = () => 'node dist/packages/fxa-graphql-api/src/main.js';

const script =
  process.env.CI === 'true' || process.env.NODE_ENV === 'production'
    ? getProdScript()
    : getNestScript();

module.exports = {
  apps: [
    {
      name: 'gql-api',
      script,
      cwd: __dirname,
      max_restarts: '1',
      min_uptime: '2m',
      env: {
        PATH,
        NODE_ENV: 'development',
        NODE_OPTIONS: '--dns-result-order=ipv4first',
        TS_NODE_TRANSPILE_ONLY: 'true',
        TS_NODE_COMPILER: 'typescript-cached-transpile',
        TS_NODE_FILES: 'true',
        PORT: '8290', // TODO: this needs to get added to src/config.ts
        CUSTOMS_SERVER_URL: 'none',
        SENTRY_ENV: 'local',
        SENTRY_DSN: process.env.SENTRY_DSN_GRAPHQL_API,
        TRACING_SERVICE_NAME: 'fxa-graphql-api',
        SNS_TOPIC_ARN:
          'arn:aws:sns:us-east-1:100010001000:fxa-account-change-dev',
        SNS_TOPIC_ENDPOINT: 'http://localhost:4100/',
      },
      filter_env: ['npm_'],
      watch: ['src'],
      time: true,
    },
  ],
};
