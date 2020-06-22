/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const PATH = process.env.PATH.split(':')
  .filter((p) => !p.includes(process.env.TMPDIR))
  .join(':');

module.exports = {
  apps: [
    {
      name: 'auth',
      script: 'node -r ts-node/register bin/key_server.js',
      cwd: __dirname,
      env: {
        DB: 'mysql',
        NODE_ENV: 'dev',
        NODE_OPTIONS: '--inspect=9160',
        TS_NODE_TRANSPILE_ONLY: 'true',
        IP_ADDRESS: '0.0.0.0',
        SIGNIN_UNBLOCK_FORCED_EMAILS: '^block.*@restmail\\.net$',
        SIGNIN_CONFIRMATION_ENABLED: 'true',
        SIGNIN_CONFIRMATION_FORCE_EMAIL_REGEX: '^sync.*@restmail\\.net$',
        FORCE_PASSWORD_CHANGE_EMAIL_REGEX: 'forcepwdchange',
        CONFIG_FILES: 'config/secrets.json',
        PORT: '9000',
        PATH,
      },
      filter_env: ['npm_'],
      watch: ['bin', 'config', 'lib'],
      max_restarts: '1',
      min_uptime: '2m',
      time: true,
    },
    {
      name: 'inbox',
      script: 'node -r ts-node/register test/mail_helper.js',
      cwd: __dirname,
      env: {
        NODE_ENV: 'dev',
        MAILER_PORT: '9001',
        PATH,
      },
      filter_env: ['npm_'],
      max_restarts: '1',
      min_uptime: '2m',
      time: true,
    },
  ],
};
