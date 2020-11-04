/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const intern = require('intern').default;
const { describe, it, beforeEach } = intern.getPlugin('interface.bdd');
const selectors = require('../lib/selectors');
const FunctionalHelpers = require('../lib/helpers');
const FunctionalSettingsHelpers = require('./lib/helpers');
const password = 'passwordzxcv'
let recoveryKey;

const { navigateToSettingsV2 } = FunctionalSettingsHelpers;
const {
  click,
  testElementExists,
  type,
  visibleByQSA,
} = FunctionalHelpers.helpersRemoteWrapped;

describe('recovery key', () => {
   //let email;
   beforeEach(async ({ remote }) => {
     await navigateToSettingsV2(remote);
   });

 it('try to add recovery key with invalid password', async ({ remote }) => {
    await click(
      selectors.SETTINGS_V2.SECURITY.RECOVERY_KEY.CREATE,
      selectors.SETTINGS_V2.SECURITY.RECOVERY_KEY.PASSWORD_TEXTBOX_LABEL,
      remote
    );

    // Type invalid password
    await click(
      selectors.SETTINGS_V2.SECURITY.RECOVERY_KEY.PASSWORD_TEXTBOX_LABEL,
      remote
    )
    await type(
      selectors.SETTINGS_V2.SECURITY.RECOVERY_KEY.PASSWORD_TEXTBOX_INPUT,
      'invalid password',
      remote
    )
    await click(
      selectors.SETTINGS_V2.SECURITY.RECOVERY_KEY.CONTINUE_BUTTON,
      remote
    )

    // Verify that the 'incorrect password' error message is visible
    await visibleByQSA(
      selectors.SETTINGS_V2.SECURITY.RECOVERY_KEY.TOOLTIP_INCORRECT_PASSWORD,
      remote
    )
   });

   it('try to add recovery key with a valid password', async ({ remote }) => {
    await click(
      selectors.SETTINGS_V2.SECURITY.RECOVERY_KEY.CREATE,
      selectors.SETTINGS_V2.SECURITY.RECOVERY_KEY.PASSWORD_TEXTBOX_LABEL,
      remote
    );

    // Type invalid password
    await click(
      selectors.SETTINGS_V2.SECURITY.RECOVERY_KEY.PASSWORD_TEXTBOX_LABEL,
      remote
    )
    await type(
      selectors.SETTINGS_V2.SECURITY.RECOVERY_KEY.PASSWORD_TEXTBOX_INPUT,
      password,
      remote
    )
    await click(
      selectors.SETTINGS_V2.SECURITY.RECOVERY_KEY.CONTINUE_BUTTON,
      remote
    )
    await testElementExists(
      selectors.SETTINGS_V2.SECURITY.RECOVERY_KEY.RECOVERY_KEY_CONFIRM,
      remote
    )

    // Store the key to be used later
   // Store the key to be used later
   .findByCssSelector(selectors.SETTINGS_V2.SECURITY.RECOVERY_KEY.RECOVERY_KEY_TEXT)
   .getVisibleText()
   .then((key) => {
     recoveryKey = key;
     return remote.then(
       click(selectors.SETTINGS_V2.SECURITY.RECOVERY_KEY.CLOSE_BUTTON)
     );
   })
   .end()


  });
});
