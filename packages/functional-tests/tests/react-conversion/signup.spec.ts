/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FirefoxCommand, createCustomEventDetail } from '../../lib/channels';
import { expect, test } from '../../lib/fixtures/standard';
import {
  syncDesktopV3QueryParams,
  syncMobileOAuthQueryParams,
} from '../../lib/query-params';

const PASSWORD = 'passwordzxcv';

const eventDetailLinkAccount = createCustomEventDetail(
  FirefoxCommand.LinkAccount,
  {
    ok: true,
  }
);

test.beforeEach(async ({ pages: { configPage, login } }) => {
  test.slow();
  // Ensure that the feature flag is enabled
  const config = await configPage.getConfig();
  test.skip(
    config.showReactApp.signUpRoutes !== true,
    'Skip tests if not on React signUpRoutes'
  );
});

test.describe('severity-1 #smoke', () => {
  test.describe('signup react', () => {
    test('signup web', async ({
      page,
      target,
      pages: { settings, signupReact },
      emails,
    }) => {
      const [email] = emails;
      await signupReact.goto();
      await expect(page.getByText('Enter your email')).toBeVisible();

      await signupReact.fillOutEmailFirst(email);
      await page.waitForSelector('#root');
      await signupReact.fillOutSignupForm(PASSWORD);
      await signupReact.fillOutCodeForm(email);

      // Verify logged into settings page
      await page.waitForURL(/settings/);
      await settings.signOut();
    });

    test('signup oauth', async ({
      page,
      target,
      pages: { relier, signupReact },
      emails,
    }) => {
      const [email] = emails;
      relier.goto();
      relier.clickEmailFirst();

      // wait for navigation, and get search params
      await page.waitForURL(/oauth\//);
      const params = new URL(page.url()).searchParams;

      // reload email-first page with React experiment params
      await signupReact.goToEmailFirstAndCreateAccount(params, email, PASSWORD);

      // expect to be redirected to relier after confirming signup code
      await page.waitForURL(target.relierUrl);
      expect(await relier.isLoggedIn()).toBe(true);
      await relier.signOut();
    });

    test('signup oauth with missing redirect_uri', async ({
      page,
      target,
      pages: { relier, signupReact },
      emails,
    }) => {
      const [email] = emails;

      relier.goto();
      relier.clickEmailFirst();

      // wait for navigation, and get search params
      await page.waitForURL(/oauth\//);
      const params = new URL(page.url()).searchParams;
      params.delete('redirect_uri');

      // reload email-first page without redirect_uri, but with React experiment params
      await signupReact.goToEmailFirstAndCreateAccount(params, email, PASSWORD);

      // redirectUri should have fallen back to the clientInfo config redirect URI
      // Expect to be redirected to relier
      await page.waitForURL(target.relierUrl);
      expect(await relier.isLoggedIn()).toBe(true);
      await relier.signOut();
    });

    test('signup oauth webchannel - sync mobile or FF desktop 123+', async ({
      syncBrowserPages: { page, signupReact, login },
      emails,
    }) => {
      const [email] = emails;
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

      await signupReact.fillOutEmailFirst(email);
      await page.waitForURL(/signup/, {
        waitUntil: 'load',
      });
      await page.waitForSelector('#root');
      // We must wait for the page to render before sending a web channel message
      expect(page.getByText('Set your password')).toBeVisible();

      await signupReact.sendWebChannelMessage(customEventDetail);
      await login.waitForCWTSEngineHeader();
      await login.isCWTSEngineBookmarks();
      await login.isCWTSEngineHistory();
      // Only engines provided via web channel for Sync mobile are displayed
      expect(await login.isCWTSEngineCreditCards()).toBe(false);

      await signupReact.fillOutSignupForm(PASSWORD);
      await signupReact.fillOutCodeForm(email);
      await page.waitForURL(/connect_another_device/);
      await signupReact.checkWebChannelMessage(FirefoxCommand.OAuthLogin);
    });

    test('signup sync desktop v3, verify account', async ({
      syncBrowserPages: { page, signupReact, login },
      emails,
    }) => {
      test.slow();
      const [email] = emails;

      await signupReact.goto('/', syncDesktopV3QueryParams);
      await signupReact.fillOutEmailFirst(email);
      await page.waitForURL(/signup/);
      await page.waitForSelector('#root');
      // Wait for page to render
      expect(page.getByText('Set your password')).toBeVisible();

      await signupReact.respondToWebChannelMessage(eventDetailLinkAccount);
      await signupReact.checkWebChannelMessage(FirefoxCommand.FxAStatus);
      await login.checkWebChannelMessage(FirefoxCommand.LinkAccount);

      // Sync desktop v3 includes "default" engines plus the ones provided via web channel
      // See sync-engines.ts comments
      await login.isCWTSEngineBookmarks();
      await login.isCWTSEngineHistory();
      await login.isCWTSEnginePasswords();
      await login.isCWTSEngineTabs();
      await login.isCWTSEnginePrefs();
      await login.isCWTSEngineCreditCards();
      expect(await login.isCWTSEngineAddresses()).toBe(false);

      await signupReact.fillOutSignupForm(PASSWORD);
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
      const email = 'invalid';
      await signupReact.goto();
      await signupReact.fillOutEmailFirst(email);
      await expect(
        page.getByText('Valid email required', { exact: true })
      ).toBeVisible();
    });

    test('empty email', async ({ page, pages: { signupReact } }) => {
      await signupReact.goto();
      await signupReact.fillOutEmailFirst('');
      await expect(
        page.getByText('Valid email required', { exact: true })
      ).toBeVisible();
    });

    test('coppa is too young', async ({
      page,
      pages: { signupReact },
      emails,
    }) => {
      const [email] = emails;

      await signupReact.goto();
      await signupReact.fillOutEmailFirst(email);
      await signupReact.fillOutSignupForm(PASSWORD, '12');
      await page.waitForURL(/cannot_create_account/);
    });

    test('Visits the privacy policy links save information upon return', async ({
      page,
      pages: { signupReact },
      emails,
    }) => {
      const [email] = emails;

      await signupReact.goto();
      await signupReact.fillOutEmailFirst(email);
      await signupReact.fillOutSignupForm(PASSWORD, '21', false);
      await signupReact.visitPrivacyPolicyLink();
      await page.waitForURL(/legal\/privacy/);
      await page.goBack();

      // TBD: https://mozilla-hub.atlassian.net/browse/FXA-8797
      // expect(await signupReact.getEmail().inputValue()).toEqual(email);
      // expect(await signupReact.getPassword().inputValue).toEqual(PASSWORD);
      // expect(await signupReact.getPasswordConfirm().inputValue).toEqual(PASSWORD);
      // expect(await signupReact.getAge().inputValue).toEqual('21');
    });

    test('Visits the terms of service links save information upon return', async ({
      page,
      pages: { signupReact },
      emails,
    }) => {
      const [email] = emails;
      await signupReact.goto();
      await signupReact.fillOutEmailFirst(email);
      await signupReact.fillOutSignupForm(PASSWORD, '21', false);
      await signupReact.visitTermsOfServiceLink();
      await page.waitForURL(/legal\/terms/);
      await page.goBack();

      // TBD: https://mozilla-hub.atlassian.net/browse/FXA-8794
      // expect(await signupReact.getEmail().inputValue()).toEqual(email);
      // expect(await signupReact.getPassword().inputValue()).toEqual(PASSWORD);
      // expect(await signupReact.getPasswordConfirm().inputValue()).toEqual(PASSWORD);
      // expect(await signupReact.getAge().inputValue()).toEqual('21');
    });

    test('Checks that form prefill information is cleared after sign up -> sign out', async ({
      page,
      pages: { signupReact, settings },
      emails,
    }) => {
      const [email] = emails;
      await signupReact.goto();
      await signupReact.fillOutEmailFirst(email);
      await signupReact.fillOutSignupForm(PASSWORD);
      await signupReact.fillOutCodeForm(email);
      await page.waitForURL(/settings/);
      await settings.signOut();
      await signupReact.goto();

      // TBD: No pre fill support currently. Do we even need this?
      await expect(signupReact.getEmail()).toHaveValue('');
      await signupReact.fillOutEmailFirst('new-' + email);
      await expect(signupReact.getPassword()).toHaveValue('');
      await expect(signupReact.getPasswordConfirm()).toHaveValue('');
      await expect(signupReact.getAge()).toHaveValue('');
    });

    test('signup via product page and redirect after confirm', async ({
      page,
      target,
      pages: { signupReact, relier, subscribe, login },
      emails,
    }, { project }) => {
      test.skip(
        project.name === 'production',
        'no test products available in prod'
      );
      const [email] = emails;

      // Make sure user is logged out
      await login.clearCache();

      // Go an RP's subscription page
      await relier.goto();
      await relier.clickSubscribe6Month();

      // Click the sign in link
      await subscribe.visitSignIn();

      // Preserve search params but add in react experiment parameters
      const searchParams = new URL(page.url()).searchParams;
      await signupReact.goto('/', searchParams);
      await signupReact.fillOutEmailFirst(email);
      await signupReact.fillOutSignupForm(PASSWORD);
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
      const loadingSpinner = page.locator('[data-testid="loading-spinner"]');
      await loadingSpinner.waitFor({ state: 'hidden' });
      await expect(page.getByTestId('avatar')).toBeVisible();
    });
  });
});
