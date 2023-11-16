/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const intern = require('intern').default;
const config = intern._config;
const { describe, it, beforeEach } = intern.getPlugin('interface.bdd');
const selectors = require('../lib/selectors');
const FunctionalHelpers = require('../lib/helpers');
const { createEmail } = FunctionalHelpers;
const connectedServices = selectors.SETTINGS.CONNECTED_SERVICES;

describe('connected services: oauth clients', () => {
  let email;
  const password = 'topnotchsupercoolpassworddealwithit';
  let {
    clearBrowserState,
    openFxaFromRp,
    fillOutEmailFirstSignUp,
    testElementExists,
    fillOutSignUpCode,
    openPage,
    testElementTextInclude,
    click,
    pollUntilGoneByQSA,
    noSuchElement,
    openTab,
    switchToWindow,
    closeCurrentWindow,
  } = FunctionalHelpers;

  beforeEach(async ({ remote }) => {
    ({
      clearBrowserState,
      openFxaFromRp,
      fillOutEmailFirstSignUp,
      testElementExists,
      fillOutSignUpCode,
      openPage,
      testElementTextInclude,
      click,
      pollUntilGoneByQSA,
      noSuchElement,
      openTab,
      switchToWindow,
      closeCurrentWindow,
    } = FunctionalHelpers.applyRemote(remote));

    await clearBrowserState({
      forceAll: true,
    });
  });

  it('lists and disconnects RP clients', async (remote) => {
    email = createEmail();
    await openFxaFromRp('enter-email');
    await fillOutEmailFirstSignUp(email, password);
    await testElementExists(selectors.CONFIRM_SIGNUP_CODE.HEADER);
    await fillOutSignUpCode(email, 0);
    await testElementExists(selectors['123DONE'].AUTHENTICATED);

    // client is listed
    await openPage(config.fxaSettingsV2Root, connectedServices.HEADER);
    await testElementTextInclude(connectedServices.HEADER, '123Done');

    await openTab(config.fxaUntrustedOauthApp);
    await switchToWindow(1);
    await click(selectors['123DONE'].BUTTON_SIGNIN);

    await click(selectors.SIGNIN_PASSWORD.SUBMIT_USE_SIGNED_IN);

    await testElementExists(selectors.OAUTH_PERMISSIONS.HEADER);
    await click(selectors.OAUTH_PERMISSIONS.SUBMIT);
    await testElementExists(selectors['123DONE'].AUTHENTICATED);
    await closeCurrentWindow();

    // refresh the list
    await click(connectedServices.REFRESH_BUTTON);
    await testElementTextInclude(connectedServices.HEADER, '321Done');

    // disconnect
    await click(
      `${connectedServices.SERVICE}[data-name^="123"] ${connectedServices.SIGN_OUT}`
    );
    await pollUntilGoneByQSA(
      `${connectedServices.SERVICE}[data-name^="123"] ${connectedServices.SIGN_OUT}`
    );

    // refresh to confirm app and its tokens are gone
    await click(connectedServices.REFRESH_BUTTON);
    await noSuchElement(
      `${connectedServices.SERVICE}[data-name^="123"] ${connectedServices.SIGN_OUT}`
    );
  });

  it('redirect from /settings/clients', async () => {
    email = createEmail();
    await openFxaFromRp('enter-email');
    await fillOutEmailFirstSignUp(email, password);
    await testElementExists(selectors.CONFIRM_SIGNUP_CODE.HEADER);
    await fillOutSignUpCode(email, 0);
    await testElementExists(selectors['123DONE'].AUTHENTICATED);
    const oldUrl = `${config.fxaSettingsV2Root}/clients`;
    // page is redirected and client list is shown
    await openPage(oldUrl, connectedServices.HEADER);
    await testElementTextInclude(connectedServices.HEADER, '123Done');
  });
});
