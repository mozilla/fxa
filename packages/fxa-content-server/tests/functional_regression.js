/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const testsSettings = require('./functional_settings');

module.exports = testsSettings.concat([
  'tests/functional/oauth_settings_clients.js',
  // new and flaky tests above here',
  'tests/functional/avatar.js',
  'tests/functional/bounced_email.js',
  'tests/functional/email_opt_in.js',
  'tests/functional/fx_desktop_handshake.js',
  'tests/functional/oauth_webchannel.js',
  'tests/functional/pages.js',
  'tests/functional/sign_in.js',
  'tests/functional/sign_in_blocked.js',
]);
