/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getTotpCode } from '../../lib/totp';
import { expect, test } from '../../lib/fixtures/standard';

/**
 * Auth state machine — OAuth web (relying-party) sign-in E2E.
 *
 * Flag delivery: relier.goto('authStateMachine=true') puts authStateMachine=true
 * in window.location.search on the 123done page. When the user clicks "Email first",
 * 123done's authenticate() reads all current query params and forwards them to
 * /api/email_first?authStateMachine=true. The server spreads req.query into the OAuth
 * params it sends to the FxA authorization_endpoint, so authStateMachine=true lands on
 * the FxA /oauth/... signin URL.
 *
 * For flows that require session confirmation (signin_token_code) we navigate directly
 * to the FxA /authorization endpoint with the scoped-key OAuth params (same client as
 * oauth/signinTokenCode.spec.ts) plus authStateMachine=true, since the standard
 * 123done client does not request keys_jwk and therefore does not force confirmation.
 */

const MACHINE_QUERY = 'authStateMachine=true';

// Same client/params as oauth/signinTokenCode.spec.ts — keys_jwk forces token-code confirmation.
// Passed to relier.goto() so 123done forwards them via ...req.query to the FxA OAuth URL.
const SCOPED_KEY_RELIER_QUERY =
  'client_id=7f368c6886429f19' +
  '&code_challenge=aSOwsmuRBE1ZIVtiW6bzKMaf47kCFl7duD6ZWAXdnJo' +
  '&code_challenge_method=S256' +
  '&keys_jwk=eyJrdHkiOiJFQyIsImtpZCI6Im9DNGFudFBBSFZRX1pmQ09RRUYycTRaQlZYblVNZ2xISGpVRzdtSjZHOEEiLCJjcnYiOiJQLTI1NiIsIngiOiJDeUpUSjVwbUNZb2lQQnVWOTk1UjNvNTFLZVBMaEg1Y3JaQlkwbXNxTDk0IiwieSI6IkJCWDhfcFVZeHpTaldsdXU5MFdPTVZwamIzTlpVRDAyN0xwcC04RW9vckEifQ' +
  '&redirect_uri=https%3A%2F%2Fmozilla.github.io%2Fnotes%2Ffxa%2Fandroid-redirect.html' +
  '&scope=profile%20https%3A%2F%2Fidentity.mozilla.com%2Fapps%2Fnotes' +
  '&authStateMachine=true';

test.describe('auth-machine: OAuth web sign-in', () => {
  test('verified account signs in and is redirected back to the RP', async ({
    pages: { page, signin, relier },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUp();

    await relier.goto(MACHINE_QUERY);
    await relier.clickEmailFirst();

    // Confirm the flag landed on the FxA OAuth signin URL before proceeding.
    await expect(page).toHaveURL(/authStateMachine=true/);

    await signin.fillOutEmailFirstForm(credentials.email);
    await signin.fillOutPasswordForm(credentials.password);

    expect(await relier.isLoggedIn()).toBe(true);
  });

  test('unverified-session account routes to /signin_token_code then back to the redirect URI after code entry', async ({
    target,
    pages: { page, signin, relier, signinTokenCode },
    testAccountTracker,
  }) => {
    // signUpSync creates a sync-prefixed account. When a client requests keys_jwk
    // (scoped keys), the auth server requires session confirmation via token code.
    const credentials = await testAccountTracker.signUpSync();

    // Use relier.goto() with the notes client params + machine flag so 123done forwards
    // them via ...req.query to the FxA OAuth authorization URL (same pattern as
    // oauth/signinTokenCode.spec.ts, but with authStateMachine=true added).
    await relier.goto(SCOPED_KEY_RELIER_QUERY);
    await relier.clickEmailFirst();
    await signin.fillOutEmailFirstForm(credentials.email);
    await signin.fillOutPasswordForm(credentials.password);

    await expect(page).toHaveURL(/signin_token_code/);
    const code = await target.emailClient.getVerifyLoginCode(credentials.email);
    await signinTokenCode.fillOutCodeForm(code);

    // The notes client redirects to github.io — just confirm we left the FxA domain.
    await expect(page).toHaveURL(/notes\/fxa/);
  });

  test('unverified-email account routes to /confirm_signup_code then back to the RP after code entry', async ({
    target,
    pages: { page, signin, relier, confirmSignupCode },
    testAccountTracker,
  }) => {
    // preVerified: 'false' creates an account whose email has not been confirmed.
    const credentials = await testAccountTracker.signUp({
      lang: 'en',
      preVerified: 'false',
    });

    await relier.goto(MACHINE_QUERY);
    await relier.clickEmailFirst();
    await signin.fillOutEmailFirstForm(credentials.email);
    await signin.fillOutPasswordForm(credentials.password);

    await expect(page).toHaveURL(/confirm_signup_code/);
    const code = await target.emailClient.getVerifyLoginCode(credentials.email);
    await confirmSignupCode.fillOutCodeForm(code);

    expect(await relier.isLoggedIn()).toBe(true);
  });

  test('TOTP-enabled account routes to /signin_totp_code then back to the RP after code entry', async ({
    target,
    pages: { page, signin, relier, settings, totp, signinTotpCode },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUp();

    // Sign in to settings via the standard non-OAuth flow and enable TOTP.
    await page.goto(target.contentServerUrl);
    await signin.fillOutEmailFirstForm(credentials.email);
    await signin.fillOutPasswordForm(credentials.password);
    await page.waitForURL(/settings/);
    await expect(settings.settingsHeading).toBeVisible();

    await settings.totp.addButton.click();
    await settings.confirmMfaGuard(credentials.email);
    // Read recovery-phone availability so TOTP setup skips the chooser when it's unavailable.
    const { available: recoveryPhoneAvailable } =
      await target.authClient.recoveryPhoneAvailable(credentials.sessionToken);
    const { secret } = await totp.setUpTwoStepAuthWithQrAndBackupCodesChoice(
      credentials,
      recoveryPhoneAvailable
    );
    await expect(settings.totp.status).toHaveText('Enabled');
    await settings.signOut();

    // Sign in via the OAuth RP with the machine flag on.
    await relier.goto(MACHINE_QUERY);
    await relier.clickEmailFirst();
    await signin.fillOutEmailFirstForm(credentials.email);
    await signin.fillOutPasswordForm(credentials.password);

    await expect(page).toHaveURL(/signin_totp_code/);
    const code = await getTotpCode(secret);
    await signinTotpCode.fillOutCodeForm(code);

    expect(await relier.isLoggedIn()).toBe(true);
  });
});
