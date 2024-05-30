/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FirefoxCommand, createCustomEventDetail } from '../../lib/channels';
import { expect, test } from '../../lib/fixtures/standard';
import uaStrings from '../../lib/ua-strings';

test.describe('severity-2 #smoke', () => {
  test.describe('Firefox desktop user info handshake', () => {
    test('Non-Sync - no user signed into browser, no user signed in locally', async ({
      target,
      syncBrowserPages: { login, page },
    }) => {
      const query = new URLSearchParams({
        forceUA: uaStrings['desktop_firefox_71'],
      });
      const eventDetailStatus = createCustomEventDetail(
        FirefoxCommand.FxAStatus,
        {
          signedInUser: null,
        }
      );
      await page.goto(
        `${target.contentServerUrl}?automatedBrowser=true&${query.toString()}`
      );
      await login.respondToWebChannelMessage(eventDetailStatus);
      await login.checkWebChannelMessage('fxaccounts:fxa_status');
      expect(await login.getEmailInput()).toContain('');
    });

    test('Non-Sync - user signed into browser, no user signed in locally', async ({
      target,
      syncBrowserPages: { login, page },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      const query = new URLSearchParams({
        forceUA: uaStrings['desktop_firefox_71'],
        email: credentials.email,
      });
      const eventDetailStatus = createCustomEventDetail(
        FirefoxCommand.FxAStatus,
        {
          signedInUser: credentials.email,
        }
      );
      await page.goto(
        `${target.contentServerUrl}?automatedBrowser=true&${query.toString()}`
      );
      await login.respondToWebChannelMessage(eventDetailStatus);
      await login.checkWebChannelMessage('fxaccounts:fxa_status');
      expect(await login.getPrefilledEmail()).toContain(credentials.email);
      await login.setPassword(credentials.password);
      await login.clickSubmit();
      expect(await login.isUserLoggedIn()).toBe(true);
    });

    test('Non-Sync - user signed into browser, user signed in locally', async ({
      target,
      syncBrowserPages: { login, page },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      const syncCredentials = await testAccountTracker.signUpSync();
      const query = new URLSearchParams({
        forceUA: uaStrings['desktop_firefox_71'],
      });
      const eventDetailStatus = createCustomEventDetail(
        FirefoxCommand.FxAStatus,
        {
          signedInUser: null,
        }
      );
      await page.goto(
        `${target.contentServerUrl}?automatedBrowser=true&${query.toString()}`
      );
      await login.respondToWebChannelMessage(eventDetailStatus);
      await login.checkWebChannelMessage('fxaccounts:fxa_status');
      await login.fillOutEmailFirstSignIn(
        syncCredentials.email,
        syncCredentials.password
      );
      expect(await login.isUserLoggedIn()).toBe(true);

      // Then, sign in the user again, synthesizing the user having signed
      // into Sync after the initial sign in.
      const eventDetailStatusSignIn = createCustomEventDetail(
        FirefoxCommand.FxAStatus,
        {
          signedInUser: credentials.email,
        }
      );
      await page.goto(
        `${target.contentServerUrl}?automatedBrowser=true&${query.toString()}`
      );
      await login.respondToWebChannelMessage(eventDetailStatusSignIn);
      await login.checkWebChannelMessage('fxaccounts:fxa_status');

      expect(await login.getPrefilledEmail()).toContain(syncCredentials.email);
      await login.clickSignIn();
      expect(await login.isUserLoggedIn()).toBe(true);
    });

    test('Non-Sync force_auth page - user signed into browser is different to requested user', async ({
      target,
      syncBrowserPages: { login, page },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      const syncCredentials = await testAccountTracker.signUpSync();
      const query = new URLSearchParams({
        forceUA: uaStrings['desktop_firefox_71'],
        email: syncCredentials.email,
      });
      const eventDetailStatus = createCustomEventDetail(
        FirefoxCommand.FxAStatus,
        {
          signedInUser: credentials.email,
        }
      );
      await page.goto(
        `${
          target.contentServerUrl
        }?force_auth&automatedBrowser=true&${query.toString()}`
      );
      await login.respondToWebChannelMessage(eventDetailStatus);
      await login.checkWebChannelMessage('fxaccounts:fxa_status');
      expect(await login.getPrefilledEmail()).toContain(syncCredentials.email);
    });

    test('Non-Sync settings page - no user signed into browser, user signed in locally', async ({
      target,
      syncBrowserPages: { login, page, settings },
      testAccountTracker,
    }) => {
      const syncCredentials = await testAccountTracker.signUpSync();
      const query = new URLSearchParams({
        forceUA: uaStrings['desktop_firefox_71'],
      });
      await page.goto(
        `${target.contentServerUrl}?automatedBrowser=true&${query.toString()}`
      );
      await login.fillOutEmailFirstSignIn(
        syncCredentials.email,
        syncCredentials.password
      );
      expect(await login.isUserLoggedIn()).toBe(true);

      await settings.goto();
      await expect(settings.primaryEmail.status).toHaveText(
        syncCredentials.email
      );
    });
  });
});
