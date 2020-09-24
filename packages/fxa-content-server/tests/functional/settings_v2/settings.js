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

const {
  createEmail,
  createUser,
  fillOutEmailFirstSignIn,
  openPage,
  testElementExists,
} = FunctionalHelpers;

describe('settings', () => {
  let email;
  beforeEach(async ({ remote }) => {
    email = createEmail();
    await remote.then(createUser(email, password, { preVerified: true }));
  });

  it('can navigate to settings', async ({ remote }) => {
    await remote
      .then(openPage(EMAIL_FIRST, selectors.ENTER_EMAIL.HEADER))
      .then(fillOutEmailFirstSignIn(email, password))
      .then(testElementExists(selectors.SETTINGS.HEADER))
      .then(openPage(SETTINGS_V2_URL, '#profile'));
  });
});
