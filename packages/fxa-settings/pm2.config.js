/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = {
  apps: [
    {
      name: 'settings-react',
      cwd: __dirname,
      script: 'rescripts start',
      max_restarts: '1',
      min_uptime: '2m',
      env: {
        NODE_ENV: 'development',
        BROWSER: 'NONE',
        PORT: '3000',
      },
    },
  ],
};
