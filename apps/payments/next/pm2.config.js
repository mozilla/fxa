/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const PATH = process.env.PATH.split(':')
  .filter((p) => !p.includes(process.env.TMPDIR))
  .join(':');

const apps = [];

apps.push({
  name: 'payments-next',
  script: 'nx serve payments-next',
  max_restarts: '1',
  min_uptime: '2m',
  env: {
    PATH,
  },
  filter_env: ['npm_'],
});

if (process.env.CI !== 'true') {
  apps.push({
    name: 'payments-next-ftl',
    script: 'nx watch-ftl payments-next',
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
