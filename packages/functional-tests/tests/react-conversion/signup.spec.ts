/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FirefoxCommand, createCustomEventDetail } from '../../lib/channels';
import { expect, test } from '../../lib/fixtures/standard';

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

test.describe('severity-1 #smoke', () => {
  test.describe('signup react', () => {
    test.beforeEach(async ({ pages: { configPage } }) => {
      // Ensure that the feature flag is enabled
      const config = await configPage.getConfig();
      test.skip(
        config.showReactApp.signUpRoutes !== true,
        'Skip tests if not on React signUpRoutes'
      );
      test.slow();
    });

    test('signup web', async ({
      page,
      pages: { settings, signupReact },
      testAccountTracker,
    }) => {
      const { email, password } =
        testAccountTracker.generateSignupReactAccountDetails();

      await signupReact.goto();

      await signupReact.fillOutEmailForm(email);
      await signupReact.waitForRoot();

      await signupReact.fillOutSignupForm(password, AGE_21);

      await signupReact.fillOutCodeForm(email);

      await expect(page).toHaveURL(/settings/);

      await settings.signOut();
    });

    test('signup oauth', async ({
      page,
      target,
      pages: { relier, signupReact },
      testAccountTracker,
    }) => {
      const { email, password } =
        testAccountTracker.generateSignupReactAccountDetails();

      relier.goto();

      relier.clickEmailFirst();

      // wait for navigation
      await expect(page).toHaveURL(/oauth\//);

      // reload page with React experiment params
      await page.goto(
        `${page.url()}&forceExperiment=generalizedReactApp&forceExperimentGroup=react`
      );

      await signupReact.fillOutEmailForm(email);

      await signupReact.fillOutSignupForm(password, AGE_21);

      await signupReact.fillOutCodeForm(email);

      // expect to be redirected to relier after confirming signup code
      await expect(page).toHaveURL(target.relierUrl);
      expect(await relier.isLoggedIn()).toBe(true);

      await relier.signOut();
    });

    test('signup oauth with missing redirect_uri', async ({
      page,
      target,
      pages: { relier, signupReact },
      testAccountTracker,
    }) => {
      const { email, password } =
        testAccountTracker.generateSignupReactAccountDetails();

      relier.goto();

      relier.clickEmailFirst();

      // wait for navigation, and get search params
      await page.waitForURL(/oauth\//);
      const path = new URL(page.url()).pathname;
      const params = new URL(page.url()).searchParams;
      params.delete('redirect_uri');
      params.append('forceExperiment', 'generalizedReactApp');
      params.append('forceExperimentGroup', 'react');

      // reload email-first page without redirect_uri, but with React experiment params
      await page.goto(`${target.contentServerUrl}${path}?${params.toString()}`);
      // expect the url to no longer contain a redirect uri
      await expect(page).toHaveURL(/^((?!redirect_uri).)*$/);

      await signupReact.fillOutEmailForm(email);

      await signupReact.fillOutSignupForm(password, AGE_21);

      await signupReact.fillOutCodeForm(email);
      // redirectUri should have fallen back to the clientInfo config redirect URI
      // Expect to be redirected to relier
      await page.waitForURL(target.relierUrl);

      expect(await relier.isLoggedIn()).toBe(true);

      await relier.signOut();
    });

    test('signup oauth webchannel - sync mobile or FF desktop 123+', async ({
      syncBrowserPages: { page, login, signupReact },
      testAccountTracker,
    }) => {
      test.fixme(true, 'Fix required as of 2024/03/18 (see FXA-9306).');
      const { email, password } =
        testAccountTracker.generateSignupReactAccountDetails();
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

      await signupReact.fillOutSignupForm(password, AGE_21);

      await signupReact.fillOutCodeForm(email);
      await page.waitForURL(/connect_another_device/);

      await signupReact.checkWebChannelMessage(FirefoxCommand.OAuthLogin);
    });

    test('signup sync desktop v3, verify account', async ({
      syncBrowserPages: { page, signupReact, login },
      testAccountTracker,
    }) => {
      const { email, password } =
        testAccountTracker.generateSignupReactAccountDetails();
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

      await signupReact.fillOutSignupForm(password, AGE_21);

      await login.checkWebChannelMessage(FirefoxCommand.Login);

      await signupReact.fillOutCodeForm(email);
      await page.waitForURL(/connect_another_device/);

      await expect(page.getByText('You’re signed into Firefox')).toBeVisible();
    });
  });
});

test.describe('severity-2 #smoke', () => {
  test.describe('signup react', () => {
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
      pages: { signupReact },
      testAccountTracker,
    }) => {
      const { email, password } =
        testAccountTracker.generateSignupReactAccountDetails();
      await signupReact.goto();

      await signupReact.fillOutEmailForm(email);

      await signupReact.fillOutSignupForm(password, AGE_12);

      await expect(page).toHaveURL(/cannot_create_account/);
      await expect(signupReact.cannotCreateAccountHeading).toBeVisible();
    });

    test('signup via product page and redirect after confirm', async ({
      page,
      target,
      pages: { signupReact, relier, subscribe, settings },
      testAccountTracker,
    }, { project }) => {
      test.skip(
        project.name === 'production',
        'no test products available in prod'
      );
      const { email, password } =
        testAccountTracker.generateSignupReactAccountDetails();

      // Go an RP's subscription page
      await relier.goto();
      await relier.clickSubscribe6Month();

      // wait for navigation
      await expect(page).toHaveURL(/checkout\//);

      // reload page with React experiment params
      await page.goto(
        `${page.url()}&forceExperiment=generalizedReactApp&forceExperimentGroup=react`
      );

      // Click the sign in link
      await subscribe.visitSignIn();

      await signupReact.fillOutEmailForm(email);

      await signupReact.fillOutSignupForm(password, AGE_21);

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
