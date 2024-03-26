/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { symbolName } from 'typescript';
import { FirefoxCommand, createCustomEventDetail } from '../../lib/channels';
import { expect, test } from '../../lib/fixtures/standard';
import uaStrings from '../../lib/ua-strings';
const password = 'passwordzxcv';

test.describe.configure({ mode: 'parallel' });

test.describe('severity-2 #smoke', () => {
  test.describe('Firefox desktop user info handshake', () => {
    test.beforeEach(async ({ email, target, syncBrowserPages: { login } }) => {
      test.slow();
      await target.auth.signUp(email, password, {
        lang: 'en',
        preVerified: 'true',
      });
      await target.auth.signUp(email, password, {
        lang: 'en',
        preVerified: 'true',
      });
    });

    test('Non-Sync - user signed into browser, user signed in locally', async ({
      target,
      email,
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
      await login.fillOutEmailFirstSignIn(email, password);
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

      expect(await login.getPrefilledEmail()).toContain(email);
      await login.clickSignIn();
      expect(await login.isUserLoggedIn()).toBe(true);
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

    test('Sync - no user signed into browser, user signed in locally', async ({
      target,
      email,
      syncBrowserPages: { login, page },
    }) => {
      const query = new URLSearchParams({
        forceUA: uaStrings['desktop_firefox_71'],
      });
      await page.goto(
        `${target.contentServerUrl}?automatedBrowser=true&${query.toString()}`
      );
      await login.fillOutEmailFirstSignIn(email, password);
      expect(await login.isUserLoggedIn()).toBe(true);
      await page.goto(
        `${
          target.contentServerUrl
        }?context=fx_desktop_v3&service=sync&automatedBrowser=true&${query.toString()}`
      );
      expect(await login.getPrefilledEmail()).toContain(email);
    });

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

    test('Sync force_auth page - user signed into browser is different to requested user', async ({
      target,
      email,
      syncBrowserPages: { login, page },
    }) => {
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
        }?force_auth&automatedBrowser=true&context=fx_desktop_v3&service=sync&${query.toString()}`
      );
      await login.respondToWebChannelMessage(eventDetailStatus);
      await login.checkWebChannelMessage('fxaccounts:fxa_status');
      expect(await login.getPrefilledEmail()).toContain(email);
    });

    test('Non-Sync force_auth page - user signed into browser is different to requested user', async ({
      target,
      email,
      syncBrowserPages: { login, page },
    }) => {
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
        }?force_auth&automatedBrowser=true&${query.toString()}`
      );
      await login.respondToWebChannelMessage(eventDetailStatus);
      await login.checkWebChannelMessage('fxaccounts:fxa_status');
      expect(await login.getPrefilledEmail()).toContain(email);
    });

    test('Sync - user signed into browser, no user signed in locally', async ({
      target,
      email,
      syncBrowserPages: { login, page },
    }) => {
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
      target,
      email,
      syncBrowserPages: { login, page },
    }) => {
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
      await login.setPassword(password);
      await login.clickSubmit();
      expect(await login.isUserLoggedIn()).toBe(true);
    });

    test('Non-Sync settings page - no user signed into browser, user signed in locally', async ({
      target,
      email,
      syncBrowserPages: { login, page, settings },
    }) => {
      const query = new URLSearchParams({
        forceUA: uaStrings['desktop_firefox_71'],
      });
      await page.goto(
        `${target.contentServerUrl}?automatedBrowser=true&${query.toString()}`
      );
      await login.fillOutEmailFirstSignIn(email, password);
      expect(await login.isUserLoggedIn()).toBe(true);

      await settings.goto();
      const primaryEmail = await settings.primaryEmail.statusText();
      expect(primaryEmail).toEqual(email);
    });
  });
});
