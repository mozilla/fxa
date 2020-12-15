/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const PATH = process.env.PATH.split(':')
  .filter((p) => !p.includes(process.env.TMPDIR))
  .join(':');

module.exports = {
  apps: [
    {
      name: 'payments',
      cwd: __dirname,
      script: 'node server/bin/fxa-payments-server.js',
      max_restarts: '1',
      min_uptime: '2m',
      env: {
        AUTH_SERVER_URL: 'http://localhost:9000',
        CONFIG_FILES: 'server/config/secrets.json',
        CONTENT_SERVER_URL: 'http://localhost:3030',
        DD_AGENT_HOST: 'localhost',
        FXA_PROFILE_IMAGES_URL: 'http://localhost:1112',
        LOGGING_FORMAT: 'pretty',
        NODE_ENV: 'development',
        NODE_OPTIONS: '--inspect=9170',
        OAUTH_SERVER_URL: 'http://localhost:9000',
        PATH,
        PORT: '3031',
        PROFILE_SERVER_URL: 'http://localhost:1111',
        PROXY_STATIC_RESOURCES_FROM: 'http://localhost:3032',
        PUBLIC_URL: 'http://localhost:3031',
        STATIC_RESOURCE_URL: 'http://localhost:3031',
      },
      filter_env: ['npm_'],
      time: true,
    },
    {
      name: 'payments-react',
      cwd: __dirname,
      script: 'yarn rescripts start',
      max_restarts: '1',
      min_uptime: '2m',
      env: {
        SKIP_PREFLIGHT_CHECK: 'true',
        NODE_ENV: 'development',
        PUBLIC_URL: 'http://localhost:3031',
        BROWSER: 'NONE',
        PORT: '3032',
        PATH,
      },
      filter_env: ['npm_', 'BERRY_BIN_FOLDER'],
      time: true,
    },
  ],
};
