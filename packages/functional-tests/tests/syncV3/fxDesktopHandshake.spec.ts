/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FirefoxCommand, createCustomEventDetail } from '../../lib/channels';
import {
  expect,
  test,
  PASSWORD,
  SIGNIN_EMAIL_PREFIX,
  SYNC_EMAIL_PREFIX,
} from '../../lib/fixtures/standard';
import uaStrings from '../../lib/ua-strings';

test.describe.configure({ mode: 'parallel' });

test.describe('severity-2 #smoke', () => {
  test.beforeEach(async () => {
    test.slow();
  });

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

    test('Sync - no user signed into browser, no user signed in locally', async ({
      target,
      syncBrowserPages: { login, page },
    }) => {
      const query = new URLSearchParams({
        forceUA: uaStrings['desktop_firefox_71'],
      });
      await page.goto(
        `${
          target.contentServerUrl
        }?context=fx_desktop_v3&service=sync&${query.toString()}`
      );
      await login.waitForEmailHeader();
      expect(await login.getEmailInput()).toContain('');
    });

    test('Sync - user signed into browser, no user signed in locally', async ({
      emails,
      target,
      syncBrowserPages: { login, page },
    }) => {
      const [email] = emails;
      await target.authClient.signUp(email, PASSWORD, {
        lang: 'en',
        preVerified: true,
      });
      const query = new URLSearchParams({
        forceUA: uaStrings['desktop_firefox_71'],
        email: email,
      });
      const eventDetailStatus = createCustomEventDetail(
        FirefoxCommand.FxAStatus,
        {
          signedInUser: email,
        }
      );
      await page.goto(
        `${
          target.contentServerUrl
        }?context=fx_desktop_v3&service=sync&automatedBrowser=true&${query.toString()}`
      );
      await login.respondToWebChannelMessage(eventDetailStatus);
      await login.checkWebChannelMessage('fxaccounts:fxa_status');
      expect(await login.getPrefilledEmail()).toContain(email);
    });

    test('Non-Sync - user signed into browser, no user signed in locally', async ({
      emails,
      target,
      syncBrowserPages: { login, page },
    }) => {
      const [email] = emails;
      await target.authClient.signUp(email, PASSWORD, {
        lang: 'en',
        preVerified: true,
      });
      const query = new URLSearchParams({
        forceUA: uaStrings['desktop_firefox_71'],
        email: email,
      });
      const eventDetailStatus = createCustomEventDetail(
        FirefoxCommand.FxAStatus,
        {
          signedInUser: email,
        }
      );
      await page.goto(
        `${target.contentServerUrl}?automatedBrowser=true&${query.toString()}`
      );
      await login.respondToWebChannelMessage(eventDetailStatus);
      await login.checkWebChannelMessage('fxaccounts:fxa_status');
      expect(await login.getPrefilledEmail()).toContain(email);
      await login.setPassword(PASSWORD);
      await login.clickSubmit();
      expect(await login.isUserLoggedIn()).toBe(true);
    });
  });

  test.describe('Firefox desktop user info handshake', () => {
    test.use({
      emailOptions: [
        { prefix: SIGNIN_EMAIL_PREFIX, password: PASSWORD },
        { prefix: SYNC_EMAIL_PREFIX, password: PASSWORD },
      ],
    });

    test('Non-Sync - user signed into browser, user signed in locally', async ({
      emails,
      target,
      syncBrowserPages: { login, page },
    }) => {
      await Promise.all(
        emails.map(async (email) => {
          await target.authClient.signUp(email, PASSWORD, {
            lang: 'en',
            preVerified: 'true',
          });
        })
      );
      const [email, syncEmail] = emails;
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
      await login.fillOutEmailFirstSignIn(syncEmail, PASSWORD);
      expect(await login.isUserLoggedIn()).toBe(true);

      // Then, sign in the user again, synthesizing the user having signed
      // into Sync after the initial sign in.
      const eventDetailStatusSignIn = createCustomEventDetail(
        FirefoxCommand.FxAStatus,
        {
          signedInUser: email,
        }
      );
      await page.goto(
        `${target.contentServerUrl}?automatedBrowser=true&${query.toString()}`
      );
      await login.respondToWebChannelMessage(eventDetailStatusSignIn);
      await login.checkWebChannelMessage('fxaccounts:fxa_status');

      expect(await login.getPrefilledEmail()).toContain(syncEmail);
      await login.clickSignIn();
      expect(await login.isUserLoggedIn()).toBe(true);
    });

    test('Sync force_auth page - user signed into browser is different to requested user', async ({
      emails,
      target,
      syncBrowserPages: { login, page },
    }) => {
      await Promise.all(
        emails.map(async (email) => {
          await target.authClient.signUp(email, PASSWORD, {
            lang: 'en',
            preVerified: 'true',
          });
        })
      );
      const [email, syncEmail] = emails;
      const query = new URLSearchParams({
        forceUA: uaStrings['desktop_firefox_71'],
        email: syncEmail,
      });
      const eventDetailStatus = createCustomEventDetail(
        FirefoxCommand.FxAStatus,
        {
          signedInUser: email,
        }
      );
      await page.goto(
        `${
          target.contentServerUrl
        }?force_auth&automatedBrowser=true&context=fx_desktop_v3&service=sync&${query.toString()}`
      );
      await login.respondToWebChannelMessage(eventDetailStatus);
      await login.checkWebChannelMessage('fxaccounts:fxa_status');
      expect(await login.getPrefilledEmail()).toContain(syncEmail);
    });

    test('Non-Sync force_auth page - user signed into browser is different to requested user', async ({
      emails,
      target,
      syncBrowserPages: { login, page },
    }) => {
      await Promise.all(
        emails.map(async (email) => {
          await target.authClient.signUp(email, PASSWORD, {
            lang: 'en',
            preVerified: 'true',
          });
        })
      );
      const [email, syncEmail] = emails;
      const query = new URLSearchParams({
        forceUA: uaStrings['desktop_firefox_71'],
        email: syncEmail,
      });
      const eventDetailStatus = createCustomEventDetail(
        FirefoxCommand.FxAStatus,
        {
          signedInUser: email,
        }
      );
      await page.goto(
        `${
          target.contentServerUrl
        }?force_auth&automatedBrowser=true&${query.toString()}`
      );
      await login.respondToWebChannelMessage(eventDetailStatus);
      await login.checkWebChannelMessage('fxaccounts:fxa_status');
      expect(await login.getPrefilledEmail()).toContain(syncEmail);
    });
  });

  test.describe('Firefox desktop user info handshake', () => {
    test.use({
      emailOptions: [{ prefix: SYNC_EMAIL_PREFIX, password: PASSWORD }],
    });
    test('Sync - no user signed into browser, user signed in locally', async ({
      emails,
      target,
      syncBrowserPages: { login, page },
    }) => {
      const [syncEmail] = emails;
      await target.authClient.signUp(syncEmail, PASSWORD, {
        lang: 'en',
        preVerified: true,
      });
      const query = new URLSearchParams({
        forceUA: uaStrings['desktop_firefox_71'],
      });
      await page.goto(
        `${target.contentServerUrl}?automatedBrowser=true&${query.toString()}`
      );
      await login.fillOutEmailFirstSignIn(syncEmail, PASSWORD);
      expect(await login.isUserLoggedIn()).toBe(true);
      await page.goto(
        `${
          target.contentServerUrl
        }?context=fx_desktop_v3&service=sync&automatedBrowser=true&${query.toString()}`
      );
      expect(await login.getPrefilledEmail()).toContain(syncEmail);
    });

    test('Non-Sync settings page - no user signed into browser, user signed in locally', async ({
      emails,
      target,
      syncBrowserPages: { login, page, settings },
    }) => {
      const [syncEmail] = emails;
      await target.authClient.signUp(syncEmail, PASSWORD, {
        lang: 'en',
        preVerified: 'true',
      });
      const query = new URLSearchParams({
        forceUA: uaStrings['desktop_firefox_71'],
      });
      await page.goto(
        `${target.contentServerUrl}?automatedBrowser=true&${query.toString()}`
      );
      await login.fillOutEmailFirstSignIn(syncEmail, PASSWORD);
      expect(await login.isUserLoggedIn()).toBe(true);

      await settings.goto();
      await expect(settings.primaryEmail.status).toHaveText(syncEmail);
    });
  });
});
