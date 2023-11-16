/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const selectors = require('../../lib/selectors');
const FunctionalHelpers = require('../../lib/helpers');

const { createEmail } = FunctionalHelpers;
const config = intern._config;
const EMAIL_FIRST = config.fxaContentRoot;
const password = 'passwordzxcv';

const {
  clearBrowserState,
  createUser,
  openPage,
  fillOutEmailFirstSignIn,
  testElementExists,
} = FunctionalHelpers.helpersRemoteWrapped;

async function navigateToSettingsV2(remote) {
  const email = createEmail();
  await clearBrowserState(remote);
  await createUser(email, password, { preVerified: true }, remote);

  await openPage(EMAIL_FIRST, selectors.ENTER_EMAIL.HEADER, remote);
  await fillOutEmailFirstSignIn(email, password, remote);
  await testElementExists(selectors.SETTINGS.APP, remote);
  return email;
}

module.exports = {
  navigateToSettingsV2,
};
