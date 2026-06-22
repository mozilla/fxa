/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';
import { FirefoxCommand } from '../../lib/channels';
import {
  syncDesktopOAuthQueryParams,
  syncDesktopV3QueryParams,
} from '../../lib/query-params';

/**
 * Auth state machine — sign-up E2E.
 *
 * Covers the ConfirmSignupCode routing categories that the machine handles:
 *   - web-settings: plain web signup → /settings
 *   - sync-desktop-v3: fx_desktop_v3 signup → signup_confirmed_sync + web-channel
 *   - oauth-resolve: OAuth RP signup → RP redirect
 *   - oauth-native: oauth_webchannel_v1 signup → signup_confirmed_sync + fxaOAuthLogin web-channel
 *   - (oauth-totp-setup: inline_totp_setup — fixme, env hang)
 *
 * Flag delivery per integration type:
 *   - plain web: `?authStateMachine=true` on contentServerUrl
 *   - sync fx_desktop_v3: `&authStateMachine=true` appended to sync URL
 *   - oauth-web (relier): relier.goto('authStateMachine=true') forwards via 123done → FxA
 *   - oauth-native: params.set('authStateMachine','true') on syncDesktopOAuthQueryParams
 */

const MACHINE_QUERY = 'authStateMachine=true';

test.describe('auth-machine: signup', () => {
  test('plain web signup → confirm code → /settings', async ({
    target,
    page,
    pages: { signup, confirmSignupCode, settings },
    testAccountTracker,
  }) => {
    const { email, password } =
      testAccountTracker.generateSignupAccountDetails();

    await page.goto(
      `${target.contentServerUrl}?force_passwordless=false&forceExperiment=generalizedReactApp&forceExperimentGroup=react&authStateMachine=true`
    );

    await signup.fillOutEmailForm(email);
    await signup.fillOutSignupForm(password);

    await expect(page).toHaveURL(/confirm_signup_code/);
    await expect(page).toHaveURL(/authStateMachine=true/);

    const code = await target.emailClient.getVerifyShortCode(email);
    await confirmSignupCode.fillOutCodeForm(code);

    await expect(settings.settingsHeading).toBeVisible();
  });

  test('sync desktop v3 signup → confirm code → signup_confirmed_sync + web-channel Login message', async ({
    target,
    syncBrowserPages: { page, signup, confirmSignupCode, signupConfirmedSync },
    testAccountTracker,
  }) => {
    const { email, password } =
      testAccountTracker.generateSignupAccountDetails();

    // Build the sync URL with authStateMachine flag appended
    const syncParams = new URLSearchParams(syncDesktopV3QueryParams);
    syncParams.set('authStateMachine', 'true');

    await signup.listenToWebChannelMessages();
    await signup.goto('/', syncParams);

    await signup.fillOutEmailForm(email);

    await expect(signup.signupFormHeading).toBeVisible();

    // Sync signup form requires password confirmation
    await signup.fillOutSyncSignupForm(password);

    await expect(page).toHaveURL(/confirm_signup_code/);

    const code = await target.emailClient.getVerifyShortCode(email);
    await confirmSignupCode.fillOutCodeForm(code);

    await expect(page).toHaveURL(/signup_confirmed_sync/);
    await expect(signupConfirmedSync.bannerConfirmed).toBeVisible();

    await signup.checkWebChannelMessage(FirefoxCommand.Login);
  });

  test('OAuth web signup via relier → confirm code → RP redirect', async ({
    target,
    page,
    pages: { signup, confirmSignupCode, relier },
    testAccountTracker,
  }) => {
    const { email, password } =
      testAccountTracker.generateSignupAccountDetails();

    // relier.goto with the machine flag; 123done forwards all query params to FxA
    await relier.goto(`${MACHINE_QUERY}&force_passwordless=false`);
    await relier.clickEmailFirst();

    // Confirm the flag landed on the FxA OAuth URL
    await expect(page).toHaveURL(/authStateMachine=true/);

    await signup.fillOutEmailForm(email);
    await signup.fillOutSignupForm(password);

    await expect(page).toHaveURL(/confirm_signup_code/);

    const code = await target.emailClient.getVerifyShortCode(email);
    await confirmSignupCode.fillOutCodeForm(code);

    // After confirmation the machine resolves the OAuth flow and redirects back to the RP
    await page.waitForURL(`${target.relierUrl}/**`);
    expect(await relier.isLoggedIn()).toBe(true);
  });

  test('OAuth native (oauth_webchannel_v1) signup → confirm code → signup_confirmed_sync + fxaOAuthLogin web-channel', async ({
    target,
    syncOAuthBrowserPages: {
      page,
      signup,
      confirmSignupCode,
      signupConfirmedSync,
    },
    testAccountTracker,
  }) => {
    const { email, password } =
      testAccountTracker.generateSignupAccountDetails();

    const nativeParams = new URLSearchParams(syncDesktopOAuthQueryParams);
    nativeParams.set('authStateMachine', 'true');

    await signup.listenToWebChannelMessages();
    await signup.goto('/authorization', nativeParams);

    await expect(page).toHaveURL(/authStateMachine=true/);

    await signup.fillOutEmailForm(email);

    await expect(signup.signupFormHeading).toBeVisible();

    // Native Sync signup requires password + confirm password
    await signup.fillOutSyncSignupForm(password);

    await expect(page).toHaveURL(/confirm_signup_code/);

    const code = await target.emailClient.getVerifyShortCode(email);
    await confirmSignupCode.fillOutCodeForm(code);

    await expect(page).toHaveURL(/signup_confirmed_sync/);
    await expect(signupConfirmedSync.bannerConfirmed).toBeVisible();

    await signup.checkWebChannelMessage(FirefoxCommand.OAuthLogin);
    await signup.checkWebChannelMessage(FirefoxCommand.Login);
  });

  test('OAuth signup requiring TOTP → inline_totp_setup', async ({
    target,
    page,
    pages: { signup, confirmSignupCode, relier },
    testAccountTracker,
  }) => {
    const { email, password } =
      testAccountTracker.generateSignupAccountDetails();

    await relier.goto(`${MACHINE_QUERY}&force_passwordless=false`);
    await relier.clickRequire2FA();

    await signup.fillOutEmailForm(email);
    await signup.fillOutSignupForm(password);

    await expect(page).toHaveURL(/confirm_signup_code/);

    const code = await target.emailClient.getVerifyShortCode(email);
    await confirmSignupCode.fillOutCodeForm(code);

    await expect(page).toHaveURL(/inline_totp_setup/);
  });
});
