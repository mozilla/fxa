/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FirefoxCommand, createCustomEventDetail } from '../../lib/channels';
import { test, expect } from '../../lib/fixtures/standard';

const PASSWORD = 'Password123!';

test.describe('severity-1 #smoke', () => {
  test.describe('oauth webchannel', () => {
    test.beforeEach(async ({ pages: { login } }) => {
      await login.clearCache();
    });

    test('signup', async ({ page, pages: { configPage, login, relier } }) => {
      const config = await configPage.getConfig();
      if (config.showReactApp.signUpRoutes === true) {
        test.skip(
          true,
          'for react version of signup, this test is replaced by "signup oauth webchannel - sync mobile or FF desktop 123+"'
        );
      }
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
      const email = login.createEmail();

      await relier.goto('context=oauth_webchannel_v1&automatedBrowser=true');
      await relier.clickEmailFirst();

      await login.respondToWebChannelMessage(customEventDetail);

      await login.setEmail(email);
      await login.submit();

      await page.waitForURL(/\/signup/);
      expect(
        await page.getByRole('heading', { name: 'Set your password' })
      ).toBeVisible();
      // the CWTS form is on the same signup page

      expect(await login.isCWTSEngineBookmarks()).toBe(true);
      expect(await login.isCWTSEngineHistory()).toBe(true);

      await login.fillOutFirstSignUp(email, PASSWORD, {
        enterEmail: false,
        waitForNavOnSubmit: false,
      });
      await login.checkWebChannelMessage(FirefoxCommand.OAuthLogin);
    });

    test('signin', async ({ pages: { login, relier, page }, credentials }) => {
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

      await login.respondToWebChannelMessage(customEventDetail);

      const { searchParams } = new URL(page.url());
      expect(searchParams.has('client_id')).toBe(true);
      expect(searchParams.has('redirect_uri')).toBe(true);
      expect(searchParams.has('state')).toBe(true);
      expect(searchParams.has('context')).toBe(true);

      await login.login(credentials.email, credentials.password, '', false);
    });
  });
});
