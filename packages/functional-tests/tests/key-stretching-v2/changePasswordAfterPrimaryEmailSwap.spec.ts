/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';
import { BaseTarget } from '../../lib/targets/base';
import AuthClient from '../../../fxa-auth-client/lib/client';

/**
 * Regression coverage for v1 password derivation after the account's signup
 * email has been swapped out.
 *
 * v1 key stretching bakes the *signup* email into the PBKDF2 salt, so the
 * stored verifier never changes even when the primary email is reassigned.
 * Clients must therefore derive v1 credentials from the original signup email
 * (`accounts.email`) rather than the current primary. The auth-client fetches
 * it via `GET /session/original-account-email`, and the auth-server validates
 * password-change / reauth against `db.account(uid).email` (uid-based) instead
 * of `db.accountRecord(email)` (email-lookup), which would 404 once the signup
 * email is removed entirely.
 *
 * This test creates a v1 account, moves the primary email twice and then
 * deletes the original signup email so it is neither primary nor secondary,
 * and finally signs in and changes the password through the UI.
 */
test.describe('severity-2 #smoke', () => {
  test('v1 account: change password via UI after the signup email is removed', async ({
    target,
    pages: { page, settings, signin, changePassword },
    testAccountTracker,
  }) => {
    // Reset local customs counts up front; this test issues many auth
    // operations back-to-back and bypasses target.createAccount (which would
    // otherwise reset them). No-op on remote targets.
    await target.clearRateLimits();

    // Explicit v1 client so the account is created with v1 credentials
    // regardless of the AUTH_CLIENT_KEY_STRETCH_VERSION env default.
    const client = target.createAuthClient(1);

    // `generateAccountDetails` registers the account for automatic cleanup and
    // returns the live record; we mutate it at the end so cleanup uses the
    // final primary email and password.
    const account = testAccountTracker.generateAccountDetails();
    const signupEmail = account.email;
    const password = account.password;

    // Two new primaries derived from the signup email via plus-addressing.
    // restmail keys inboxes on the full local part, so each is a distinct inbox.
    const [localPart, domain] = signupEmail.split('@');
    const primaryEmail1 = `${localPart}+1@${domain}`;
    const primaryEmail2 = `${localPart}+2@${domain}`;

    // Create the v1 account (preVerified so the session can drive MFA right away).
    const { sessionToken } = await client.signUp(
      signupEmail,
      password,
      { lang: 'en', preVerified: 'true' },
      target.ciHeader
    );

    // A single `mfa:email` JWT (10 min TTL, reusable) authorizes every email
    // mutation below. The OTP is delivered to the current primary (signupEmail).
    const emailMfaJwt = await getEmailMfaJwt(
      client,
      sessionToken,
      signupEmail,
      target
    );

    await client.recoveryEmailCreate(emailMfaJwt, primaryEmail1, target.ciHeader);
    const code1 = await target.emailClient.getVerifySecondaryCode(primaryEmail1);
    await client.recoveryEmailSecondaryVerifyCode(
      emailMfaJwt,
      primaryEmail1,
      code1,
      target.ciHeader
    );

    await client.recoveryEmailSetPrimaryEmailWithJwt(
      emailMfaJwt,
      primaryEmail1,
      target.ciHeader
    );

    await client.recoveryEmailCreate(emailMfaJwt, primaryEmail2, target.ciHeader);
    const code2 = await target.emailClient.getVerifySecondaryCode(primaryEmail2);
    await client.recoveryEmailSecondaryVerifyCode(
      emailMfaJwt,
      primaryEmail2,
      code2,
      target.ciHeader
    );

    // Make sure the signup email is not the list of recovery emails
    await client.recoveryEmailDestroyWithJwt(emailMfaJwt, signupEmail);

    // The signup email is gone from the `emails` table...
    const recoveryEmails: Array<{ email: string; isPrimary: boolean }> =
      await client.recoveryEmails(sessionToken, target.ciHeader);
    const emailAddresses = recoveryEmails.map((e) => e.email.toLowerCase());

    expect(emailAddresses).toContainEqual(primaryEmail1);
    expect(emailAddresses).toContainEqual(primaryEmail2);
    expect(emailAddresses).not.toContain(signupEmail.toLowerCase());

    // Validate the original email and current primary emails are preserved
    const email = await client.accountEmails(sessionToken, target.ciHeader);
    expect(email.primary.toLowerCase()).toBe(primaryEmail1.toLowerCase());
    expect(email.original.toLowerCase()).toBe(signupEmail.toLowerCase());

    // Validate the account is still a v1 account
    const status = await client.getCredentialStatusV2(email);
    expect(status.currentVersion).toBe('v1');

    // Sign in through the UI with the current primary and the original password.
    // The auth-client derives v1 credentials from the signup femail behind the
    // scenes (server INCORRECT_EMAIL_CASE retry carries originalLoginEmail).
    await page.goto(target.contentServerUrl);
    await signin.fillOutEmailFirstForm(primaryEmail1);
    await signin.fillOutPasswordForm(password);
    await page.waitForURL(/settings/);
    await expect(settings.settingsHeading).toBeVisible();
    await expect(settings.primaryEmail.status).toHaveText(primaryEmail1);
    await expect(settings.secondaryEmail.status).toHaveText(primaryEmail2);

    // Validate the account was upgraded
    const status2 = await client.getCredentialStatusV2(email);
    expect(status2.currentVersion).toBe('v2');

    // Change the password through the UI. This drives passwordChangeWithJWT ->
    // sessionReauth, both of which must derive v1 credentials from the signup
    // email even though it is no longer attached to the account.
    const newPassword = testAccountTracker.generatePassword();
    await settings.password.changeButton.click();
    await settings.confirmMfaGuard(primaryEmail1);
    await changePassword.fillOutChangePassword(password, newPassword);

    await expect(settings.settingsHeading).toBeVisible();
    await expect(settings.alertBar).toHaveText('Password updated');

    // Keep cleanup in sync with the account's final primary and password.
    account.email = primaryEmail1;
    account.originalEmail = signupEmail;
    account.password = newPassword;

    // Confirm the change actually took hold. The old password is rejected and the
    // new password signs in.
    await settings.signOut();
    await signin.fillOutEmailFirstForm(primaryEmail1);
    await signin.fillOutPasswordForm(password);
    await expect(page.getByText('Incorrect password')).toBeVisible();

    await signin.fillOutPasswordForm(newPassword);
    await expect(settings.settingsHeading).toBeVisible();
    await expect(settings.primaryEmail.status).toHaveText(primaryEmail1);
  });
});

/**
 * Requests and verifies an `mfa:email` OTP, returning a JWT that authorizes
 * recovery-email mutations. The OTP is sent to the account's current primary
 * email, supplied via `primaryEmail`.
 */
async function getEmailMfaJwt(
  client: AuthClient,
  sessionToken: string,
  primaryEmail: string,
  target: BaseTarget
): Promise<string> {
  const { status } = await client.mfaRequestOtp(
    sessionToken,
    'email',
    target.ciHeader
  );
  expect(status).toBe('success');

  const code = await target.emailClient.getVerifyAccountChangeCode(
    primaryEmail
  );
  const { accessToken } = await client.mfaOtpVerify(
    sessionToken,
    code,
    'email',
    target.ciHeader
  );
  expect(accessToken).toBeDefined();
  return accessToken;
}

/**
 * Adds `email` as a secondary email and confirms it with the code sent to that
 * address, leaving it verified and ready to be promoted to primary.
 */
async function addVerifiedSecondaryEmail(
  client: AuthClient,
  emailMfaJwt: string,
  email: string,
  target: BaseTarget
): Promise<void> {
  await client.recoveryEmailCreate(emailMfaJwt, email, target.ciHeader);
  const code = await target.emailClient.getVerifySecondaryCode(email);
  await client.recoveryEmailSecondaryVerifyCode(
    emailMfaJwt,
    email,
    code,
    target.ciHeader
  );
}
