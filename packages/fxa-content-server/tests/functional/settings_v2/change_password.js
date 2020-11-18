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
const SETTINGS_V2_URL = config.fxaSettingsV2Root;
const password = 'passwordzxcv';
const newPassword = 'passwordzxcvb';

const { createEmail } = FunctionalHelpers;

const {
  clearBrowserState,
  click,
  createUser,
  openPage,
  fillOutEmailFirstSignIn,
  testElementExists,
  type,
} = FunctionalHelpers.helpersRemoteWrapped;

describe('change password', () => {
  let email;
  beforeEach(async ({ remote }) => {
    email = createEmail();
    await clearBrowserState(remote);
    await createUser(email, password, { preVerified: true }, remote);
  });

  it('change password and login', async ({ remote }) => {
    await openPage(EMAIL_FIRST, selectors.ENTER_EMAIL.HEADER, remote);
    await fillOutEmailFirstSignIn(email, password, remote);
    await testElementExists(selectors.SETTINGS.HEADER, remote);
    await openPage(SETTINGS_V2_URL, selectors.SETTINGS_V2.HEADER, remote);
    await click(
      selectors.SETTINGS_V2.CHANGE_PASSWORD.OPEN_BUTTON,
      selectors.SETTINGS_V2.CHANGE_PASSWORD.CURRENT_PASSWORD_LABEL,
      remote
    );

    await click(
      selectors.SETTINGS_V2.CHANGE_PASSWORD.CURRENT_PASSWORD_LABEL,
      remote
    );
    await type(
      selectors.SETTINGS_V2.CHANGE_PASSWORD.CURRENT_PASSWORD_INPUT,
      password,
      {},
      remote
    );

    await click(
      selectors.SETTINGS_V2.CHANGE_PASSWORD.NEW_PASSWORD_LABEL,
      remote
    );
    await type(
      selectors.SETTINGS_V2.CHANGE_PASSWORD.NEW_PASSWORD_INPUT,
      newPassword,
      {},
      remote
    );

    await click(
      selectors.SETTINGS_V2.CHANGE_PASSWORD.VERIFY_PASSWORD_LABEL,
      remote
    );
    await type(
      selectors.SETTINGS_V2.CHANGE_PASSWORD.VERIFY_PASSWORD_INPUT,
      newPassword,
      {},
      remote
    );

    await click(
      selectors.SETTINGS_V2.CHANGE_PASSWORD.SAVE_BUTTON,
      selectors.SETTINGS_V2.HEADER,
      remote
    );

    await clearBrowserState(remote);

    await openPage(EMAIL_FIRST, selectors.ENTER_EMAIL.HEADER, remote);
    await fillOutEmailFirstSignIn(email, newPassword, remote);

    await testElementExists(selectors.SETTINGS.HEADER, remote);
  });

  it('click forgot password link', async ({ remote }) => {
    await openPage(EMAIL_FIRST, selectors.ENTER_EMAIL.HEADER, remote);
    await fillOutEmailFirstSignIn(email, password, remote);
    await testElementExists(selectors.SETTINGS.HEADER, remote);
    await openPage(SETTINGS_V2_URL, selectors.SETTINGS_V2.HEADER, remote);
    await click(
      selectors.SETTINGS_V2.CHANGE_PASSWORD.OPEN_BUTTON,
      selectors.SETTINGS_V2.CHANGE_PASSWORD.CURRENT_PASSWORD_LABEL,
      remote
    );

    await click(
      selectors.SETTINGS_V2.CHANGE_PASSWORD.FORGOT_PW_BUTTON,
      selectors.RESET_PASSWORD.HEADER,
      remote
    );
  });
});
