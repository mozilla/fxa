/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { describe, it, before } = intern.getPlugin('interface.bdd');
const selectors = require('../lib/selectors');
const FunctionalHelpers = require('../lib/helpers');
const FunctionalSettingsHelpers = require('./lib/helpers');
const { navigateToSettingsV2 } = FunctionalSettingsHelpers;
const { generateTotpCode } = FunctionalHelpers;

const {
  click,
  testElementExists,
  type,
  visibleByQSA,
  testElementTextEquals,
  testElementTextInclude,
} = FunctionalHelpers.helpersRemoteWrapped;

describe('two step auth', () => {
  before(async ({ remote }) => {
    await navigateToSettingsV2(remote);
  });

  it('can enable the 2FA', async ({ remote }) => {
    await click(
      selectors.SETTINGS_V2.SECURITY.TFA.ADD_BUTTON,
      selectors.SETTINGS_V2.SECURITY.TFA.SECURITY_CODE_TEXTBOX_LABEL,
      remote
    );
    await click(selectors.SETTINGS_V2.SECURITY.TFA.SHOW_CODE_LINK, remote);
    await testElementExists(
      selectors.SETTINGS_V2.SECURITY.TFA.SECRET_CODE_MODAL,
      remote
    );

    // store the secret key and security code to use later
    const secret = await remote
      .findByCssSelector(selectors.SETTINGS_V2.SECURITY.TFA.SECRET_CODE_TEXT)
      .getVisibleText();

    const securityCode = generateTotpCode(secret);

    // enter invalid secret code and verify the error
    await click(
      selectors.SETTINGS_V2.SECURITY.TFA.SECURITY_CODE_TEXTBOX_LABEL,
      remote
    );
    await type(
      selectors.SETTINGS_V2.SECURITY.TFA.SECURITY_CODE_TEXTBOX_INPUT,
      '123456',
      remote
    );
    await click(selectors.SETTINGS_V2.SECURITY.TFA.CONTINUE_BUTTON, remote);
    await visibleByQSA(
      selectors.SETTINGS_V2.SECURITY.TFA.INCORRECT_TOTP_TOOLTIP,
      remote
    );
    await testElementTextEquals(
      selectors.SETTINGS_V2.SECURITY.TFA.INCORRECT_TOTP_TOOLTIP,
      'Incorrect two-step authentication code',
      remote
    );

    // enter the correct security code
    await type(
      selectors.SETTINGS_V2.SECURITY.TFA.SECURITY_CODE_TEXTBOX_INPUT,
      securityCode,
      remote
    );

    await click(selectors.SETTINGS_V2.SECURITY.TFA.CONTINUE_BUTTON, remote);
    await testElementExists(
      selectors.SETTINGS_V2.SECURITY.TFA.RECOVERY_CODE_BLOCK,
      remote
    );

    // Store the recovery key generated to use later
    const recoveryKey = await remote
      .findByCssSelector(selectors.SETTINGS_V2.SECURITY.TFA.FIRST_RECOVERY_CODE)
      .getVisibleText();
    await click(
      selectors.SETTINGS_V2.SECURITY.TFA.CONTINUE_RECOVERY_KEY,
      remote
    );
    await testElementExists(
      selectors.SETTINGS_V2.SECURITY.TFA.RECOVERY_KEY_INPUT_LABEL,
      remote
    );
    await type(
      selectors.SETTINGS_V2.SECURITY.TFA.RECOVERY_KEY_INPUT,
      recoveryKey,
      remote
    );
    await click(selectors.SETTINGS_V2.SECURITY.TFA.SUBMIT_RECOVERY_KEY, remote);

    // Verify the success message
    await visibleByQSA(
      selectors.SETTINGS_V2.SECURITY.TFA.SUCCESS_MESSAGE,
      remote
    );

    // Verify that the status of 2FA is enabled
    await testElementTextEquals(
      selectors.SETTINGS_V2.SECURITY.TFA.TFA_STATUS,
      'Enabled',
      remote
    );
  });

  it('can disbale the 2FA', async ({ remote }) => {
    // User needs to click twice on the 'Security' Menu to get to the security section
    // Raised bug FXA-2756 for this
    await click(selectors.SETTINGS_V2.SECURITY.MENU, remote);
    await click(selectors.SETTINGS_V2.SECURITY.MENU, remote);

    // Click Disable and continue with the steps
    await click(selectors.SETTINGS_V2.SECURITY.TFA.DISABLE_TFA, remote);
    await testElementExists(
      selectors.SETTINGS_V2.SECURITY.TFA.DISABLE_MODAL,
      remote
    );

    // Click cancel and verify the status is still enabled
    await click(selectors.SETTINGS_V2.SECURITY.TFA.CANCEL_DISABLE_TFA, remote);
    await testElementTextEquals(
      selectors.SETTINGS_V2.SECURITY.TFA.TFA_STATUS,
      'Enabled',
      remote
    );

    // Now confirm the 'disable 2FA'
    await click(selectors.SETTINGS_V2.SECURITY.TFA.DISABLE_TFA, remote);
    await testElementExists(
      selectors.SETTINGS_V2.SECURITY.TFA.DISABLE_MODAL,
      remote
    );
    await click(selectors.SETTINGS_V2.SECURITY.TFA.DISABLE_TFA_CONFIRM, remote);

    // Verify the success message
    await visibleByQSA(selectors.SETTINGS_V2.SUCCESS_MESSAGE, remote);

    // Verify the status is 'Not set' after disabling the 2FA
    await testElementTextInclude(
      selectors.SETTINGS_V2.SECURITY.TFA.TFA_STATUS,
      'Not set',
      remote
    );
  });
});
