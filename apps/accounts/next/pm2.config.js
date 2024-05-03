/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const PATH = process.env.PATH.split(':')
  .filter((p) => !p.includes(process.env.TMPDIR))
  .join(':');

module.exports = {
  apps: [
    {
      name: 'accounts-next',
      script: 'nx serve accounts-next',
      max_restarts: '1',
      min_uptime: '2m',
      env: {
        PATH,
      },
      filter_env: ['npm_'],
    },
  ],
};
