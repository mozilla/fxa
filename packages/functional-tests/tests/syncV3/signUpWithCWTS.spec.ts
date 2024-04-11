/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FirefoxCommand, createCustomEventDetail } from '../../lib/channels';
import {
  expect,
  test,
  PASSWORD,
  SYNC_EMAIL_PREFIX,
} from '../../lib/fixtures/standard';
import uaStrings from '../../lib/ua-strings';

test.describe.configure({ mode: 'parallel' });

test.describe('severity-1 #smoke', () => {
  test.describe('Sync v3 sign up and CWTS', () => {
    test.use({
      emailOptions: [{ prefix: SYNC_EMAIL_PREFIX, password: PASSWORD }],
    });
    test.beforeEach(async ({ pages: { configPage } }) => {
      const config = await configPage.getConfig();
      test.skip(
        config.showReactApp.signUpRoutes === true,
        'these tests are specific to backbone, skip if seeing React version'
      );
      test.slow();
    });

    test('verify with signup code and CWTS', async ({
      emails,
      target,
      syncBrowserPages,
    }) => {
      const [email] = emails;
      const { login, page, connectAnotherDevice } = syncBrowserPages;
      const query = new URLSearchParams({
        forceUA: uaStrings['desktop_firefox_71'],
      });
      const eventDetailStatus = createCustomEventDetail(
        FirefoxCommand.FxAStatus,
        {
          signedInUser: null,
          capabilities: {
            choose_what_to_sync: true,
            multiService: true,
            engines: ['history'],
          },
        }
      );
      const eventDetailLinkAccount = createCustomEventDetail(
        FirefoxCommand.LinkAccount,
        {
          ok: true,
        }
      );
      await page.goto(
        `${
          target.contentServerUrl
        }?context=fx_desktop_v3&service=sync&automatedBrowser=true&${query.toString()}`
      );
      await login.respondToWebChannelMessage(eventDetailStatus);
      await login.respondToWebChannelMessage(eventDetailLinkAccount);
      await login.checkWebChannelMessage('fxaccounts:fxa_status');
      await login.setEmail(email);
      await login.clickSubmit();
      await login.setPassword(PASSWORD);
      await login.confirmPassword(PASSWORD);
      await login.setAge('21');

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
      await login.fillOutSignUpCode(email);
      await expect(connectAnotherDevice.fxaConnected).toBeVisible();
    });

    test('verify at CWTS', async ({ emails, target, syncBrowserPages }) => {
      const { login, page, connectAnotherDevice } = syncBrowserPages;
      const [email] = emails;
      const query = new URLSearchParams({
        forceUA: uaStrings['desktop_firefox_58'],
      });
      const eventDetailStatus = createCustomEventDetail(
        FirefoxCommand.FxAStatus,
        {
          signedInUser: null,
          capabilities: {
            multiService: false,
          },
        }
      );
      await page.goto(
        `${
          target.contentServerUrl
        }?context=fx_desktop_v3&service=sync&automatedBrowser=true&${query.toString()}`,
        {
          waitUntil: 'load',
        }
      );
      await login.respondToWebChannelMessage(eventDetailStatus);
      await login.checkWebChannelMessage('fxaccounts:fxa_status');
      await login.setEmail(email);
      await login.clickSubmit();
      await login.setPassword(PASSWORD);
      await login.confirmPassword(PASSWORD);
      await login.setAge('21');
      await login.submit();

      // Verify the CWTS page and the checkboxes
      await expect(login.CWTSEngineHeader).toBeVisible();
      await expect(login.CWTSEngineAddresses).toBeHidden();
      await expect(login.CWTSDoNotSync).toBeHidden();
      await expect(login.CWTSEngineCreditCards).toBeHidden();
      await login.checkWebChannelMessage(FirefoxCommand.LinkAccount);
      await login.noSuchWebChannelMessage(FirefoxCommand.Login);
      await login.clickSubmit();
      await login.fillOutSignUpCode(email);
      await login.checkWebChannelMessage(FirefoxCommand.Login);
      await expect(connectAnotherDevice.fxaConnected).toBeVisible();
    });

    test('engines not supported', async ({
      emails,
      target,
      syncBrowserPages: { login, page },
    }) => {
      const [email] = emails;
      const query = new URLSearchParams({
        forceUA: uaStrings['desktop_firefox_58'],
      });
      const eventDetailStatus = createCustomEventDetail(
        FirefoxCommand.FxAStatus,
        {
          signedInUser: null,
        }
      );
      await page.goto(
        `${
          target.contentServerUrl
        }?context=fx_desktop_v3&service=sync&automatedBrowser=true&${query.toString()}`
      );
      await login.respondToWebChannelMessage(eventDetailStatus);
      await login.checkWebChannelMessage('fxaccounts:fxa_status');
      await login.setEmail(email);
      await login.clickSubmit();
      await login.setPassword(PASSWORD);
      await login.confirmPassword(PASSWORD);
      await login.setAge('21');
      await login.submit();

      // Verify the CWTS page and the checkboxes
      await expect(login.CWTSEngineHeader).toBeVisible();
      await expect(login.CWTSEngineAddresses).toBeHidden();
      await expect(login.CWTSEngineCreditCards).toBeHidden();
    });

    test('neither `creditcards` nor `addresses` supported', async ({
      emails,
      target,
      syncBrowserPages: { login, page },
    }) => {
      const [email] = emails;
      const query = new URLSearchParams({
        forceUA: uaStrings['desktop_firefox_58'],
      });
      const eventDetailStatus = createCustomEventDetail(
        FirefoxCommand.FxAStatus,
        {
          capabilities: {
            engines: [],
          },
          signedInUser: null,
        }
      );
      await page.goto(
        `${
          target.contentServerUrl
        }?context=fx_desktop_v3&service=sync&automatedBrowser=true&${query.toString()}`
      );
      await login.respondToWebChannelMessage(eventDetailStatus);
      await login.checkWebChannelMessage('fxaccounts:fxa_status');
      await login.setEmail(email);
      await login.clickSubmit();
      await login.setPassword(PASSWORD);
      await login.confirmPassword(PASSWORD);
      await login.setAge('21');
      await login.submit();

      // Verify the CWTS page and the checkboxes
      await expect(login.CWTSEngineHeader).toBeVisible();
      await expect(login.CWTSEngineAddresses).toBeHidden();
      await expect(login.CWTSEngineCreditCards).toBeHidden();
    });

    test('`creditcards` and `addresses` supported', async ({
      emails,
      target,
      syncBrowserPages: { login, page },
    }) => {
      const [email] = emails;
      const query = new URLSearchParams({
        forceUA: uaStrings['desktop_firefox_58'],
      });
      const eventDetailStatus = createCustomEventDetail(
        FirefoxCommand.FxAStatus,
        {
          capabilities: {
            engines: ['creditcards', 'addresses'],
          },
          signedInUser: null,
        }
      );
      await page.goto(
        `${
          target.contentServerUrl
        }?context=fx_desktop_v3&service=sync&automatedBrowser=true&${query.toString()}`
      );
      await login.respondToWebChannelMessage(eventDetailStatus);
      await login.checkWebChannelMessage('fxaccounts:fxa_status');
      await login.setEmail(email);
      await login.clickSubmit();
      await login.setPassword(PASSWORD);
      await login.confirmPassword(PASSWORD);
      await login.setAge('21');
      await login.submit();

      // Verify the CWTS page and the checkboxes
      await expect(login.CWTSEngineHeader).toBeVisible();
      await expect(login.CWTSEngineAddresses).toBeVisible();
      await expect(login.CWTSEngineCreditCards).toBeVisible();
    });
  });
});
