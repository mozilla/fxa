/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Every service in the functional-test stack, so start-services.sh can launch
// them with one pm2 client instead of one per project. FXA_STACK_GROUP picks
// the apps that need generated keys or a migrated database ("late") or the
// rest ("early").
const path = require('path');

const PACKAGES = path.resolve(__dirname, '../..');
const PROJECTS = [
  '123done',
  'fxa-admin-panel',
  'fxa-admin-server',
  'fxa-auth-server',
  'fxa-content-server',
  'fxa-profile-server',
  'fxa-settings',
];

const LATE_PROJECTS = [
  'fxa-admin-server',
  'fxa-auth-server',
  'fxa-profile-server',
];

const group = process.env.FXA_STACK_GROUP;
const apps = PROJECTS.filter(
  (project) => !group || LATE_PROJECTS.includes(project) === (group === 'late')
).flatMap(
  (project) => require(path.join(PACKAGES, project, 'pm2.config.js')).apps
);

// fxa-settings' `start` script sets this for its dev server.
for (const app of apps) {
  if (app.name === 'settings-react') {
    app.env = { ...app.env, BUILD_PATH: 'build/dev' };
  }
}

module.exports = { apps };
