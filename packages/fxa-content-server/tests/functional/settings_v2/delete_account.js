/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

 'use strict';

 const { describe, it, beforeEach } = intern.getPlugin('interface.bdd');
 const selectors = require('../lib/selectors');
 const FunctionalHelpers = require('../lib/helpers');
 const FunctionalSettingsHelpers = require('./lib/helpers');
 const { navigateToSettingsV2 } = FunctionalSettingsHelpers;
 const password = 'passwordzxcv';

 let {
   click,
   testElementExists,
   type,
   visibleByQSA,
   testElementTextEquals,
 } = FunctionalHelpers.helpersRemoteWrapped;

describe('Delete account', () => {
  let email;
  beforeEach(async ({ remote }) => {
    ({
      type,
    }= FunctionalHelpers.applyRemote(remote));
   email = await navigateToSettingsV2(remote);
  });

  it('can delete account', async ({ remote }) => {
    await click(
      selectors.SETTINGS_V2.DELETE_ACCOUNT.DELETE_ACCOUNT_BUTTON,
      remote
    );
    await testElementExists(
      selectors.SETTINGS_V2.DELETE_ACCOUNT.DELETE_ACCOUNT_MODAL,
      remote
    );

    // Check all the checkboxes before continuing
    const labels = await remote.findAllByCssSelector(
      selectors.SETTINGS_V2.DELETE_ACCOUNT.CHECKBOXES,
      remote);
      labels.map(label => label.click())
    await remote.end();

    // Click continue
    await click(
      selectors.SETTINGS_V2.DELETE_ACCOUNT.CONTINUE_BUTTON,
      remote
    );

    // Enter incorrect password
    await testElementExists(
      selectors.SETTINGS_V2.DELETE_ACCOUNT.DELETE_ACCOUNT_MODAL,
      remote
    );
    await click(
      selectors.SETTINGS_V2.DELETE_ACCOUNT.PASSWORD_LABEL,
      remote
    );
    await type(
      selectors.SETTINGS_V2.DELETE_ACCOUNT.PASSWORD_INPUT,
      'invalid password',
      remote
    );
    await click(
      selectors.SETTINGS_V2.DELETE_ACCOUNT.DELETE_CONFIRM_BUTTON,
      remote
    );
    await visibleByQSA(
      selectors.SETTINGS_V2.DELETE_ACCOUNT.TOOLTIP_INCORRECT_PASSWORD,
      remote
    );

    // Enter correct password
    await click(
      selectors.SETTINGS_V2.DELETE_ACCOUNT.PASSWORD_LABEL,
      remote
    );
    await type(
      selectors.SETTINGS_V2.DELETE_ACCOUNT.PASSWORD_INPUT,
      password,
      remote
    );
    await click(
      selectors.SETTINGS_V2.DELETE_ACCOUNT.DELETE_CONFIRM_BUTTON,
      remote
    );

    // Verify that the account has been deleted
    await testElementExists(
      selectors.SIGNIN_PASSWORD.HEADER,
      remote
    );
    await type(
      selectors.SIGNIN_PASSWORD.PASSWORD,
      password
    );
    await click(
      selectors.SIGNIN_PASSWORD.SUBMIT,
      remote
    );
    await testElementTextEquals(
      selectors.SIGNIN.ERROR,
      'Unknown account',
      remote
    );
  })


  it('cancel delete account', async ({ remote }) => {
    await click(
      selectors.SETTINGS_V2.DELETE_ACCOUNT.DELETE_ACCOUNT_BUTTON,
      remote
    );

    // Check all the checkboxes before continuing
    const labels = await remote.findAllByCssSelector(
      selectors.SETTINGS_V2.DELETE_ACCOUNT.CHECKBOXES,
      remote);
      labels.map(label => label.click())
    await remote.end();

    // Click continue
    await click(
      selectors.SETTINGS_V2.DELETE_ACCOUNT.CONTINUE_BUTTON,
      remote
    );
    await click(
      selectors.SETTINGS_V2.DELETE_ACCOUNT.PASSWORD_LABEL,
      remote
    );
    await type(
      selectors.SETTINGS_V2.DELETE_ACCOUNT.PASSWORD_INPUT,
      password,
      remote
    );

    // Click Cancel
    await click(
      selectors.SETTINGS_V2.DELETE_ACCOUNT.DELETE_CANCEL_BUTTON,
      remote
    );

    // Verify user lands on the Settings homepage
    await testElementExists(
      selectors.SETTINGS_V2.PROFILE,
      remote
    );
  });
});
