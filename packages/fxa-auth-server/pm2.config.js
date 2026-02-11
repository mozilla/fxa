/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const PATH = process.env.PATH.split(':')
  .filter((p) => !p.includes(process.env.TMPDIR))
  .join(':');

const apps = [
  {
    name: 'auth',
    script: 'node -r esbuild-register bin/key_server.js',
    cwd: __dirname,
    env: {
      DB: 'mysql',
      NODE_ENV: 'dev',
      NODE_OPTIONS: '--inspect=9160 --dns-result-order=ipv4first',
      TS_NODE_TRANSPILE_ONLY: 'true',
      IP_ADDRESS: '0.0.0.0',
      SIGNIN_UNBLOCK_FORCED_EMAILS: '^block.*@restmail\\.net$',
      SIGNIN_CONFIRMATION_ENABLED: 'true',
      SIGNIN_CONFIRMATION_FORCE_EMAIL_REGEX: '^sync.*@restmail\\.net$',
      FIRESTORE_EMULATOR_HOST:
        typeof process.env.FIRESTORE_EMULATOR_HOST !== 'undefined'
          ? process.env.FIRESTORE_EMULATOR_HOST
          : 'localhost:9090',
      FORCE_PASSWORD_CHANGE_EMAIL_REGEX: 'forcepwdchange',
      CONFIG_FILES: 'config/secrets.json',
      EMAIL_CONFIG_USE_REDIS: 'false',
      PORT: '9000',
      PATH,
      SENTRY_ENV: 'local',
      SENTRY_DSN: process.env.SENTRY_DSN_AUTH,
      TRACING_SERVICE_NAME: 'fxa-auth-server',
    },
    filter_env: ['npm_'],
    watch: ['bin', 'config', 'lib'],
    max_restarts: '1',
    min_uptime: '2m',
    time: true,
  },
  {
    name: 'inbox',
    script: 'node -r esbuild-register test/mail_helper.js',
    cwd: __dirname,
    env: {
      NODE_ENV: 'dev',
      NODE_OPTIONS: '--dns-result-order=ipv4first',
      MAILER_PORT: '9001',
      PATH,
    },
    filter_env: ['npm_'],
    max_restarts: '1',
    min_uptime: '2m',
    time: true,
  },
];

if (process.env.CI !== 'true') {
  apps.push({
    name: 'auth-ftl',
    script: 'yarn grunt watch-ftl',
    cwd: __dirname,
    filter_env: ['npm_'],
    max_restarts: '1',
    min_uptime: '2m',
    time: true,
  });
}

module.exports = {
  apps,
};
