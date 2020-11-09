/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const intern = require('intern').default;
const config = intern._config;
const ENTER_EMAIL_URL = config.fxaContentRoot;
const PASSWORD = 'amazingpassword';
const { describe, it, beforeEach } = intern.getPlugin('interface.bdd');
const selectors = require('../lib/selectors');
const FunctionalHelpers = require('../lib/helpers');
const FunctionalSettingsHelpers = require('./lib/helpers');
const { navigateToSettingsV2 } = FunctionalSettingsHelpers;

describe('external links', () => {
  let primaryEmail;
  let testHrefEquals,
    testElementExists,
    clearBrowserState,
    click,
    createEmail,
    createUser,
    fillOutEmailFirstSignIn,
    openPage,
    openRP,
    subscribeToTestProduct,
    visibleByQSA;

  beforeEach(async ({ remote }) => {
    ({
      testHrefEquals,
      testElementExists,
      clearBrowserState,
      click,
      createEmail,
      createUser,
      fillOutEmailFirstSignIn,
      openPage,
      openRP,
      subscribeToTestProduct,
      testElementExists,
      visibleByQSA,
    } = FunctionalHelpers.applyRemote(remote));
    primaryEmail = await navigateToSettingsV2(remote);
  });

  it('renders external links correctly', async () => {
    await testElementExists(selectors.SETTINGS_V2.NAVIGATION.NEWSLETTERS_LINK);
    await testHrefEquals(
      selectors.SETTINGS_V2.NAVIGATION.NEWSLETTERS_LINK,
      `https://basket.mozilla.org/fxa/?email=${primaryEmail}`
    );

    await testElementExists(selectors.SETTINGS_V2.FOOTER.PRIVACY_LINK);
    await testHrefEquals(
      selectors.SETTINGS_V2.FOOTER.PRIVACY_LINK,
      'https://www.mozilla.org/en-US/privacy/websites/'
    );

    await testElementExists(selectors.SETTINGS_V2.FOOTER.TERMS_LINK);
    await testHrefEquals(
      selectors.SETTINGS_V2.FOOTER.TERMS_LINK,
      'https://www.mozilla.org/en-US/about/legal/terms/services/'
    );
  });

  it('renders Newsletters link in navigation when we are subscribed to a product', async () => {
    if (process.env.CIRCLECI === 'true' && !process.env.SUBHUB_STRIPE_APIKEY) {
      this.skip('missing Stripe API key in CircleCI run');
    }
    const email = createEmail();
    await clearBrowserState({
      '123done': true,
      force: true,
    });
    await createUser(email, PASSWORD, { preVerified: true });
    await openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER);
    await fillOutEmailFirstSignIn(email, PASSWORD);
    await testElementExists(selectors.SETTINGS.HEADER);

    // subscribe
    await openRP();
    await click(selectors['123DONE'].BUTTON_SIGNIN);
    await testElementExists(selectors.SIGNIN_PASSWORD.HEADER);
    await click(selectors['SIGNIN_PASSWORD'].SUBMIT_USE_SIGNED_IN);
    await testElementExists(selectors['123DONE'].AUTHENTICATED);
    await visibleByQSA(selectors['123DONE'].BUTTON_SUBSCRIBE);
    await click(selectors['123DONE'].LINK_LOGOUT);
    await visibleByQSA(selectors['123DONE'].BUTTON_SIGNIN);
    await subscribeToTestProduct();

    // Signin
    await openRP();
    await click(selectors['123DONE'].BUTTON_SIGNIN);
    await testElementExists(selectors.SIGNIN_PASSWORD.HEADER);
    await click(selectors['SIGNIN_PASSWORD'].SUBMIT_USE_SIGNED_IN);
    await testElementExists(selectors['123DONE'].AUTHENTICATED);
    await visibleByQSA(selectors['123DONE'].SUBSCRIBED);

    // test
    await testElementExists(
      selectors.SETTINGS_V2.NAVIGATION.SUBSCRIPTIONS_LINK
    );
    await testHrefEquals(
      selectors.SETTINGS_V2.NAVIGATION.SUBSCRIPTIONS_LINK,
      `${window.location.protocol}${window.location.host}/subscriptions/`
    );
  });
});
