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
        ACCESS_TOKEN_REDIS_HOST: 'localhost',
        AUTH_SERVER_URL: 'http://localhost:9000',
        CONFIG_FILES: 'config/secrets.json',
        CUSTOMS_SERVER_URL: 'http://localhost:7000',
        DB: 'mysql',
        DD_AGENT_HOST: 'localhost',
        EMAIL_SERVICE_HOST: 'localhost',
        FORCE_PASSWORD_CHANGE_EMAIL_REGEX: 'forcepwdchange',
        HOST: 'localhost',
        HOST_INTERNAL: 'localhost',
        HTTPDB_URL: 'http://localhost:9000',
        IP_ADDRESS: '0.0.0.0',
        MAILER_HOST: 'localhost',
        MEMCACHE_METRICS_CONTEXT_ADDRESS: 'localhost:11211',
        MYSQL_HOST: 'localhost',
        NODE_ENV: 'dev',
        NODE_OPTIONS: '--inspect=9160',
        OAUTH_URL: 'http://localhost:9000',
        PATH,
        PORT: '9000',
        PUBLIC_URL: 'http://localhost:9000',
        REDIS_HOST: 'localhost',
        REFRESH_TOKEN_REDIS_HOST: 'localhost',
        SIGNIN_CONFIRMATION_ENABLED: 'true',
        SIGNIN_CONFIRMATION_FORCE_EMAIL_REGEX: '^sync.*@restmail\\.net$',
        SIGNIN_UNBLOCK_FORCED_EMAILS: '^block.*@restmail\\.net$',
        SMTP_HOST: 'localhost',
        SYNC_TOKENSERVER_URL: 'http://localhost:5000/token',
        TS_NODE_TRANSPILE_ONLY: 'true',
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
