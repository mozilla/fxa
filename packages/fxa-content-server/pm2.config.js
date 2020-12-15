/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const PATH = process.env.PATH.split(':')
  .filter((p) => !p.includes(process.env.TMPDIR))
  .join(':');

module.exports = {
  apps: [
    {
      name: 'content',
      script: 'node --inspect=9130 server/bin/fxa-content-server.js',
      cwd: __dirname,
      env: {
        CONFIG_FILES: 'server/config/local.json',
        CSP_ENABLED: false,
        DISABLE_CLIENT_METRICS_STDERR: false,
        FXA_GQL_URL: 'http://localhost:8290',
        FXA_OAUTH_URL: 'http://localhost:9000',
        FXA_PROFILE_IMAGES_URL: 'http://localhost:1112',
        FXA_PROFILE_URL: 'http://localhost:1111',
        FXA_URL: 'http://localhost:9000',
        NEW_SETTINGS: true,
        NODE_ENV: 'development',
        PATH,
        PORT: 3030,
        PUBLIC_URL: 'http://localhost:3030',
        SUBSCRIPTIONS_MANAGEMENT_URL: 'http://localhost:3031',
        SYNC_TOKENSERVER_URL: 'http://localhost:5000/token',
      },
      filter_env: ['npm_'],
      watch: ['server'],
      max_restarts: '1',
      min_uptime: '2m',
      time: true,
    },
  ],
};
