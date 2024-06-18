/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FirefoxCommand, createCustomEventDetail } from '../../lib/channels';
import { expect, test } from '../../lib/fixtures/standard';

test.describe('severity-1 #smoke', () => {
  test.describe('oauth webchannel', () => {
    test.beforeEach(async ({ pages: { signin } }) => {
      await signin.clearCache();
    });

    test('signup', async ({
      pages: { page, configPage, confirmSignupCode, signup, relier },
      target,
      testAccountTracker,
    }) => {
      test.fixme(
        true,
        'TODO in FXA-9881: verify FxAStatus webchannel message in React signup flow'
      );
      const { email, password } = testAccountTracker.generateAccountDetails();
      const customEventDetail = createCustomEventDetail(
        FirefoxCommand.FxAStatus,
        {
          capabilities: {
            choose_what_to_sync: true,
            engines: ['bookmarks', 'history'],
          },
          signedInUser: null,
        }
      );

      await relier.goto('context=oauth_webchannel_v1&automatedBrowser=true');
      await relier.clickEmailFirst();
      await signup.respondToWebChannelMessage(customEventDetail);
      await signup.fillOutEmailForm(email);

      // Signup form includes Choose what to sync options
      await expect(signup.signupFormHeading).toBeVisible();
      await expect(signup.CWTSEngineHeader).toBeVisible();
      await expect(signup.CWTSEngineBookmarks).toBeVisible();
      await expect(signup.CWTSEngineHistory).toBeVisible();

      await signup.fillOutSignupForm(password, '21');
      await expect(page).toHaveURL(/confirm_signup_code/);
      const code = await target.emailClient.getVerifyShortCode(email);
      await confirmSignupCode.fillOutCodeForm(code);

      await signup.checkWebChannelMessage(FirefoxCommand.OAuthLogin);
    });

    test('signin', async ({
      pages: { signin, relier, page },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      const customEventDetail = createCustomEventDetail(
        FirefoxCommand.FxAStatus,
        {
          capabilities: {
            engines: ['bookmarks', 'history'],
          },
          signedInUser: null,
        }
      );

      await relier.goto('context=oauth_webchannel_v1&automatedBrowser=true');
      await relier.clickEmailFirst();
      await signin.respondToWebChannelMessage(customEventDetail);

      const { searchParams } = new URL(page.url());
      expect(searchParams.has('client_id')).toBe(true);
      expect(searchParams.has('redirect_uri')).toBe(true);
      expect(searchParams.has('state')).toBe(true);
      expect(searchParams.has('context')).toBe(true);

      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);
    });
  });
});
