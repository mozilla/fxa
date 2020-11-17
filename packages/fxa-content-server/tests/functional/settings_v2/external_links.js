/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const intern = require('intern').default;
const { describe, it, beforeEach } = intern.getPlugin('interface.bdd');
const selectors = require('../lib/selectors');
const FunctionalHelpers = require('../lib/helpers');
const FunctionalSettingsHelpers = require('./lib/helpers');
const { navigateToSettingsV2 } = FunctionalSettingsHelpers;

describe('external links', () => {
  let primaryEmail;
  let testHrefEquals, testElementExists, clearBrowserState;
  beforeEach(async ({ remote }) => {
    ({
      clearBrowserState,
      testHrefEquals,
      testElementExists,
      testElementExists,
    } = FunctionalHelpers.applyRemote(remote));
    await clearBrowserState();
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
});
