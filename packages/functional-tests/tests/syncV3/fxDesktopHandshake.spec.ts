/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect, newPagesForSync } from '../../lib/fixtures/standard';
import { FirefoxCommand, createCustomEventDetail } from '../../lib/channels';

import uaStrings from '../../lib/ua-strings';

const password = 'passwordzxcv';
let syncBrowserPages;
let browserSignedInEmail;
let browserSignedInAccount;

let otherEmail;
let otherAccount;

const ensureUsers = async (page, target, login) => {
  // Ensure browserSignedInAccount
  if (!browserSignedInAccount) {
    browserSignedInEmail = login.createEmail();
    await target.auth.signUp(browserSignedInEmail, password, {
      lang: 'en',
      preVerified: 'true',
    });
    (_browserSignedInAccount) => {
      browserSignedInAccount = _browserSignedInAccount;
      browserSignedInAccount.email = browserSignedInEmail;
      browserSignedInAccount.verified = true;
      login.clearCache();
    };
  }
  // Ensure otherAccount
  if (!otherAccount) {
    otherEmail = login.createEmail();
    await target.auth.signUp(otherEmail, password, {
      lang: 'en',
      preVerified: 'true',
    });
    (_otherAccount) => {
      otherAccount = _otherAccount;
      otherAccount.email = otherEmail;
      otherAccount.verified = true;
    };
  }
};

test.describe.configure({ mode: 'parallel' });

test.describe('Firefox desktop user info handshake', () => {
  test.beforeEach(async ({ target, page }) => {
    test.slow();
    syncBrowserPages = await newPagesForSync(target);
    const { login } = syncBrowserPages;
    await login.clearCache();
    await ensureUsers(page, target, login);
  });

  test.afterEach(async () => {
    await syncBrowserPages.browser?.close();
  });

  test('Non-Sync - user signed into browser, user signed in locally', async ({
    target,
  }) => {
    const { login, page } = syncBrowserPages;
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
    await login.fillOutEmailFirstSignIn(otherEmail, password);
    expect(await login.loginHeader()).toBe(true);

    // Then, sign in the user again, synthesizing the user having signed
    // into Sync after the initial sign in.
    const eventDetailStatusSignIn = createCustomEventDetail(
      FirefoxCommand.FxAStatus,
      {
        signedInUser: browserSignedInAccount,
      }
    );
    await page.goto(
      `${target.contentServerUrl}?/automatedBrowser=true&${query.toString()}`
    );
    await login.respondToWebChannelMessage(eventDetailStatusSignIn);
    await login.checkWebChannelMessage('fxaccounts:fxa_status');

    expect(await login.getPrefilledEmail()).toContain(otherEmail);
    await login.clickSignIn();
    expect(await login.loginHeader()).toBe(true);
  });

  test('Sync - no user signed into browser, no user signed in locally', async ({
    target,
  }) => {
    const { login, page } = syncBrowserPages;
    const query = new URLSearchParams({
      forceUA: uaStrings['desktop_firefox_71'],
    });
    await page.goto(
      `${
        target.contentServerUrl
      }?context=fx_desktop_v3&service=sync&${query.toString()}`
    );
    expect(await login.isEmailHeader()).toBe(true);
    expect(await login.getEmailInput()).toContain('');
  });

  test('Sync - no user signed into browser, user signed in locally', async ({
    target,
  }) => {
    const { login, page } = syncBrowserPages;
    const query = new URLSearchParams({
      forceUA: uaStrings['desktop_firefox_71'],
    });
    await page.goto(
      `${target.contentServerUrl}?automatedBrowser=true&${query.toString()}`
    );
    await login.fillOutEmailFirstSignIn(otherEmail, password);
    expect(await login.loginHeader()).toBe(true);
    await page.goto(
      `${
        target.contentServerUrl
      }?context=fx_desktop_v3&service=sync&automatedBrowser=true&${query.toString()}`
    );
    expect(await login.getPrefilledEmail()).toContain(otherEmail);
  });

  test('Non-Sync - no user signed into browser, no user signed in locally', async ({
    target,
  }) => {
    const { login, page } = syncBrowserPages;
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
  }) => {
    const { login, page } = syncBrowserPages;
    const query = new URLSearchParams({
      forceUA: uaStrings['desktop_firefox_71'],
      email: otherEmail,
    });
    const eventDetailStatus = createCustomEventDetail(
      FirefoxCommand.FxAStatus,
      {
        signedInUser: browserSignedInAccount,
      }
    );
    await page.goto(
      `${
        target.contentServerUrl
      }?force_auth&automatedBrowser=true&context=fx_desktop_v3&service=sync&${query.toString()}`
    );
    await login.respondToWebChannelMessage(eventDetailStatus);
    await login.checkWebChannelMessage('fxaccounts:fxa_status');
    expect(await login.getPrefilledEmail()).toContain(otherEmail);
  });

  test('Non-Sync force_auth page - user signed into browser is different to requested user', async ({
    target,
  }) => {
    const { login, page } = syncBrowserPages;
    const query = new URLSearchParams({
      forceUA: uaStrings['desktop_firefox_71'],
      email: otherEmail,
    });
    const eventDetailStatus = createCustomEventDetail(
      FirefoxCommand.FxAStatus,
      {
        signedInUser: browserSignedInAccount,
      }
    );
    await page.goto(
      `${
        target.contentServerUrl
      }?force_auth&automatedBrowser=true&${query.toString()}`
    );
    await login.respondToWebChannelMessage(eventDetailStatus);
    await login.checkWebChannelMessage('fxaccounts:fxa_status');
    expect(await login.getPrefilledEmail()).toContain(otherEmail);
  });

  test('Sync - user signed into browser, no user signed in locally', async ({
    target,
  }) => {
    const { login, page } = syncBrowserPages;
    const query = new URLSearchParams({
      forceUA: uaStrings['desktop_firefox_71'],
      email: browserSignedInEmail,
    });
    const eventDetailStatus = createCustomEventDetail(
      FirefoxCommand.FxAStatus,
      {
        signedInUser: browserSignedInEmail,
      }
    );
    await page.goto(
      `${
        target.contentServerUrl
      }?context=fx_desktop_v3&service=sync&automatedBrowser=true&${query.toString()}`
    );
    await login.respondToWebChannelMessage(eventDetailStatus);
    await login.checkWebChannelMessage('fxaccounts:fxa_status');
    expect(await login.getPrefilledEmail()).toContain(browserSignedInEmail);
  });

  test('Non-Sync - user signed into browser, no user signed in locally', async ({
    target,
  }) => {
    const { login, page } = syncBrowserPages;
    const query = new URLSearchParams({
      forceUA: uaStrings['desktop_firefox_71'],
      email: browserSignedInEmail,
    });
    const eventDetailStatus = createCustomEventDetail(
      FirefoxCommand.FxAStatus,
      {
        signedInUser: browserSignedInEmail,
      }
    );
    await page.goto(
      `${target.contentServerUrl}?/automatedBrowser=true&${query.toString()}`
    );
    await login.respondToWebChannelMessage(eventDetailStatus);
    await login.checkWebChannelMessage('fxaccounts:fxa_status');
    expect(await login.getPrefilledEmail()).toContain(browserSignedInEmail);
    await login.setPassword(password);
    await login.clickSubmit();
    expect(await login.loginHeader()).toBe(true);
  });

  test('Non-Sync settings page - no user signed into browser, user signed in locally', async ({
    target,
  }) => {
    const { login, page, settings } = syncBrowserPages;
    const query = new URLSearchParams({
      forceUA: uaStrings['desktop_firefox_71'],
    });
    await page.goto(
      `${target.contentServerUrl}?automatedBrowser=true&${query.toString()}`
    );
    await login.fillOutEmailFirstSignIn(otherEmail, password);
    expect(await login.loginHeader()).toBe(true);

    await settings.goto();
    const primaryEmail = await settings.primaryEmail.statusText();
    expect(primaryEmail).toEqual(otherEmail);
  });
});
