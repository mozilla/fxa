/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const PATH = process.env.PATH.split(':')
  .filter((p) => !p.includes(process.env.TMPDIR))
  .join(':');

const apps = [];

// Although this is triggred as part of the monorepo start scripts,
// it should call the Next.js dev script for local development.
apps.push({
  name: 'payments-api',
  script: 'nx serve payments-api',
  max_restarts: '1',
  min_uptime: '2m',
  env: {
    PATH,
    PORT: 3037,
  },
  filter_env: ['npm_'],
});

apps.push({
  name: 'payments-metering-subscriber',
  script: 'nx run payments-api:metering-subscriber',
  max_restarts: '1',
  min_uptime: '2m',
  env: {
    PATH,
    PORT: 3038,
    METERING_CONFIG__PUBSUB__CONSUMER_ENABLED: 'true',
  },
  filter_env: ['npm_'],
});

apps.push({
  name: 'payments-metering-sweep',
  script: 'nx run payments-api:metering-sweep-loop',
  max_restarts: '1',
  min_uptime: '2m',
  env: {
    PATH,
  },
  filter_env: ['npm_'],
});

module.exports = {
  apps,
};
