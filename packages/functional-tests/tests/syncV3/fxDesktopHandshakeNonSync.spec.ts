/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  FF_OAUTH_CLIENT_ID,
  FirefoxCommand,
  FxAStatusResponse,
} from '../../lib/channels';
import { expect, test } from '../../lib/fixtures/standard';
import uaStrings from '../../lib/ua-strings';

test.describe('severity-2 #smoke', () => {
  test.describe('Firefox desktop user info handshake', () => {
    test('Non-Sync - no user signed into browser, no user signed in locally', async ({
      target,
      pages: { page, signin },
    }) => {
      const query = new URLSearchParams({
        forceUA: uaStrings['desktop_firefox_71'],
      });
      const eventDetailStatus: FxAStatusResponse = {
        id: 'account_updates',
        message: {
          command: FirefoxCommand.FxAStatus,
          data: {
            signedInUser: null,
            clientId: FF_OAUTH_CLIENT_ID,
            capabilities: {
              engines: [],
              pairing: false,
              multiService: false,
            },
          },
        },
      };
      await signin.respondToWebChannelMessage(eventDetailStatus);
      await page.goto(
        `${target.contentServerUrl}?automatedBrowser=true&${query.toString()}`
      );
      await signin.checkWebChannelMessage(FirefoxCommand.FxAStatus);
      // nothing to suggest
      await expect(signin.emailTextbox).toHaveValue('');
    });

    test('Non-Sync - user signed into browser, no user signed in locally', async ({
      target,
      pages: { page, signin },
      testAccountTracker,
    }) => {
      const syncCredentials = await testAccountTracker.signUpSync();
      const query = new URLSearchParams({
        forceUA: uaStrings['desktop_firefox_71'],
      });
      const eventDetailStatus: FxAStatusResponse = {
        id: 'account_updates',
        message: {
          command: FirefoxCommand.FxAStatus,
          data: {
            signedInUser: syncCredentials,
            clientId: FF_OAUTH_CLIENT_ID,
            capabilities: {
              engines: [],
              pairing: false,
              multiService: false,
            },
          },
        },
      };

      await signin.respondToWebChannelMessage(eventDetailStatus);
      await page.goto(
        `${target.contentServerUrl}?automatedBrowser=true&${query.toString()}`
      );
      await signin.checkWebChannelMessage(FirefoxCommand.FxAStatus);
      // account signed into browser suggested
      await expect(signin.cachedSigninHeading).toBeVisible();
      await expect(page.getByText(syncCredentials.email)).toBeVisible();
    });

    test('Non-Sync - user signed into browser, user signed in locally', async ({
      target,
      pages: { page, settings, signin },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      const syncCredentials = await testAccountTracker.signUpSync();
      const query = new URLSearchParams({
        forceUA: uaStrings['desktop_firefox_71'],
      });
      // no user signed into browser
      const eventDetailStatusNoSync: FxAStatusResponse = {
        id: 'account_updates',
        message: {
          command: FirefoxCommand.FxAStatus,
          data: {
            clientId: FF_OAUTH_CLIENT_ID,
            signedInUser: null,
            capabilities: {
              engines: [],
              pairing: false,
              multiService: false,
            },
          },
        },
      };

      await page.goto(
        `${target.contentServerUrl}?automatedBrowser=true&${query.toString()}`
      );
      await signin.respondToWebChannelMessage(eventDetailStatusNoSync);
      await signin.checkWebChannelMessage(FirefoxCommand.FxAStatus);
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);
      await expect(settings.settingsHeading).toBeVisible();

      // webChannel message indicating that there is now
      // also an account signed into the browser
      const eventDetailStatusSync: FxAStatusResponse = {
        id: 'account_updates',
        message: {
          command: FirefoxCommand.FxAStatus,
          data: {
            clientId: FF_OAUTH_CLIENT_ID,
            signedInUser: {
              email: syncCredentials.email,
            },
            capabilities: {
              engines: [],
              pairing: false,
              multiService: false,
            },
          },
        },
      };

      await page.goto(
        `${target.contentServerUrl}?automatedBrowser=true&${query.toString()}`
      );
      await signin.respondToWebChannelMessage(eventDetailStatusSync);
      await signin.checkWebChannelMessage(FirefoxCommand.FxAStatus);

      await expect(signin.cachedSigninHeading).toBeVisible();
      // currently signed in local account takes precedence
      await expect(page.getByText(credentials.email)).toBeVisible();
      await signin.signInButton.click();
      await page.waitForURL(/settings/);
      await expect(settings.settingsHeading).toBeVisible();
    });

    test('Non-Sync force_auth page - user signed into browser is different to requested user', async ({
      target,
      pages: { page, signin },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      const syncCredentials = await testAccountTracker.signUpSync();
      const query = new URLSearchParams({
        forceUA: uaStrings['desktop_firefox_71'],
        email: credentials.email,
      });
      const eventDetailStatus: FxAStatusResponse = {
        id: 'account_updates',
        message: {
          command: FirefoxCommand.FxAStatus,
          data: {
            clientId: FF_OAUTH_CLIENT_ID,
            signedInUser: {
              email: syncCredentials.email,
            },
            capabilities: {
              engines: [],
              pairing: false,
              multiService: false,
            },
          },
        },
      };
      await page.goto(
        `${
          target.contentServerUrl
        }?force_auth&automatedBrowser=true&${query.toString()}`
      );
      await signin.respondToWebChannelMessage(eventDetailStatus);
      await signin.checkWebChannelMessage(FirefoxCommand.FxAStatus);
      await expect(signin.passwordFormHeading).toBeVisible();
      // email param takes precedence over user signed into the browser
      await expect(page.getByText(credentials.email)).toBeVisible();
    });

    test('Non-Sync settings page - no user signed into browser, user signed in locally', async ({
      target,
      pages: { page, settings, signin },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
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
        }?force_auth&automatedBrowser=true&${query.toString()}`
      );
      const eventDetailStatus: FxAStatusResponse = {
        id: 'account_updates',
        message: {
          command: FirefoxCommand.FxAStatus,
          data: {
            clientId: FF_OAUTH_CLIENT_ID,
            signedInUser: null,
            capabilities: {
              engines: [],
              pairing: false,
              multiService: false,
            },
          },
        },
      };
      await signin.respondToWebChannelMessage(eventDetailStatus);
      await signin.checkWebChannelMessage(FirefoxCommand.FxAStatus);
      await expect(signin.cachedSigninHeading).toBeVisible();
      await expect(page.getByText(credentials.email)).toBeVisible();
    });
  });
});
