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
      script: 'node -r esbuild-register bin/customs_server.js',
      cwd: __dirname,
      max_restarts: '1',
      env: {
        NODE_ENV: 'dev',
        // By default, Node18 favours ipv6 for localhost
        NODE_OPTIONS: '--dns-result-order=ipv4first',
        PORT: 7000,
        PATH,
        SENTRY_ENV: 'local',
        SENTRY_DSN: process.env.SENTRY_DSN_CUSTOMS,
        TRACING_SERVICE_NAME: 'fxa-customs-server',
      },
      filter_env: ['npm_'],
      watch: ['bin', 'lib'],
      min_uptime: '2m',
      time: true,
    },
  ],
};
