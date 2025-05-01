/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  FF_OAUTH_CLIENT_ID,
  FirefoxCommand,
  FxAStatusResponse,
  LinkAccountResponse,
} from '../../lib/channels';
import { expect, test } from '../../lib/fixtures/standard';
import uaStrings from '../../lib/ua-strings';

test.describe('severity-1 #smoke', () => {
  test.describe('Sync v3 sign up and CWTS', () => {
    test.beforeEach(async ({ pages: { configPage } }) => {
      const config = await configPage.getConfig();
      test.skip(
        config.showReactApp.signUpRoutes === true,
        'these tests are specific to backbone, skip if seeing React version'
      );
    });

    test('verify with signup code and CWTS', async ({
      target,
      syncBrowserPages: { login, page, connectAnotherDevice },
      testAccountTracker,
    }) => {
      const { email, password } =
        testAccountTracker.generateSyncAccountDetails();
      const query = new URLSearchParams({
        forceUA: uaStrings['desktop_firefox_71'],
      });
      const eventDetailStatus: FxAStatusResponse = {
        id: 'account_updates',
        message: {
          command: FirefoxCommand.FxAStatus,
          data: {
            clientId: FF_OAUTH_CLIENT_ID,
            signedInUser: null,
            capabilities: {
              pairing: true,
              choose_what_to_sync: true,
              multiService: false,
              engines: ['history'],
            },
          },
        },
      };

      const eventDetailLinkAccount: LinkAccountResponse = {
        id: 'account_updates',
        message: {
          command: FirefoxCommand.LinkAccount,
          data: {
            ok: true,
          },
        },
      };

      await page.goto(
        `${
          target.contentServerUrl
        }?context=fx_desktop_v3&service=sync&automatedBrowser=true&${query.toString()}`
      );
      await login.respondToWebChannelMessage(eventDetailStatus);
      await login.respondToWebChannelMessage(eventDetailLinkAccount);
      await login.checkWebChannelMessage(FirefoxCommand.FxAStatus);
      await login.setEmail(email);
      await login.clickSubmit();
      await login.setPassword(password);
      await login.confirmPassword(password);

      // The CWTS form is on the same signup page
      await expect(login.CWTSEngineHeader).toBeVisible();
      await expect(login.CWTSEngineBookmarks).toBeVisible();
      await expect(login.CWTSEngineHistory).toBeVisible();
      await expect(login.CWTSEnginePasswords).toBeVisible();
      await expect(login.CWTSEngineAddons).toBeVisible();
      await expect(login.CWTSEnginePreferences).toBeVisible();
      await expect(login.CWTSEngineAddresses).toBeHidden();

      // Uncheck the passwords and history engines
      await login.CWTSEngineHistory.click();
      await login.CWTSEnginePasswords.click();
      await login.clickSubmit();
      await login.checkWebChannelMessage(FirefoxCommand.LinkAccount);
      const code = await target.emailClient.getVerifyShortCode(email);
      await login.fillOutSignUpCode(code);
      await expect(connectAnotherDevice.fxaConnected).toBeVisible();
    });

    test('verify at CWTS', async ({
      target,
      syncBrowserPages: { login, page, connectAnotherDevice },
      testAccountTracker,
    }) => {
      const { email, password } =
        testAccountTracker.generateSyncAccountDetails();
      const query = new URLSearchParams({
        forceUA: uaStrings['desktop_firefox_58'],
      });
      const eventDetailStatus: FxAStatusResponse = {
        id: 'account_updates',
        message: {
          command: FirefoxCommand.FxAStatus,
          data: {
            clientId: FF_OAUTH_CLIENT_ID,
            signedInUser: null,
            capabilities: {
              multiService: false,
              pairing: false,
              engines: [],
            },
          },
        },
      };

      await page.goto(
        `${
          target.contentServerUrl
        }?context=fx_desktop_v3&service=sync&automatedBrowser=true&${query.toString()}`,
        {
          waitUntil: 'load',
        }
      );
      await login.respondToWebChannelMessage(eventDetailStatus);
      await login.checkWebChannelMessage(FirefoxCommand.FxAStatus);
      await login.setEmail(email);
      await login.clickSubmit();
      await login.setPassword(password);
      await login.confirmPassword(password);
      await login.submit();

      // Verify the CWTS page and the checkboxes
      await expect(login.CWTSEngineHeader).toBeVisible();
      await expect(login.CWTSEngineAddresses).toBeHidden();
      await expect(login.CWTSDoNotSync).toBeHidden();
      await expect(login.CWTSEngineCreditCards).toBeHidden();
      await login.checkWebChannelMessage(FirefoxCommand.LinkAccount);
      await login.clickSubmit();
      const code = await target.emailClient.getVerifyShortCode(email);
      await login.fillOutSignUpCode(code);
      await login.checkWebChannelMessage(FirefoxCommand.Login);
      await expect(connectAnotherDevice.fxaConnected).toBeVisible();
    });

    test('engines not supported', async ({
      target,
      syncBrowserPages: { login, page },
      testAccountTracker,
    }) => {
      const { email, password } =
        testAccountTracker.generateSyncAccountDetails();
      const query = new URLSearchParams({
        forceUA: uaStrings['desktop_firefox_58'],
      });
      const eventDetailStatus: FxAStatusResponse = {
        id: 'account_updates',
        message: {
          command: FirefoxCommand.FxAStatus,
          data: {
            clientId: FF_OAUTH_CLIENT_ID,
            signedInUser: null,
            capabilities: {
              pairing: false,
              multiService: false,
              engines: [],
            },
          },
        },
      };

      await page.goto(
        `${
          target.contentServerUrl
        }?context=fx_desktop_v3&service=sync&automatedBrowser=true&${query.toString()}`
      );
      await login.respondToWebChannelMessage(eventDetailStatus);
      await login.checkWebChannelMessage(FirefoxCommand.FxAStatus);
      await login.setEmail(email);
      await login.clickSubmit();
      await login.setPassword(password);
      await login.confirmPassword(password);
      await login.submit();

      // Verify the CWTS page and the checkboxes
      await expect(login.CWTSEngineHeader).toBeVisible();
      await expect(login.CWTSEngineAddresses).toBeHidden();
      await expect(login.CWTSEngineCreditCards).toBeHidden();
    });

    test('neither `creditcards` nor `addresses` supported', async ({
      target,
      syncBrowserPages: { login, page },
      testAccountTracker,
    }) => {
      const { email, password } =
        testAccountTracker.generateSyncAccountDetails();
      const query = new URLSearchParams({
        forceUA: uaStrings['desktop_firefox_58'],
      });
      const eventDetailStatus: FxAStatusResponse = {
        id: 'account_updates',
        message: {
          command: FirefoxCommand.FxAStatus,
          data: {
            clientId: FF_OAUTH_CLIENT_ID,
            signedInUser: null,
            capabilities: {
              pairing: false,
              multiService: false,
              engines: [],
            },
          },
        },
      };
      await page.goto(
        `${
          target.contentServerUrl
        }?context=fx_desktop_v3&service=sync&automatedBrowser=true&${query.toString()}`
      );
      await login.respondToWebChannelMessage(eventDetailStatus);
      await login.checkWebChannelMessage(FirefoxCommand.FxAStatus);
      await login.setEmail(email);
      await login.clickSubmit();
      await login.setPassword(password);
      await login.confirmPassword(password);
      await login.submit();

      // Verify the CWTS page and the checkboxes
      await expect(login.CWTSEngineHeader).toBeVisible();
      await expect(login.CWTSEngineAddresses).toBeHidden();
      await expect(login.CWTSEngineCreditCards).toBeHidden();
    });

    test('`creditcards` and `addresses` supported', async ({
      target,
      syncBrowserPages: { login, page },
      testAccountTracker,
    }) => {
      const { email, password } =
        testAccountTracker.generateSyncAccountDetails();
      const query = new URLSearchParams({
        forceUA: uaStrings['desktop_firefox_58'],
      });
      const eventDetailStatus: FxAStatusResponse = {
        id: 'account_updates',
        message: {
          command: FirefoxCommand.FxAStatus,
          data: {
            signedInUser: null,
            clientId: FF_OAUTH_CLIENT_ID,
            capabilities: {
              pairing: false,
              multiService: false,
              engines: ['creditcards', 'addresses'],
            },
          },
        },
      };

      await page.goto(
        `${
          target.contentServerUrl
        }?context=fx_desktop_v3&service=sync&automatedBrowser=true&${query.toString()}`
      );
      await login.respondToWebChannelMessage(eventDetailStatus);
      await login.checkWebChannelMessage(FirefoxCommand.FxAStatus);
      await login.setEmail(email);
      await login.clickSubmit();
      await login.setPassword(password);
      await login.confirmPassword(password);
      await login.submit();

      // Verify the CWTS page and the checkboxes
      await expect(login.CWTSEngineHeader).toBeVisible();
      await expect(login.CWTSEngineAddresses).toBeVisible();
      await expect(login.CWTSEngineCreditCards).toBeVisible();
    });
  });
});
