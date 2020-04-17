/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = {
  apps: [
    {
      name: 'admin',
      cwd: __dirname,
      script: 'ts-node -P server/tsconfig.json server/bin/fxa-admin-panel.ts',
      max_restarts: '1',
      min_uptime: '2m',
      env: {
        LOGGING_FORMAT: 'pretty',
        NODE_ENV: 'development',
        NODE_OPTIONS: '--inspect=9140',
        PROXY_STATIC_RESOURCES_FROM: 'http://localhost:8092',
        CONFIG_FILES: 'config/secrets.json',
        PORT: '8091',
      },
    },
    {
      name: 'admin-react',
      cwd: __dirname,
      script: 'rescripts start',
      max_restarts: '1',
      min_uptime: '2m',
      env: {
        NODE_ENV: 'development',
        PUBLIC_URL: 'http://localhost:8091',
        BROWSER: 'NONE',
        PORT: '8092',
      },
    },
  ],
};
