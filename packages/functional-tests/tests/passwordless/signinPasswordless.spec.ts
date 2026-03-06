/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';
import { getTotpCode } from '../../lib/totp';

test.describe('severity-1 #smoke', () => {
  test.describe('Passwordless authentication', () => {
    test.describe('Happy path - Non-Sync RPs', () => {
      test('passwordless signup - new account', async ({
        target,
        pages: { page, signin, relier, signinPasswordlessCode },
        testAccountTracker,
      }) => {
        // Generate email with 'passwordless' prefix for readability
        const { email } =
          testAccountTracker.generatePasswordlessAccountDetails();

        await relier.goto('force_passwordless=true');
        await relier.clickEmailFirst();
        await signin.fillOutEmailFirstForm(email);

        // Should redirect to passwordless code page
        await expect(page).toHaveURL(/signin_passwordless_code/);
        await expect(signinPasswordlessCode.heading).toBeVisible();

        // Get OTP code from email
        const code = await target.emailClient.getPasswordlessSignupCode(email);
        await signinPasswordlessCode.fillOutCodeForm(code);

        // Should complete OAuth and redirect to RP
        expect(await relier.isLoggedIn()).toBe(true);
      });

      test('passwordless signin - existing passwordless account', async ({
        target,
        pages: { page, signin, relier, signinPasswordlessCode },
        testAccountTracker,
      }) => {
        // Create passwordless account via API first
        const { email } = await testAccountTracker.signUpPasswordless();

        // Clear any cached sessions
        await signin.clearCache();

        // Now sign in via UI
        await relier.goto('force_passwordless=true');
        await relier.clickEmailFirst();
        await signin.fillOutEmailFirstForm(email);

        // Should go to passwordless code page (not password page)
        await expect(page).toHaveURL(/signin_passwordless_code/);
        await expect(signinPasswordlessCode.heading).toBeVisible();

        const code = await target.emailClient.getPasswordlessSigninCode(email);
        await signinPasswordlessCode.fillOutCodeForm(code);

        expect(await relier.isLoggedIn()).toBe(true);
      });

      test('passwordless code resend', async ({
        target,
        pages: { page, signin, relier, signinPasswordlessCode },
        testAccountTracker,
      }) => {
        const { email } =
          testAccountTracker.generatePasswordlessAccountDetails();

        await relier.goto('force_passwordless=true');
        await relier.clickEmailFirst();
        await signin.fillOutEmailFirstForm(email);

        await expect(page).toHaveURL(/signin_passwordless_code/);

        // Wait a moment before clicking resend to avoid rate limiting
        await page.waitForTimeout(1000);

        // Click resend code button
        await signinPasswordlessCode.resendCodeButton.click();

        // Should show success banner
        await expect(signinPasswordlessCode.resendSuccessBanner).toBeVisible();

        // Get the new OTP code from email (newest email will be the resent code)
        const code = await target.emailClient.getPasswordlessSignupCode(email);
        await signinPasswordlessCode.fillOutCodeForm(code);

        expect(await relier.isLoggedIn()).toBe(true);
      });
    });

    test.describe('Error cases', () => {
      test('passwordless - invalid code', async ({
        target,
        pages: { page, signin, relier, signinPasswordlessCode },
        testAccountTracker,
      }) => {
        const { email } =
          testAccountTracker.generatePasswordlessAccountDetails();

        await relier.goto('force_passwordless=true');
        await relier.clickEmailFirst();
        await signin.fillOutEmailFirstForm(email);

        await expect(page).toHaveURL(/signin_passwordless_code/);

        // Enter an invalid 8-digit code
        await signinPasswordlessCode.fillOutCodeForm('12345678');

        // Should show error message (tooltip or error text)
        await expect(
          page.getByTestId('tooltip').or(page.getByText(/invalid|incorrect/i))
        ).toBeVisible();
      });

      test('passwordless - account with password redirects to password flow', async ({
        pages: { page, signin, relier },
        testAccountTracker,
      }) => {
        // Create a regular account with password
        const credentials = await testAccountTracker.signUp();

        await relier.goto();
        await relier.clickEmailFirst();
        await signin.fillOutEmailFirstForm(credentials.email);

        // Should redirect to password form, not passwordless
        await expect(signin.passwordFormHeading).toBeVisible();
        await expect(page).not.toHaveURL(/signin_passwordless_code/);
      });

      test('passwordless - account with 2FA proceeds to TOTP verification', async ({
        target,
        pages: { page, signin, relier, signinPasswordlessCode, signinTotpCode },
        testAccountTracker,
      }) => {
        // Passwordless users with 2FA should be able to sign in via OTP,
        // then be prompted for their TOTP code (not told to use a password).
        //
        // Flow: enter email → OTP code → TOTP code → logged in

        // Create passwordless account via API - get session token for TOTP setup
        const { email, sessionToken } =
          await testAccountTracker.signUpPasswordless();
        const account = testAccountTracker.accounts.find(
          (a) => a.email === email
        );
        const password = account?.password || '';

        // Set up TOTP via API using the passwordless session token
        const { secret } = await target.authClient.createTotpToken(
          sessionToken,
          {}
        );

        // Verify TOTP setup with a generated code
        const totpCode = await getTotpCode(secret);
        await target.authClient.verifyTotpSetupCode(sessionToken, totpCode);
        await target.authClient.completeTotpSetup(sessionToken);

        // Store secret and sessionToken in account for cleanup
        if (account) {
          (account as any).secret = secret;
          (account as any).sessionToken = sessionToken;
        }

        // Clear browser cache
        await signin.clearCache();

        // Now try passwordless flow via UI
        await relier.goto('force_passwordless=true');
        await relier.clickEmailFirst();
        await signin.fillOutEmailFirstForm(email);

        // Should redirect to passwordless code page
        await expect(page).toHaveURL(/signin_passwordless_code/);

        // Get OTP code and enter it
        const passwordlessCode =
          await target.emailClient.getPasswordlessSigninCode(email);
        await signinPasswordlessCode.fillOutCodeForm(passwordlessCode);

        // Should redirect to TOTP code entry page (not password signin)
        await expect(page).toHaveURL(/signin_totp_code/);

        // Enter the TOTP code
        const newTotpCode = await getTotpCode(secret);
        await signinTotpCode.fillOutCodeForm(newTotpCode);

        // Should complete OAuth and redirect to RP
        expect(await relier.isLoggedIn()).toBe(true);

        // Cleanup: Set password so testAccountTracker can sign in and destroy
        // Re-authenticate to get a fresh session since the old one may be stale
        await target.authClient.passwordlessSendCode(email, {
          clientId: 'dcdb5ae7add825d2',
        });
        const cleanupCode =
          await target.emailClient.getPasswordlessSigninCode(email);
        const cleanupResult =
          await target.authClient.passwordlessConfirmCode(
            email,
            cleanupCode,
            { clientId: 'dcdb5ae7add825d2' }
          );
        // Elevate to AAL2 for password creation
        const cleanupTotpCode = await getTotpCode(secret);
        await target.authClient.verifyTotpCode(
          cleanupResult.sessionToken,
          cleanupTotpCode
        );
        await target.authClient.createPassword(
          cleanupResult.sessionToken,
          email,
          password
        );

        // Mark account as no longer passwordless
        if (account) {
          (account as any).isPasswordless = false;
        }
      });
    });
  });
});

test.describe('severity-2', () => {
  test.describe('Passwordless authentication - Sync flows', () => {
    // Note: New Sync users are excluded from passwordless flow.
    // They go through traditional password-first signup.
    // Only existing passwordless accounts can use OTP → SetPassword for Sync.

    test('passwordless signin - Sync with existing passwordless account', async ({
      target,
      syncBrowserPages: {
        page,
        signin,
        signinPasswordlessCode,
        connectAnotherDevice,
      },
      testAccountTracker,
    }) => {
      test.fixme(true, 'to be unskipped as part of FXA-13017');
      // Create passwordless account via API first (no password)
      const { email } = await testAccountTracker.signUpPasswordless();
      const password = (testAccountTracker.accounts[0] as any).password;

      // Navigate to Sync signin
      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email&force_passwordless=true`
      );
      await signin.fillOutEmailFirstForm(email);

      // Should go to passwordless code page
      await expect(page).toHaveURL(/signin_passwordless_code/);

      const code = await target.emailClient.getPasswordlessSigninCode(email);
      await signinPasswordlessCode.fillOutCodeForm(code);

      // For Sync with existing passwordless account (no password),
      // should redirect to set password page
      await expect(page).toHaveURL(/set_password/);
      await expect(
        page.getByRole('heading', { name: 'Create password to sync' })
      ).toBeVisible();

      // Complete password creation for Sync
      await page.getByLabel('Password', { exact: true }).fill(password);
      await page.getByLabel('Repeat password').fill(password);
      await page.getByRole('button', { name: 'Start syncing' }).click();

      // Should show Sync connected page or pair page
      await expect(
        connectAnotherDevice.fxaConnected.or(
          page.getByText(/connected|syncing|pair/i)
        )
      ).toBeVisible({
        timeout: 30000,
      });
    });
  });
});

