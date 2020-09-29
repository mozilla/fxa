/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const intern = require('intern').default;
const { describe, it, beforeEach } = intern.getPlugin('interface.bdd');
const selectors = require('../lib/selectors');
const FunctionalHelpers = require('../lib/helpers');

const config = intern._config;
const EMAIL_FIRST = config.fxaContentRoot;
const SETTINGS_V2_URL = `${config.fxaContentRoot}beta/settings`;
const password = 'passwordzxcv';

const { createEmail } = FunctionalHelpers;

const {
  createUser,
  openPage,
  fillOutEmailFirstSignIn,
  testElementExists,
} = FunctionalHelpers.helpersRemoteWrapped;

describe('settings', () => {
  let email;
  beforeEach(async ({ remote }) => {
    email = createEmail();
    await createUser(email, password, { preVerified: true }, remote);
  });

  it('can navigate to settings', async ({ remote }) => {
    await openPage(EMAIL_FIRST, selectors.ENTER_EMAIL.HEADER, remote);
    await fillOutEmailFirstSignIn(email, password, remote);
    await testElementExists(selectors.SETTINGS.HEADER, remote);
    await openPage(SETTINGS_V2_URL, '#profile', remote);
  });
});
