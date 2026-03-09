/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';
import { syncDesktopOAuthQueryParams } from '../../lib/query-params';
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

    test.describe('Session security', () => {
      test('passwordless + 2FA: unverified session cannot be used for OAuth before TOTP', async ({
        target,
        pages: { page, signin, relier, signinPasswordlessCode },
        testAccountTracker,
      }) => {
        // This test verifies that the session created after OTP verification
        // (but before TOTP verification) cannot be used to obtain an OAuth code.
        // This is critical: without this guard, a user who only completes OTP
        // could bypass 2FA entirely.

        // Create passwordless account with TOTP
        const { email, sessionToken } =
          await testAccountTracker.signUpPasswordless();
        const account: any = testAccountTracker.accounts.find(
          (a) => a.email === email
        );
        const password = account?.password || '';

        const { secret } = await target.authClient.createTotpToken(
          sessionToken,
          {}
        );
        const totpCode = await getTotpCode(secret);
        await target.authClient.verifyTotpSetupCode(sessionToken, totpCode);
        await target.authClient.completeTotpSetup(sessionToken);

        if (account) {
          account.secret = secret;
          account.sessionToken = sessionToken;
        }

        // Use the API directly to get an unverified session token
        // (bypasses browser UI so we can test the session before TOTP)
        await target.authClient.passwordlessSendCode(email, {
          clientId: 'dcdb5ae7add825d2',
        });
        const otpCode =
          await target.emailClient.getPasswordlessSigninCode(email);
        const confirmResult = await target.authClient.passwordlessConfirmCode(
          email,
          otpCode,
          { clientId: 'dcdb5ae7add825d2' }
        );

        // The session should be unverified (TOTP pending)
        expect(confirmResult.verified).toBe(false);
        expect(confirmResult.verificationMethod).toBe('totp-2fa');

        // Attempt OAuth authorization with the unverified session — must be rejected
        try {
          await target.authClient.createOAuthCode(
            confirmResult.sessionToken,
            'dcdb5ae7add825d2',
            'teststate',
            { scope: 'profile' }
          );
          // If we get here, the session was wrongly accepted
          expect(
            true,
            'OAuth should have rejected the unverified session'
          ).toBe(false);
        } catch (err: any) {
          // Expect errno 138 = UNVERIFIED_SESSION
          expect(err.errno).toBe(138);
        }

        // Cleanup: set password so testAccountTracker can destroy the account
        const cleanupTotpCode = await getTotpCode(secret);
        await target.authClient.verifyTotpCode(
          confirmResult.sessionToken,
          cleanupTotpCode
        );
        await target.authClient.createPassword(
          confirmResult.sessionToken,
          email,
          password
        );

        if (account) {
          account.isPasswordless = false;
        }
      });
    });

    test.describe('Session verification state invariants', () => {
      const CLIENT_ID = 'dcdb5ae7add825d2';

      async function getPasswordlessSession(
        target: any,
        email: string,
        isNew: boolean
      ) {
        await target.authClient.passwordlessSendCode(email, {
          clientId: CLIENT_ID,
        });
        const code = isNew
          ? await target.emailClient.getPasswordlessSignupCode(email)
          : await target.emailClient.getPasswordlessSigninCode(email);
        return target.authClient.passwordlessConfirmCode(email, code, {
          clientId: CLIENT_ID,
        });
      }

      async function setupPasswordlessTotpAccount(
        target: any,
        testAccountTracker: any
      ) {
        const { email, sessionToken } =
          await testAccountTracker.signUpPasswordless();
        const account: any = testAccountTracker.accounts.find(
          (a: any) => a.email === email
        );
        const password = account?.password || '';

        const { secret } = await target.authClient.createTotpToken(
          sessionToken,
          {}
        );
        const totpCode = await getTotpCode(secret);
        await target.authClient.verifyTotpSetupCode(sessionToken, totpCode);
        await target.authClient.completeTotpSetup(sessionToken);

        account.secret = secret;
        account.sessionToken = sessionToken;

        return { email, password, sessionToken, secret, account };
      }

      async function cleanupPasswordlessAccount(
        target: any,
        sessionToken: string,
        email: string,
        password: string,
        account: any,
        secret?: string
      ) {
        const totpCode = secret ? await getTotpCode(secret) : null;
        if (totpCode) {
          await target.authClient.verifyTotpCode(sessionToken, totpCode);
        }
        await target.authClient.createPassword(sessionToken, email, password);
        account.isPasswordless = false;
      }

      test.describe('Without TOTP', () => {
        test('new account returns verified session with correct response shape', async ({
          target,
          testAccountTracker,
        }) => {
          const { email, password } =
            testAccountTracker.generatePasswordlessAccountDetails();
          const account: any = testAccountTracker.accounts.find(
            (a) => a.email === email
          );

          const result = await getPasswordlessSession(target, email, true);

          expect(result.verified).toBe(true);
          expect(result.isNewAccount).toBe(true);
          expect(result.verificationMethod).toBeUndefined();

          const status = await target.authClient.sessionStatus(
            result.sessionToken
          );
          expect(status.state).toBe('verified');
          expect(status.details.sessionVerified).toBe(true);

          // Cleanup
          await target.authClient.createPassword(
            result.sessionToken,
            email,
            password
          );
          account.isPasswordless = false;
        });

        test('existing account returns verified session with correct response shape', async ({
          target,
          testAccountTracker,
        }) => {
          const { email } = await testAccountTracker.signUpPasswordless();
          const account: any = testAccountTracker.accounts.find(
            (a) => a.email === email
          );
          const password = account.password || '';

          const result = await getPasswordlessSession(target, email, false);

          expect(result.verified).toBe(true);
          expect(result.isNewAccount).toBe(false);
          expect(result.verificationMethod).toBeUndefined();

          const status = await target.authClient.sessionStatus(
            result.sessionToken
          );
          expect(status.state).toBe('verified');
          expect(status.details.sessionVerified).toBe(true);

          // Cleanup
          await target.authClient.createPassword(
            result.sessionToken,
            email,
            password
          );
          account.isPasswordless = false;
        });

        test('verified session can obtain OAuth code', async ({
          target,
          testAccountTracker,
        }) => {
          const { email } = await testAccountTracker.signUpPasswordless();
          const account: any = testAccountTracker.accounts.find(
            (a) => a.email === email
          );
          const password = account.password || '';

          const result = await getPasswordlessSession(target, email, false);

          const oauthResult = await target.authClient.createOAuthCode(
            result.sessionToken,
            CLIENT_ID,
            'teststate',
            { scope: 'profile' }
          );
          expect(oauthResult).toBeDefined();

          // Cleanup
          await target.authClient.createPassword(
            result.sessionToken,
            email,
            password
          );
          account.isPasswordless = false;
        });

        test('verified session can access verifiedSessionToken-gated routes', async ({
          target,
          testAccountTracker,
        }) => {
          const { email, sessionToken } =
            await testAccountTracker.signUpPasswordless();
          const account: any = testAccountTracker.accounts.find(
            (a) => a.email === email
          );
          const password = account.password || '';

          const events = await target.authClient.securityEvents(sessionToken);
          expect(Array.isArray(events)).toBe(true);

          // Cleanup
          await target.authClient.createPassword(
            sessionToken,
            email,
            password
          );
          account.isPasswordless = false;
        });
      });

      test.describe('With TOTP', () => {
        test('TOTP account returns unverified session with correct response shape', async ({
          target,
          testAccountTracker,
        }) => {
          const { email, password, secret, account } =
            await setupPasswordlessTotpAccount(target, testAccountTracker);

          const result = await getPasswordlessSession(target, email, false);

          expect(result.verified).toBe(false);
          expect(result.isNewAccount).toBe(false);
          expect(result.verificationMethod).toBe('totp-2fa');
          expect(result.verificationReason).toBe('login');

          const status = await target.authClient.sessionStatus(
            result.sessionToken
          );
          expect(status.state).toBe('unverified');
          expect(status.details.sessionVerified).toBe(false);

          // Cleanup
          await cleanupPasswordlessAccount(
            target,
            result.sessionToken,
            email,
            password,
            account,
            secret
          );
        });

        test('unverified session is blocked from verifiedSessionToken routes', async ({
          target,
          testAccountTracker,
        }) => {
          const { email, password, secret, account } =
            await setupPasswordlessTotpAccount(target, testAccountTracker);

          const result = await getPasswordlessSession(target, email, false);

          // securityEvents requires verified session
          try {
            await target.authClient.securityEvents(result.sessionToken);
            expect(true, 'securityEvents should have been rejected').toBe(
              false
            );
          } catch (err: any) {
            expect(err.errno).toBe(138);
          }

          // createPassword requires verified session
          try {
            await target.authClient.createPassword(
              result.sessionToken,
              email,
              password
            );
            expect(true, 'createPassword should have been rejected').toBe(
              false
            );
          } catch (err: any) {
            expect(err.errno).toBe(138);
          }

          // Cleanup
          await cleanupPasswordlessAccount(
            target,
            result.sessionToken,
            email,
            password,
            account,
            secret
          );
        });

        test('unverified session allows non-gated routes', async ({
          target,
          testAccountTracker,
        }) => {
          const { email, password, secret, account } =
            await setupPasswordlessTotpAccount(target, testAccountTracker);

          const result = await getPasswordlessSession(target, email, false);

          // sessionStatus should succeed
          const status = await target.authClient.sessionStatus(
            result.sessionToken
          );
          expect(status).toBeDefined();
          expect(status.uid).toBeDefined();

          // accountProfile should succeed
          const profile = await target.authClient.accountProfile(
            result.sessionToken
          );
          expect(profile).toBeDefined();

          // Cleanup
          await cleanupPasswordlessAccount(
            target,
            result.sessionToken,
            email,
            password,
            account,
            secret
          );
        });

        test('session transitions to verified after TOTP verification', async ({
          target,
          testAccountTracker,
        }) => {
          const { email, password, secret, account } =
            await setupPasswordlessTotpAccount(target, testAccountTracker);

          const result = await getPasswordlessSession(target, email, false);

          // Confirm unverified before TOTP
          const statusBefore = await target.authClient.sessionStatus(
            result.sessionToken
          );
          expect(statusBefore.state).toBe('unverified');
          expect(statusBefore.details.sessionVerified).toBe(false);

          // Verify TOTP
          const totpCode = await getTotpCode(secret);
          await target.authClient.verifyTotpCode(
            result.sessionToken,
            totpCode
          );

          // Confirm verified after TOTP
          const statusAfter = await target.authClient.sessionStatus(
            result.sessionToken
          );
          expect(statusAfter.state).toBe('verified');
          expect(statusAfter.details.sessionVerified).toBe(true);

          // OAuth should now succeed
          const oauthResult = await target.authClient.createOAuthCode(
            result.sessionToken,
            CLIENT_ID,
            'teststate',
            { scope: 'profile' }
          );
          expect(oauthResult).toBeDefined();

          // securityEvents should now succeed
          const events = await target.authClient.securityEvents(
            result.sessionToken
          );
          expect(Array.isArray(events)).toBe(true);

          // Cleanup
          await target.authClient.createPassword(
            result.sessionToken,
            email,
            password
          );
          account.isPasswordless = false;
        });
      });

      test.describe('Password creation gate', () => {
        test('verified non-TOTP session can create password', async ({
          target,
          testAccountTracker,
        }) => {
          const { email } = await testAccountTracker.signUpPasswordless();
          const account: any = testAccountTracker.accounts.find(
            (a) => a.email === email
          );
          const password = account.password || '';

          const result = await getPasswordlessSession(target, email, false);

          // Create password should succeed
          const createResult = await target.authClient.createPassword(
            result.sessionToken,
            email,
            password
          );
          expect(createResult).toBeDefined();

          account.isPasswordless = false;

          // Account now has a password — passwordless send should be rejected
          try {
            await target.authClient.passwordlessSendCode(email, {
              clientId: CLIENT_ID,
            });
            expect(
              true,
              'passwordlessSendCode should have been rejected for password account'
            ).toBe(false);
          } catch (err: any) {
            expect(err.errno).toBeDefined();
          }
        });
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
        const account: any = testAccountTracker.accounts.find(
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
          account.secret = secret;
          account.sessionToken = sessionToken;
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
          account.isPasswordless = false;
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
      syncOAuthBrowserPages: {
        page,
        signin,
        signinPasswordlessCode,
        connectAnotherDevice,
      },
      testAccountTracker,
    }) => {
      // Create passwordless account via API first (no password)
      const { email } = await testAccountTracker.signUpPasswordless();
      const password = (testAccountTracker.accounts[0] as any).password;

      // Navigate to Sync OAuth signin with passwordless enabled
      const params = new URLSearchParams(syncDesktopOAuthQueryParams);
      params.set('force_passwordless', 'true');
      await signin.goto('/authorization', params);
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

