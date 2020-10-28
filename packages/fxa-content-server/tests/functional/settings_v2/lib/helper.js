/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


 const selectors = require('./selectors');
 //const TestHelpers = require('../../lib/helpers');
 const FunctionalHelpers = require('../lib/helpers');

 //const AUTH_SERVER_ROOT = config.fxaAuthRoot;
 //const CONTENT_SERVER = config.fxaContentRoot;
 const { createEmail } = FunctionalHelpers;
 const config = intern._config;
 const EMAIL_FIRST = config.fxaContentRoot;
 const SETTINGS_V2_URL = config.fxaSettingsv2Root;
 const password = 'passwordzxcv';

 let email;
 const {
  clearBrowserState,
  createUser,
  openPage,
  fillOutEmailFirstSignIn,
  testElementExists,
} = FunctionalHelpers.helpersRemoteWrapped;


//async ({ remote }) => {
 async function navigateToSettingsV2(remote) {
 email = createEmail();
 await clearBrowserState(remote);
 await createUser(email, password, { preVerified: true }, remote);

 await openPage(EMAIL_FIRST, selectors.ENTER_EMAIL.HEADER, remote);
 await fillOutEmailFirstSignIn(email, password, remote);
 await testElementExists(selectors.SETTINGS.HEADER, remote);

 // Open new settings
 await openPage(SETTINGS_V2_URL, selectors.SETTINGS_V2.HEADER, remote);
};
