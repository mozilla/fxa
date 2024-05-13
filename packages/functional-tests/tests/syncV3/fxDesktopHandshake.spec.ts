/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FirefoxCommand, createCustomEventDetail } from '../../lib/channels';
import { expect, test } from '../../lib/fixtures/standard';
import uaStrings from '../../lib/ua-strings';

test.describe('severity-2 #smoke', () => {
  test.describe('Firefox desktop user info handshake', () => {
    test.beforeEach(async () => {
      test.slow();
    });

    test('Non-Sync - no user signed into browser, no user signed in locally', async ({
      target,
      syncBrowserPages: { signinReact, page },
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
      await signinReact.respondToWebChannelMessage(eventDetailStatus);
      await signinReact.checkWebChannelMessage('fxaccounts:fxa_status');
      await expect(signinReact.emailFirstHeading).toBeVisible();
      await expect(signinReact.emailTextbox).toHaveValue('');
    });

    test('Sync - no user signed into browser, no user signed in locally', async ({
      target,
      syncBrowserPages: { signinReact, page },
    }) => {
      const query = new URLSearchParams({
        forceUA: uaStrings['desktop_firefox_71'],
      });
      await page.goto(
        `${
          target.contentServerUrl
        }?context=fx_desktop_v3&service=sync&${query.toString()}`
      );
      await expect(signinReact.syncSignInHeading).toBeVisible();
      await expect(signinReact.emailTextbox).toHaveValue('');
    });

    test('Sync - user signed into browser, no user signed in locally', async ({
      target,
      syncBrowserPages: { signinReact, page },
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
      await signinReact.respondToWebChannelMessage(eventDetailStatus);
      await signinReact.checkWebChannelMessage('fxaccounts:fxa_status');
      // redirected to signin with email preselected
      await expect(signinReact.passwordFormHeading).toBeVisible();
      await expect(page.getByText(credentials.email)).toBeVisible();
    });

    test('Non-Sync - user signed into browser, no user signed in locally', async ({
      target,
      syncBrowserPages: { page, settings, signinReact },
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
      await signinReact.respondToWebChannelMessage(eventDetailStatus);
      await signinReact.checkWebChannelMessage('fxaccounts:fxa_status');
      // redirected to signin with email preselected
      await expect(signinReact.passwordFormHeading).toBeVisible();
      await expect(page.getByText(credentials.email)).toBeVisible();
      await signinReact.fillOutPasswordForm(credentials.password);
      await expect(settings.settingsHeading).toBeVisible();
    });

    test('Non-Sync - user signed into browser, user signed in locally', async ({
      target,
      syncBrowserPages: { settings, signinReact, page },
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
      await signinReact.respondToWebChannelMessage(eventDetailStatus);
      await signinReact.checkWebChannelMessage('fxaccounts:fxa_status');

      await signinReact.fillOutEmailFirstForm(syncCredentials.email);
      await signinReact.fillOutPasswordForm(syncCredentials.password);
      await expect(settings.settingsHeading).toBeVisible();

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
      await signinReact.respondToWebChannelMessage(eventDetailStatusSignIn);
      await signinReact.checkWebChannelMessage('fxaccounts:fxa_status');

      await expect(signinReact.cachedSigninHeading).toBeVisible();
      await expect(page.getByText(syncCredentials.email)).toBeVisible();

      await signinReact.signInButton.click();
      await expect(settings.settingsHeading).toBeVisible();
    });

    test('Sync force_auth page - user signed into browser is different to requested user', async ({
      target,
      syncBrowserPages: { signinReact, page },
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
      await signinReact.respondToWebChannelMessage(eventDetailStatus);
      await signinReact.checkWebChannelMessage('fxaccounts:fxa_status');

      await expect(signinReact.passwordFormHeading).toBeVisible();
      await expect(page.getByText(syncCredentials.email)).toBeVisible();
    });

    test('Non-Sync force_auth page - user signed into browser is different to requested user', async ({
      target,
      syncBrowserPages: { signinReact, page },
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
      await signinReact.respondToWebChannelMessage(eventDetailStatus);
      await signinReact.checkWebChannelMessage('fxaccounts:fxa_status');
      await expect(signinReact.passwordFormHeading).toBeVisible();
      await expect(page.getByText(syncCredentials.email)).toBeVisible();
    });

    test('Sync - no user signed into browser, user signed in locally', async ({
      target,
      syncBrowserPages: {
        connectAnotherDevice,
        settings,
        signinReact,
        signinTokenCode,
        page,
      },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      const query = new URLSearchParams({
        forceUA: uaStrings['desktop_firefox_71'],
      });
      await page.goto(
        `${target.contentServerUrl}?automatedBrowser=true&${query.toString()}`
      );
      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(credentials.password);
      await expect(settings.settingsHeading).toBeVisible();
      await page.goto(
        `${
          target.contentServerUrl
        }?context=fx_desktop_v3&service=sync&automatedBrowser=true&${query.toString()}`
      );

      await expect(signinReact.passwordFormHeading).toBeVisible();
      await expect(page.getByText(credentials.email)).toBeVisible();
      await signinReact.fillOutPasswordForm(credentials.password);
      await expect(connectAnotherDevice.fxaConnected).toBeVisible();
    });

    test('Non-Sync settings page - no user signed into browser, user signed in locally', async ({
      target,
      syncBrowserPages: { page, settings, signinReact },
      testAccountTracker,
    }) => {
      const syncCredentials = await testAccountTracker.signUpSync();
      const query = new URLSearchParams({
        forceUA: uaStrings['desktop_firefox_71'],
      });
      await page.goto(
        `${target.contentServerUrl}?automatedBrowser=true&${query.toString()}`
      );
      await signinReact.fillOutEmailFirstForm(syncCredentials.email);
      await signinReact.fillOutPasswordForm(syncCredentials.password);
      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.primaryEmail.status).toHaveText(
        syncCredentials.email
      );
    });
  });
});
