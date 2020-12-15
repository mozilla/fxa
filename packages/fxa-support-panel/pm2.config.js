/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const PATH = process.env.PATH.split(':')
  .filter((p) => !p.includes(process.env.TMPDIR))
  .join(':');

module.exports = {
  apps: [
    {
      name: 'support',
      cwd: __dirname,
      script: 'nest start --debug=9190 --watch',
      max_restarts: '1',
      min_uptime: '2m',
      env: {
        NODE_ENV: 'development',
        PATH,
        PORT: '7100',
        TS_NODE_FILES: 'true',
        TS_NODE_TRANSPILE_ONLY: 'true',
      },
      filter_env: ['npm_'],
      watch: ['src'],
      time: true,
    },
  ],
};
