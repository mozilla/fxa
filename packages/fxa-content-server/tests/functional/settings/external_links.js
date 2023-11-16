/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const intern = require('intern').default;
const config = intern._config;
const SETTINGS_URL = config.fxaSettingsV2Root;
const { describe, it, beforeEach } = intern.getPlugin('interface.bdd');
const selectors = require('../lib/selectors');
const FunctionalHelpers = require('../lib/helpers');
const { createEmail } = FunctionalHelpers;
const FunctionalSettingsHelpers = require('./lib/helpers');
const { navigateToSettingsV2 } = FunctionalSettingsHelpers;

describe('external links', () => {
  let primaryEmail,
    testHrefEquals,
    testHrefIncludes,
    testElementExists,
    clearBrowserState,
    openPage,
    subscribeAndSigninToRp;

  beforeEach(async ({ remote }) => {
    ({
      clearBrowserState,
      testHrefEquals,
      testHrefIncludes,
      testElementExists,
      openPage,
      subscribeAndSigninToRp,
    } = FunctionalHelpers.applyRemote(remote));
    await clearBrowserState();
    primaryEmail = await navigateToSettingsV2(remote);
  });

  it('renders external links correctly', async () => {
    await testElementExists(selectors.SETTINGS.NAVIGATION.NEWSLETTERS_LINK);
    await testHrefIncludes(
      selectors.SETTINGS.NAVIGATION.NEWSLETTERS_LINK,
      encodeURIComponent(primaryEmail)
    );

    await testElementExists(selectors.SETTINGS.FOOTER.PRIVACY_LINK);
    await testHrefEquals(
      selectors.SETTINGS.FOOTER.PRIVACY_LINK,
      'https://www.mozilla.org/en-US/privacy/websites/'
    );

    await testElementExists(selectors.SETTINGS.FOOTER.TERMS_LINK);
    await testHrefEquals(
      selectors.SETTINGS.FOOTER.TERMS_LINK,
      'https://www.mozilla.org/en-US/about/legal/terms/services/'
    );
  });

  it('renders Subscriptions link in navigation when we are subscribed to a product', async function () {
    if (process.env.CIRCLECI === 'true' && !process.env.SUBHUB_STRIPE_APIKEY) {
      this.skip('missing Stripe API key in CircleCI run');
    }

    const email = createEmail();
    await subscribeAndSigninToRp(email);
    await openPage(SETTINGS_URL, selectors.SETTINGS.APP);

    // test
    await testElementExists(selectors.SETTINGS.NAVIGATION.SUBSCRIPTIONS_LINK);
    await testHrefEquals(
      selectors.SETTINGS.NAVIGATION.SUBSCRIPTIONS_LINK,
      `/subscriptions`
    );
  });
});
