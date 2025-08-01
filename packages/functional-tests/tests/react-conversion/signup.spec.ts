/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FirefoxCommand, LinkAccountResponse } from '../../lib/channels';
import { expect, test } from '../../lib/fixtures/standard';
import { syncDesktopV3QueryParams } from '../../lib/query-params';

const eventDetailLinkAccount: LinkAccountResponse = {
  id: 'account_updates',
  message: {
    command: FirefoxCommand.LinkAccount,
    data: {
      ok: true,
    },
  },
};

test.describe('severity-1 #smoke', () => {
  test.describe('signup react', () => {
    test('signup web', async ({
      target,
      page,
      pages: { confirmSignupCode, settings, signup },
      testAccountTracker,
    }) => {
      const { email, password } =
        testAccountTracker.generateSignupAccountDetails();

      await signup.goto();
      await signup.fillOutEmailForm(email);
      await signup.fillOutSignupForm(password);

      await expect(page).toHaveURL(/confirm_signup_code/);

      const code = await target.emailClient.getVerifyShortCode(email);
      await confirmSignupCode.fillOutCodeForm(code);

      await expect(page).toHaveURL(/settings/);

      await settings.signOut();
    });

    test('signup sync desktop v3, verify account', async ({
      target,
      syncBrowserPages: {
        confirmSignupCode,
        page,
        signup,
        signupConfirmedSync,
      },
      testAccountTracker,
    }) => {
      const { email, password } =
        testAccountTracker.generateSignupAccountDetails();
      await signup.goto('/', syncDesktopV3QueryParams);

      await signup.fillOutEmailForm(email);

      await expect(signup.signupFormHeading).toBeVisible();

      await signup.respondToWebChannelMessage(eventDetailLinkAccount);

      await signup.checkWebChannelMessage(FirefoxCommand.FxAStatus);
      await signup.checkWebChannelMessage(FirefoxCommand.LinkAccount);

      // Sync desktop v3 includes "default" engines plus the ones provided via web channel
      // See sync-engines.ts comments
      await signup.fillOutSyncSignupForm(password);

      await signup.checkWebChannelMessage(FirefoxCommand.Login);
      await expect(page).toHaveURL(/confirm_signup_code/);

      const code = await target.emailClient.getVerifyShortCode(email);
      await confirmSignupCode.fillOutCodeForm(code);

      await expect(page).toHaveURL(/signup_confirmed_sync/);
      await expect(signupConfirmedSync.bannerConfirmed).toBeVisible();
    });
  });
});

test.describe('severity-2 #smoke', () => {
  test.describe('signup react', () => {
    test('signup invalid email', async ({ page, pages: { signup } }) => {
      const invalidEmail = 'invalid';

      await signup.goto();

      await signup.fillOutEmailForm(invalidEmail);

      await expect(
        page.getByText('Valid email required', { exact: true })
      ).toBeVisible();
    });

    test('empty email', async ({ page, pages: { signup } }) => {
      const emptyEmail = '';

      await signup.goto();

      await signup.fillOutEmailForm(emptyEmail);

      await expect(
        page.getByText('Valid email required', { exact: true })
      ).toBeVisible();
    });

    test('signup via product subscription page and redirect after confirm', async ({
      page,
      target,
      pages: { confirmSignupCode, relier, settings, signup, subscribe },
      testAccountTracker,
    }, { project }) => {
      test.skip(
        project.name === 'production',
        'no test products available in prod'
      );
      const { email, password } =
        testAccountTracker.generateSignupAccountDetails();

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
      await subscribe.signinLink.click();
      await signup.fillOutEmailForm(email);
      await signup.fillOutSignupForm(password);
      await expect(page).toHaveURL(/confirm_signup_code/);
      const code = await target.emailClient.getVerifyShortCode(email);
      await confirmSignupCode.fillOutCodeForm(code);
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
      await page.waitForURL(`${target.paymentsServerUrl}/**`);

      await expect(subscribe.setupSubscriptionFormHeading).toBeVisible();
      await expect(settings.avatarIcon).toBeVisible();
    });
  });
});
