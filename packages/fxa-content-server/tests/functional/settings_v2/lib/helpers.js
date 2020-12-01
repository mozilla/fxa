/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const intern = require('intern').default;
const selectors = require('../../lib/selectors');
const FunctionalHelpers = require('../../lib/helpers');

const { createEmail, generateTotpCode } = FunctionalHelpers;
const config = intern._config;
const EMAIL_FIRST = config.fxaContentRoot;
const SETTINGS_V2_URL = config.fxaSettingsV2Root;
const password = 'passwordzxcv';
let secret;
let securityCode;

const {
  clearBrowserState,
  createUser,
  openPage,
  type,
  click,
  fillOutEmailFirstSignIn,
  testElementExists,
} = FunctionalHelpers.helpersRemoteWrapped;

async function navigateToSettingsV2(remote) {
  const email = createEmail();
  await clearBrowserState(remote);
  await createUser(email, password, { preVerified: true }, remote);

  await openPage(EMAIL_FIRST, selectors.ENTER_EMAIL.HEADER, remote);
  await fillOutEmailFirstSignIn(email, password, remote);
  await testElementExists(selectors.SETTINGS.HEADER, remote);

  // Open new settings
  await openPage(SETTINGS_V2_URL, selectors.SETTINGS_V2.HEADER, remote);
  return email;
}

async function generateSecurityCode(remote) {
  await click(
    selectors.SETTINGS_V2.SECURITY.TFA.ADD_BUTTON,
    selectors.SETTINGS_V2.SECURITY.TFA.SECURITY_CODE_TEXTBOX_LABEL,
    remote
  );
  await click(selectors.SETTINGS_V2.SECURITY.TFA.SHOW_CODE_LINK, remote);

  // store the secret key to use later
  await testElementExists(
    selectors.SETTINGS_V2.SECURITY.TFA.SECRET_CODE_MODAL,
    remote
  );
  secret = await remote
    .findByCssSelector(selectors.SETTINGS_V2.SECURITY.TFA.SECRET_CODE_TEXT)
    .getVisibleText();

  // store the security code generated via the secret code
  securityCode = generateTotpCode(secret);
  return securityCode;
}

async function confirmRecoveryCode(remote) {
  securityCode = await generateSecurityCode(remote);
  await click(
    selectors.SETTINGS_V2.SECURITY.TFA.SECURITY_CODE_TEXTBOX_LABEL,
    remote
  );
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
  const recoveryKey = await remote
    .findByCssSelector(selectors.SETTINGS_V2.SECURITY.TFA.FIRST_RECOVERY_CODE)
    .getVisibleText();
  await click(selectors.SETTINGS_V2.SECURITY.TFA.CONTINUE_RECOVERY_KEY, remote);
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
}

module.exports = {
  navigateToSettingsV2,
  confirmRecoveryCode,
  generateSecurityCode,
};
