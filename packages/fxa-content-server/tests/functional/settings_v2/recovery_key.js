/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const intern = require('intern').default;
const { describe, it, beforeEach } = intern.getPlugin('interface.bdd');
const selectors = require('../lib/selectors');
const FunctionalHelpers = require('../lib/helpers');
const FunctionalSettingsHelpers = require('./lib/helpers');
const password = 'passwordzxcv';

const { navigateToSettingsV2 } = FunctionalSettingsHelpers;
const {
  click,
  testElementExists,
  type,
  visibleByQSA,
  testElementTextEquals,
  testElementTextInclude,
} = FunctionalHelpers.helpersRemoteWrapped;

describe('recovery key', () => {
  beforeEach(async ({ remote }) => {
    await navigateToSettingsV2(remote);
    await click(
      selectors.SETTINGS_V2.SECURITY.RECOVERY_KEY.CREATE,
      selectors.SETTINGS_V2.SECURITY.RECOVERY_KEY.PASSWORD_TEXTBOX_LABEL,
      remote
    );
  });

  it('try to add recovery key with invalid password', async ({ remote }) => {
    // Type invalid password
    await click(
      selectors.SETTINGS_V2.SECURITY.RECOVERY_KEY.PASSWORD_TEXTBOX_LABEL,
      remote
    );
    await type(
      selectors.SETTINGS_V2.SECURITY.RECOVERY_KEY.PASSWORD_TEXTBOX_INPUT,
      'invalid password',
      remote
    );
    await click(
      selectors.SETTINGS_V2.SECURITY.RECOVERY_KEY.CONTINUE_BUTTON,
      remote
    );

    // Verify that the 'incorrect password' error message is visible
    await visibleByQSA(
      selectors.SETTINGS_V2.SECURITY.RECOVERY_KEY.TOOLTIP_INCORRECT_PASSWORD,
      remote
    );
  });

  it('try to add recovery key with a valid password', async ({ remote }) => {
    await click(
      selectors.SETTINGS_V2.SECURITY.RECOVERY_KEY.PASSWORD_TEXTBOX_LABEL,
      remote
    );

    // Type valid password
    await type(
      selectors.SETTINGS_V2.SECURITY.RECOVERY_KEY.PASSWORD_TEXTBOX_INPUT,
      password,
      remote
    );
    await click(
      selectors.SETTINGS_V2.SECURITY.RECOVERY_KEY.CONTINUE_BUTTON,
      remote
    );
    await testElementExists(
      selectors.SETTINGS_V2.SECURITY.RECOVERY_KEY.RECOVERY_KEY_CONFIRM,
      remote
    );
    await click(
      selectors.SETTINGS_V2.SECURITY.RECOVERY_KEY.CLOSE_BUTTON,
      remote
    );

    //Verify the status is Enabled
    await testElementTextEquals(
      selectors.SETTINGS_V2.SECURITY.RECOVERY_KEY.RECOVERY_KEY_ENABLED,
      'Enabled',
      remote
    );
  });

  it('can revoke recovery key', async ({ remote }) => {
    await click(
      selectors.SETTINGS_V2.SECURITY.RECOVERY_KEY.PASSWORD_TEXTBOX_LABEL,
      remote
    );
    await type(
      selectors.SETTINGS_V2.SECURITY.RECOVERY_KEY.PASSWORD_TEXTBOX_INPUT,
      password,
      remote
    );
    await click(
      selectors.SETTINGS_V2.SECURITY.RECOVERY_KEY.CONTINUE_BUTTON,
      remote
    );
    await click(
      selectors.SETTINGS_V2.SECURITY.RECOVERY_KEY.CLOSE_BUTTON,
      remote
    );
    await click(
      selectors.SETTINGS_V2.SECURITY.RECOVERY_KEY.REMOVE_RECOVERY_KEY,
      selectors.SETTINGS_V2.SECURITY.RECOVERY_KEY.REMOVE_KEY_DESCRIPTION,
      remote
    );

    //Click confirm to remove
    await click(
      selectors.SETTINGS_V2.SECURITY.RECOVERY_KEY.CONFIRM_REMOVE_KEY,
      remote
    );

    //Verify the success message is visible
    await testElementExists(selectors.SETTINGS_V2.SUCCESS_MESSAGE, remote);

    //Also verify that the recovery key status is 'Not set'
    await testElementTextInclude(
      selectors.SETTINGS_V2.SECURITY.RECOVERY_KEY.RECOVERY_KEY_ENABLED,
      'Not set',
      remote
    );
  });
});
