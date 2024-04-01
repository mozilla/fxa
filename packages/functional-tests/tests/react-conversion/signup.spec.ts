/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FirefoxCommand, createCustomEventDetail } from '../../lib/channels';
import { expect, test } from '../../lib/fixtures/standard';
import { PASSWORD } from '../../lib/fixtures/standard';

import {
  syncDesktopV3QueryParams,
  syncMobileOAuthQueryParams,
} from '../../lib/query-params';

const AGE_12 = '12';
const AGE_21 = '21';

const eventDetailLinkAccount = createCustomEventDetail(
  FirefoxCommand.LinkAccount,
  {
    ok: true,
  }
);

test.beforeEach(async ({ pages: { configPage } }) => {
  test.slow();
  // Ensure that the feature flag is enabled
  const config = await configPage.getConfig();
  if (config.showReactApp.signUpRoutes !== true) {
    test.skip(true, 'Skip tests if not on React signUpRoutes');
  }
});

test.describe('severity-1 #smoke', () => {
  test.describe('signup react', () => {
    test.use({ emailOptions: [{ prefix: 'signup_react{id}', PASSWORD }] });
    test('signup web', async ({
      page,
      pages: { settings, signupReact },
      emails,
    }) => {
      const [email] = emails;
      await signupReact.goto();

      await signupReact.fillOutEmailForm(email);
      await signupReact.waitForRoot();

      await signupReact.fillOutSignupForm(PASSWORD, AGE_21);

      await signupReact.fillOutCodeForm(email);

      await expect(page).toHaveURL(/settings/);

      await settings.signOut();
    });

    test('signup oauth', async ({
      emails,
      page,
      target,
      pages: { relier, signupReact },
    }) => {
      const [email] = emails;
      relier.goto();

      relier.clickEmailFirst();

      // wait for navigation, and get search params
      await page.waitForURL(/oauth\//);
      const params = new URL(page.url()).searchParams;

      // reload email-first page with React experiment params
      await signupReact.goto('/', params);

      await signupReact.fillOutEmailForm(email);

      await signupReact.fillOutSignupForm(PASSWORD, AGE_21);

      await signupReact.fillOutCodeForm(email);

      // expect to be redirected to relier after confirming signup code
      await expect(page).toHaveURL(target.relierUrl);
      expect(await relier.isLoggedIn()).toBe(true);

      await relier.signOut();
    });

    test('signup oauth with missing redirect_uri', async ({
      emails,
      page,
      target,
      pages: { relier, signupReact },
    }) => {
      const [email] = emails;
      relier.goto();

      relier.clickEmailFirst();

      // wait for navigation, and get search params
      await page.waitForURL(/oauth\//);
      const params = new URL(page.url()).searchParams;
      params.delete('redirect_uri');

      // reload email-first page without redirect_uri, but with React experiment params
      await signupReact.goto('/', params);

      await signupReact.fillOutEmailForm(email);

      await signupReact.fillOutSignupForm(PASSWORD, AGE_21);

      await signupReact.fillOutCodeForm(email);
      // redirectUri should have fallen back to the clientInfo config redirect URI
      // Expect to be redirected to relier
      await page.waitForURL(target.relierUrl);

      expect(await relier.isLoggedIn()).toBe(true);

      await relier.signOut();
    });

    test('signup oauth webchannel - sync mobile or FF desktop 123+', async ({
      emails,
      syncBrowserPages: { page, login, signupReact },
    }) => {
      const [email] = emails;
      test.fixme(true, 'Fix required as of 2024/03/18 (see FXA-9306).');
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

      await signupReact.goto('/authorization', syncMobileOAuthQueryParams);

      await signupReact.fillOutEmailForm(email);
      await page.waitForURL(/signup/, { waitUntil: 'load' });
      await signupReact.waitForRoot();

      await expect(signupReact.signupFormHeading).toBeVisible();

      await signupReact.sendWebChannelMessage(customEventDetail);

      // Only engines provided via web channel for Sync mobile are displayed
      await expect(login.CWTSEngineHeader).toBeVisible();
      await expect(login.CWTSEngineBookmarks).toBeVisible();
      await expect(login.CWTSEngineHistory).toBeVisible();
      await expect(login.CWTSEnginePasswords).toBeHidden();
      await expect(login.CWTSEngineAddons).toBeHidden();
      await expect(login.CWTSEngineOpenTabs).toBeHidden();
      await expect(login.CWTSEnginePreferences).toBeHidden();
      await expect(login.CWTSEngineCreditCards).toBeHidden();
      await expect(login.CWTSEngineAddresses).toBeHidden();

      await signupReact.fillOutSignupForm(PASSWORD, AGE_21);

      await signupReact.fillOutCodeForm(email);
      await page.waitForURL(/connect_another_device/);

      await signupReact.checkWebChannelMessage(FirefoxCommand.OAuthLogin);
    });

    test('signup sync desktop v3, verify account', async ({
      syncBrowserPages: { page, signupReact, login },
      emails,
    }) => {
      const [email] = emails;
      test.fixme(true, 'Fix required as of 2024/03/18 (see FXA-9306).');
      await signupReact.goto('/', syncDesktopV3QueryParams);

      await signupReact.fillOutEmailForm(email);
      await page.waitForURL(/signup/, { waitUntil: 'load' });
      await signupReact.waitForRoot();

      // Wait for page to render
      await expect(page.getByText('Set your password')).toBeVisible();

      await signupReact.respondToWebChannelMessage(eventDetailLinkAccount);
      await signupReact.checkWebChannelMessage(FirefoxCommand.FxAStatus);
      await login.checkWebChannelMessage(FirefoxCommand.LinkAccount);

      // Sync desktop v3 includes "default" engines plus the ones provided via web channel
      // See sync-engines.ts comments
      await expect(login.CWTSEngineHeader).toBeVisible();
      await expect(login.CWTSEngineBookmarks).toBeVisible();
      await expect(login.CWTSEngineHistory).toBeVisible();
      await expect(login.CWTSEnginePasswords).toBeVisible();
      await expect(login.CWTSEngineAddons).toBeVisible();
      await expect(login.CWTSEngineOpenTabs).toBeVisible();
      await expect(login.CWTSEnginePreferences).toBeVisible();
      await expect(login.CWTSEngineCreditCards).toBeVisible();
      await expect(login.CWTSEngineAddresses).toBeHidden();

      await signupReact.fillOutSignupForm(PASSWORD, AGE_21);

      await login.checkWebChannelMessage(FirefoxCommand.Login);

      await signupReact.fillOutCodeForm(email);
      await page.waitForURL(/connect_another_device/);

      await expect(page.getByText('You’re signed into Firefox')).toBeVisible();
    });
  });
});

test.describe('severity-2 #smoke', () => {
  test.describe('signup react', () => {
    test.use({ emailOptions: [{ prefix: 'signup_react{id}', PASSWORD }] });
    test('signup invalid email', async ({ page, pages: { signupReact } }) => {
      const invalidEmail = 'invalid';

      await signupReact.goto();

      await signupReact.fillOutEmailForm(invalidEmail);

      await expect(
        page.getByText('Valid email required', { exact: true })
      ).toBeVisible();
    });

    test('empty email', async ({ page, pages: { signupReact } }) => {
      const emptyEmail = '';

      await signupReact.goto();

      await signupReact.fillOutEmailForm(emptyEmail);

      await expect(
        page.getByText('Valid email required', { exact: true })
      ).toBeVisible();
    });

    test('coppa is too young', async ({
      page,
      pages: { login, signupReact },
      emails,
    }) => {
      const [email] = emails;
      await signupReact.goto();

      await signupReact.fillOutEmailForm(email);

      await signupReact.fillOutSignupForm(PASSWORD, AGE_12);

      await expect(page).toHaveURL(/cannot_create_account/);
      await expect(signupReact.cannotCreateAccountHeading).toBeVisible();
    });

    test('signup via product page and redirect after confirm', async ({
      page,
      target,
      pages: { signupReact, relier, subscribe, settings },
      emails,
    }, { project }) => {
      const [email] = emails;
      test.skip(
        project.name === 'production',
        'no test products available in prod'
      );
      // Go an RP's subscription page
      await relier.goto();
      await relier.clickSubscribe6Month();

      // Click the sign in link
      await subscribe.visitSignIn();

      // Preserve search params but add in react experiment parameters
      const searchParams = new URL(page.url()).searchParams;
      await signupReact.goto('/', searchParams);

      await signupReact.fillOutEmailForm(email);

      await signupReact.fillOutSignupForm(PASSWORD, AGE_21);

      await signupReact.fillOutCodeForm(email);
      /*
       * We must `waitUntil: 'load'` due to redirects that occur here. Note,
       * React signup for SubPlat has one additional redirect compared to Backbone.
       * See notes in https://github.com/mozilla/fxa/pull/16078#issue-1993842384,
       * we can look at this in the sunset content-server epic.
       *
       * React signup staging goes from:
       * 1) [stage]/confirm_signup_code -> 2) [payments-stage]/products ->
       * 3) [stage]/subscriptions/products -> 4) [payments-stage]/products
       * Backbone signup staging goes from: 1) [stage]/confirm_signup_code ->
       * 2) [stage]/subscriptions/products -> 3) [payments-stage]/products
       * */
      await page.waitForURL(`${target.paymentsServerUrl}/**`, {
        waitUntil: 'load',
      });

      await expect(subscribe.setupSubscriptionFormHeading).toBeVisible();
      await expect(settings.avatarIcon).toBeVisible();
    });
  });
});
