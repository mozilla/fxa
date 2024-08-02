/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FirefoxCommand, createCustomEventDetail } from '../../lib/channels';
import { expect, test } from '../../lib/fixtures/standard';
import uaStrings from '../../lib/ua-strings';

test.describe('severity-2 #smoke', () => {
  test.describe('Firefox desktop user info handshake', () => {
    test('Sync - no user signed into browser, no user signed in locally', async ({
      target,
      syncBrowserPages: { page, signin },
    }) => {
      const query = new URLSearchParams({
        forceUA: uaStrings['desktop_firefox_71'],
      });
      await page.goto(
        `${
          target.contentServerUrl
        }?context=fx_desktop_v3&service=sync&${query.toString()}`
      );
      await expect(signin.syncSignInHeading).toBeVisible();
      await expect(signin.emailTextbox).toHaveValue('');
    });

    test('Sync - user signed into browser, no user signed in locally', async ({
      target,
      syncBrowserPages: { page, signin },
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
        `${
          target.contentServerUrl
        }?context=fx_desktop_v3&service=sync&automatedBrowser=true&${query.toString()}`
      );
      await signin.respondToWebChannelMessage(eventDetailStatus);
      await signin.checkWebChannelMessage(FirefoxCommand.FxAStatus);
      await expect(signin.passwordFormHeading).toBeVisible();
      await expect(page.getByText(credentials.email)).toBeVisible();
    });

    test('Sync force_auth page - user signed into browser is different to requested user', async ({
      target,
      syncBrowserPages: { page, signin },
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
        }?force_auth&automatedBrowser=true&context=fx_desktop_v3&service=sync&${query.toString()}`
      );
      await signin.respondToWebChannelMessage(eventDetailStatus);
      await signin.checkWebChannelMessage(FirefoxCommand.FxAStatus);
      await expect(signin.passwordFormHeading).toBeVisible();
      await expect(page.getByText(syncCredentials.email)).toBeVisible();
    });

    test('Sync - no user signed into browser, user signed in locally', async ({
      target,
      syncBrowserPages: { page, settings, signin },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUpSync();
      const query = new URLSearchParams({
        forceUA: uaStrings['desktop_firefox_71'],
      });
      await page.goto(
        `${target.contentServerUrl}?automatedBrowser=true&${query.toString()}`
      );
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);
      await expect(settings.settingsHeading).toBeVisible();
      await page.goto(
        `${
          target.contentServerUrl
        }?context=fx_desktop_v3&service=sync&automatedBrowser=true&${query.toString()}`
      );
      await expect(signin.passwordFormHeading).toBeVisible();
      await expect(page.getByText(credentials.email)).toBeVisible();
    });
  });
});
