/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { EmailHeader, EmailType } from '../../lib/email';
import { expect, test } from '../../lib/fixtures/standard';

test.describe('severity-2 #smoke', () => {
  test.describe('signin', () => {
    test('signin verified with incorrect password, click `forgot password?`', async ({
      target,
      page,
      pages: { resetPassword, signin },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();

      await page.goto(target.contentServerUrl);
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm('incorrect password');

      // Verify the error
      await expect(page.getByText('Incorrect password')).toBeVisible();

      //Click forgot password link
      await signin.forgotPasswordLink.click();

      //Verify reset password header
      await expect(resetPassword.resetPasswordHeading).toBeVisible();
    });

    test('signin with email with leading/trailing whitespace on the email', async ({
      target,
      page,
      pages: { settings, signin },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();

      const emailWithleadingSpace = '   ' + credentials.email;
      await page.goto(target.contentServerUrl);
      await signin.fillOutEmailFirstForm(emailWithleadingSpace);
      await signin.fillOutPasswordForm(credentials.password);

      await expect(settings.settingsHeading).toBeVisible();

      // Need to clear the cache to get the new email
      await signin.clearCache();

      await page.goto(target.contentServerUrl);
      const emailWithTrailingSpace = credentials.email + '  ';
      await signin.fillOutEmailFirstForm(emailWithTrailingSpace);
      await signin.fillOutPasswordForm(credentials.password);

      // Verify the header after login
      await expect(settings.settingsHeading).toBeVisible();
    });

    test('signin verified with password that incorrectly has leading whitespace', async ({
      target,
      page,
      pages: { signin },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();

      await page.goto(target.contentServerUrl);
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(' ' + credentials.password);

      // Verify the error
      await expect(page.getByText('Incorrect password')).toBeVisible();
    });

    test('login as an existing user', async ({
      target,
      page,
      pages: { settings, signin },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      await page.goto(target.contentServerUrl);
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);
      await page.waitForURL(/settings/);
      //Verify logged in on Settings page
      await expect(settings.settingsHeading).toBeVisible();

      // Sign out
      await settings.signOut();
      // Login as existing user
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      // Verify the header after login
      await expect(settings.settingsHeading).toBeVisible();
    });

    test('unverified signin redirects to confirm email', async ({
      target,
      syncBrowserPages: { confirmSignupCode, page, settings, signin },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUpSync({
        lang: 'en',
        preVerified: 'false',
      });

      await page.goto(target.contentServerUrl);
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);
      await expect(page).toHaveURL(/confirm_signup_code/);
      await expect(confirmSignupCode.heading).toBeVisible();

      // Both backbone and react send out a login verification email
      // on signin with password for an unverified account
      const code = await target.emailClient.getVerifyLoginCode(
        credentials.email
      );
      await confirmSignupCode.fillOutCodeForm(code);

      // Verify logged in on Settings page
      await expect(settings.settingsHeading).toBeVisible();
    });

    test('forced signin confirmation sends exactly one verifyLoginCode email', async ({
      target,
      pages: { page, settings, signin, signinTokenCode },
      testAccountTracker,
    }) => {
      test.skip(
        target.name !== 'local',
        'depends on SIGNIN_CONFIRMATION_FORCE_EMAIL_REGEX, which only matches sync*@restmail.net locally'
      );
      // A "dormant" account: the primary email is verified, but the auth-server
      // forces sign-in confirmation, so the session is created unverified and
      // signin lands on /signin_token_code. The `sync` prefix is what matches
      // the forced-confirmation regex.
      const credentials = await testAccountTracker.signUpSync();
      await target.emailClient.clear(credentials.email);

      await page.goto(target.contentServerUrl);
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);
      await expect(page).toHaveURL(/signin_token_code/);

      // Read the code from the header rather than using `getVerifyLoginCode`,
      // which clears the whole inbox and would destroy the evidence this test
      // exists to count.
      const code = await target.emailClient.waitForEmail(
        credentials.email,
        EmailType.verifyLoginCode,
        EmailHeader.signinCode
      );
      await signinTokenCode.fillOutCodeForm(code);
      await expect(settings.settingsHeading).toBeVisible();

      // `newDeviceLogin` is sent by /session/verify_code, strictly after both
      // possible senders of the code email and through the same mailer. Waiting
      // for it is a causal barrier rather than an arbitrary sleep: once it
      // arrives, any duplicate has had at least as long to arrive.
      await target.emailClient.waitForEmail(
        credentials.email,
        EmailType.newDeviceLogin
      );

      expect(
        await target.emailClient.countEmailsByType(
          credentials.email,
          EmailType.verifyLoginCode
        ),
        'signin should send one confirmation code email, not one per sender (FXA-14109)'
      ).toBe(1);
    });

    test('unverified signin keeps the server-sent verifyLoginCode email', async ({
      target,
      syncBrowserPages: { confirmSignupCode, page, signin },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUpSync({
        lang: 'en',
        preVerified: 'false',
      });
      await target.emailClient.clear(credentials.email);

      await page.goto(target.contentServerUrl);
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);
      await expect(page).toHaveURL(/confirm_signup_code/);
      await expect(confirmSignupCode.heading).toBeVisible();

      // Barrier: the client's `/session/resend_code` sends `verifyShortCode` on
      // this path regardless of the flag, so it arrives whether or not the
      // server-sent email was silenced. Waiting on it means a missing
      // `verifyLoginCode` surfaces as the count assertion below rather than as
      // an opaque EmailTimeout.
      await target.emailClient.waitForEmail(
        credentials.email,
        EmailType.verifyShortCode,
        EmailHeader.shortCode
      );

      // The unverified-account path must keep its server-sent `verifyLoginCode`.
      // `sendSigninVerificationEmail` is deliberately scoped to the unverified-
      // *session* path; widening it to the shared `sendVerifyLoginCodeEmail`
      // helper silences this email, leaving the user with only the
      // `verifyShortCode` above — a different template (FXA-14109).
      expect(
        await target.emailClient.countEmailsByType(
          credentials.email,
          EmailType.verifyLoginCode
        ),
        'the signup path must keep its server-sent verifyLoginCode email'
      ).toBe(1);
    });

    test('servicesWithEmailVerification RP gets exactly one verifyLoginCode email', async ({
      target,
      pages: { page, signin, signinTokenCode },
      testAccountTracker,
    }) => {
      test.skip(
        target.name !== 'local',
        'depends on SIGNIN_CONFIRMATION_FORCE_EMAIL_REGEX, which only matches sync*@restmail.net locally'
      );
      // `32aaeb6f1c21316a` is in `servicesWithEmailVerification`, the config list
      // that makes the auth-server send the code even for RP flows that would
      // otherwise skip the code screen. That combination — server would send,
      // front-end must also route to the code screen — is the case most at risk
      // of ending up with zero emails if the two sides disagree (FXA-14109).
      const credentials = await testAccountTracker.signUpSync();
      await target.emailClient.clear(credentials.email);

      const params = new URLSearchParams({
        client_id: '32aaeb6f1c21316a',
        redirect_uri: 'http://localhost:3035/api/auth/callback/fxa',
        scope: 'https://identity.mozilla.com/account/subscriptions',
        response_type: 'code',
        state: 'fakestate',
        code_challenge_method: 'S256',
        code_challenge: '2oc_C4v1qHeefWAGu5LI5oDG1oX4FV_Itc148D8_oQI',
      });
      await page.goto(`${target.contentServerUrl}/authorization?${params}`);
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);
      await expect(page).toHaveURL(/signin_token_code/);

      const code = await target.emailClient.waitForEmail(
        credentials.email,
        EmailType.verifyLoginCode,
        EmailHeader.signinCode
      );
      await signinTokenCode.fillOutCodeForm(code);

      // Deliberately no assertion on where the browser lands — the RP redirect
      // target may not be running locally. Verification completes server-side
      // when the code is submitted, so newDeviceLogin still sends and remains a
      // valid barrier.
      await target.emailClient.waitForEmail(
        credentials.email,
        EmailType.newDeviceLogin
      );

      expect(
        await target.emailClient.countEmailsByType(
          credentials.email,
          EmailType.verifyLoginCode
        ),
        'an RP in servicesWithEmailVerification should get exactly one code email'
      ).toBe(1);
    });

    test('with bounced email', async ({
      target,
      syncBrowserPages: { page, signin },
      testAccountTracker,
    }) => {
      test.fixme(
        true,
        'TODO in FXA-9880, will need email bounce mocking for React signin testing'
      );
      const credentials = await testAccountTracker.signUpSync();

      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email&`
      );
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      // Verify the header after login
      await expect(page).toHaveURL(/signin_token_code/);
      await target.authClient.accountDestroy(
        credentials.email,
        credentials.password,
        {},
        credentials.sessionToken
      );
      // in react, there is no polling on the page to check for bounces
      // redirects to /signin_bounced only when an error is returned
      // bounce error requires a bounce response from the server
      await page.waitForURL(/signin_bounced/);

      // Verify sign in bounced header
      await expect(signin.signinBouncedHeading).toBeVisible();

      await signin.signinBouncedCreateAccountButton.click();

      // Verify user redirected to login page
      // in backbone, user currently redirected to /signup
      await expect(signin.emailTextbox).toBeVisible();
      await expect(signin.emailTextbox).toHaveValue('');
    });
  });
});
