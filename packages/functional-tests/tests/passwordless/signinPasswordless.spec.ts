/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';
import {
  relayDesktopOAuthQueryParams,
  syncDesktopOAuthQueryParams,
} from '../../lib/query-params';
import { getTotpCode } from '../../lib/totp';

test.describe('severity-1 #smoke', () => {
  test.describe('Passwordless authentication', () => {
    test.describe('Happy path - Non-Sync RPs', () => {
      test('passwordless signup - new account', async ({
        target,
        pages: { page, signin, relier, signinPasswordlessCode },
        testAccountTracker,
        gleanEventsHelper,
      }) => {
        // Generate email with 'passwordless' prefix for readability
        const { email } =
          testAccountTracker.generatePasswordlessAccountDetails();

        await relier.goto('force_passwordless=true');
        await relier.clickEmailFirst();
        await signin.fillOutEmailFirstForm(email);

        // Should redirect to passwordless code page
        await page.waitForURL(/signin_passwordless_code/);
        await expect(signinPasswordlessCode.heading).toBeVisible();

        // Click "Use a different account" to verify change email glean event,
        // then re-enter same email to complete the flow
        await signinPasswordlessCode.useDifferentAccountLink.click();
        await expect(page).not.toHaveURL(/signin_passwordless_code/);
        await target.emailClient.clear(email);
        await signin.fillOutEmailFirstForm(email);
        await page.waitForURL(/signin_passwordless_code/);

        // Get the fresh OTP code (previous codes were cleared)
        const code = await target.emailClient.getPasswordlessSignupCode(email);
        await signinPasswordlessCode.fillOutCodeForm(code);

        // Should complete OAuth and redirect to RP
        expect(await relier.isLoggedIn()).toBe(true);

        await gleanEventsHelper.waitForEvent('reg_otp_submit_success');
        gleanEventsHelper.assertEventOrder([
          'email_first_view',
          'reg_otp_view',
          'reg_otp_change_email',
          'reg_otp_submit',
          'reg_otp_submit_success',
        ]);
      });

      test('passwordless signin - existing passwordless account', async ({
        target,
        pages: { page, signin, relier, signinPasswordlessCode },
        testAccountTracker,
        gleanEventsHelper,
      }) => {
        // Create passwordless account via API first
        const { email } = await testAccountTracker.signUpPasswordless();

        // Clear any cached sessions
        await signin.clearCache();

        // Sign in via UI WITHOUT force_passwordless — existing passwordless
        // accounts are always redirected to OTP regardless of feature flag
        await relier.goto();
        await relier.clickEmailFirst();
        await signin.fillOutEmailFirstForm(email);

        // Should go to passwordless code page (not password page)
        await page.waitForURL(/signin_passwordless_code/);
        await expect(signinPasswordlessCode.heading).toBeVisible();

        const code = await target.emailClient.getPasswordlessSigninCode(email);
        await signinPasswordlessCode.fillOutCodeForm(code);

        expect(await relier.isLoggedIn()).toBe(true);

        await gleanEventsHelper.waitForEvent('login_otp_submit_success');
        gleanEventsHelper.assertEventOrder([
          'email_first_view',
          'login_otp_view',
          'login_otp_submit',
          'login_otp_submit_success',
        ]);
      });

      test('passwordless code resend', async ({
        target,
        pages: { page, signin, relier, signinPasswordlessCode },
        testAccountTracker,
        gleanEventsHelper,
      }) => {
        const { email } =
          testAccountTracker.generatePasswordlessAccountDetails();

        await relier.goto('force_passwordless=true');
        await relier.clickEmailFirst();
        await signin.fillOutEmailFirstForm(email);

        await page.waitForURL(/signin_passwordless_code/);

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

        await gleanEventsHelper.waitForEvent('reg_otp_submit_success');
        gleanEventsHelper.assertEventOrder([
          'reg_otp_view',
          'reg_otp_email_confirmation_resend_code',
          'reg_otp_submit',
          'reg_otp_submit_success',
        ]);
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
      const SUPPORTED_SERVICE = 'smoketests';

      async function getPasswordlessSession(
        target: any,
        email: string,
        isNew: boolean
      ) {
        await target.authClient.passwordlessSendCode(email, {
          clientId: CLIENT_ID,
          service: SUPPORTED_SERVICE,
        });
        const code = isNew
          ? await target.emailClient.getPasswordlessSignupCode(email)
          : await target.emailClient.getPasswordlessSigninCode(email);
        return target.authClient.passwordlessConfirmCode(email, code, {
          clientId: CLIENT_ID,
          service: SUPPORTED_SERVICE,
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
          await target.authClient.createPassword(sessionToken, email, password);
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
          await target.authClient.verifyTotpCode(result.sessionToken, totpCode);

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

    test.describe('Repeated sign-in does not trigger rate limit', () => {
      test('navigating back and re-entering email does not cause too many requests error', async ({
        target,
        pages: { page, signin, relier, signinPasswordlessCode },
        testAccountTracker,
      }) => {
        const { email } =
          testAccountTracker.generatePasswordlessAccountDetails();

        // First attempt: enter the passwordless flow (sends code #1)
        await relier.goto('force_passwordless=true');
        await relier.clickEmailFirst();
        await signin.fillOutEmailFirstForm(email);

        await page.waitForURL(/signin_passwordless_code/);
        await expect(signinPasswordlessCode.heading).toBeVisible();

        // Second attempt: go back to the RP and re-enter email (sends code #2)
        await relier.goto('force_passwordless=true');
        await relier.clickEmailFirst();
        await signin.fillOutEmailFirstForm(email);

        // Should reach the code page without a rate limit error
        await page.waitForURL(/signin_passwordless_code/);
        await expect(signinPasswordlessCode.heading).toBeVisible();

        // Verify no error banner is displayed (e.g. "too many requests")
        await expect(signinPasswordlessCode.errorBanner).not.toBeVisible();

        // Complete the flow to confirm it works end-to-end
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
        gleanEventsHelper,
      }) => {
        const { email } =
          testAccountTracker.generatePasswordlessAccountDetails();

        await relier.goto('force_passwordless=true');
        await relier.clickEmailFirst();
        await signin.fillOutEmailFirstForm(email);

        await page.waitForURL(/signin_passwordless_code/);

        // Enter an invalid 8-digit code
        await signinPasswordlessCode.fillOutCodeForm('12345678');

        // Should show error message (tooltip or error text)
        await expect(
          page.getByTestId('tooltip').or(page.getByText(/invalid|incorrect/i))
        ).toBeVisible();

        await gleanEventsHelper.waitForEvent('reg_otp_submit_frontend_error');
        gleanEventsHelper.assertEventOrder([
          'reg_otp_view',
          'reg_otp_submit',
          'reg_otp_submit_frontend_error',
        ]);

        const errorPings = gleanEventsHelper.getEventsByName(
          'reg_otp_submit_frontend_error'
        );
        expect(errorPings.length).toBeGreaterThan(0);
        expect(errorPings[0].extras.reason).toBe('invalid');
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
        gleanEventsHelper,
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

        // Sign in via UI WITHOUT force_passwordless — existing passwordless
        // accounts (even with TOTP) are always redirected to OTP
        await relier.goto();
        await relier.clickEmailFirst();
        await signin.fillOutEmailFirstForm(email);

        // Should redirect to passwordless code page
        await page.waitForURL(/signin_passwordless_code/);

        // Get OTP code and enter it
        const passwordlessCode =
          await target.emailClient.getPasswordlessSigninCode(email);
        await signinPasswordlessCode.fillOutCodeForm(passwordlessCode);

        // Should redirect to TOTP code entry page (not password signin)
        await page.waitForURL(/signin_totp_code/);

        // Enter the TOTP code
        const newTotpCode = await getTotpCode(secret);
        await signinTotpCode.fillOutCodeForm(newTotpCode);

        // Should complete OAuth and redirect to RP
        expect(await relier.isLoggedIn()).toBe(true);

        await gleanEventsHelper.waitForEvent('login_totp_code_success_view');
        gleanEventsHelper.assertEventOrder([
          'email_first_view',
          'login_otp_view',
          'login_otp_submit',
          'login_otp_submit_success',
          'login_totp_form_view',
          'login_totp_code_submit',
          'login_totp_code_success_view',
        ]);

        // Cleanup: Set password so testAccountTracker can sign in and destroy
        // Re-authenticate to get a fresh session since the old one may be stale
        await target.authClient.passwordlessSendCode(email, {
          clientId: 'dcdb5ae7add825d2',
        });
        const cleanupCode =
          await target.emailClient.getPasswordlessSigninCode(email);
        const cleanupResult = await target.authClient.passwordlessConfirmCode(
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
  test.describe('Passwordless authentication - Cached login', () => {
    test('passwordless account with cached session navigating to content server sees cached signin', async ({
      target,
      pages: { page, signin, relier, signinPasswordlessCode },
      testAccountTracker,
    }) => {
      const { email } = testAccountTracker.generatePasswordlessAccountDetails();

      await relier.goto('force_passwordless=true');
      await relier.clickEmailFirst();
      await signin.fillOutEmailFirstForm(email);

      await page.waitForURL(/signin_passwordless_code/);

      const code = await target.emailClient.getPasswordlessSignupCode(email);
      await signinPasswordlessCode.fillOutCodeForm(code);

      expect(await relier.isLoggedIn()).toBe(true);

      // Navigate to / — cached session should show signin, not OTP
      await page.goto(target.contentServerUrl);

      await expect(page).not.toHaveURL(/signin_passwordless_code/);
      await expect(signin.cachedSigninHeading).toBeVisible();
    });

    test('passwordless account with cached session navigating to /signin sees cached signin page', async ({
      target,
      pages: { page, signin, relier, signinPasswordlessCode },
      testAccountTracker,
    }) => {
      const { email } = testAccountTracker.generatePasswordlessAccountDetails();

      await relier.goto('force_passwordless=true');
      await relier.clickEmailFirst();
      await signin.fillOutEmailFirstForm(email);

      await expect(page).toHaveURL(/signin_passwordless_code/);
      const code = await target.emailClient.getPasswordlessSignupCode(email);
      await signinPasswordlessCode.fillOutCodeForm(code);

      expect(await relier.isLoggedIn()).toBe(true);

      // Navigate to / — cached session should show signin, not OTP
      await page.goto(target.contentServerUrl);

      await expect(page).not.toHaveURL(/signin_passwordless_code/);
      await expect(signin.cachedSigninHeading).toBeVisible();

      // Navigate to /signin directly — same behavior
      await page.goto(`${target.contentServerUrl}/signin?email=${email}`);
      await expect(page).not.toHaveURL(/signin_passwordless_code/);
      await expect(signin.cachedSigninHeading).toBeVisible();
    });

    test('passwordless signup via Settings then navigating to / shows cached signin (not OTP)', async ({
      target,
      pages: { page, signin, signinPasswordlessCode, settings },
      testAccountTracker,
    }) => {
      const { email } = testAccountTracker.generatePasswordlessAccountDetails();

      await page.goto(`${target.contentServerUrl}/?force_passwordless=true`);
      await signin.fillOutEmailFirstForm(email);

      await expect(page).toHaveURL(/signin_passwordless_code/);

      const code = await target.emailClient.getPasswordlessSignupCode(email);
      await signinPasswordlessCode.fillOutCodeForm(code);

      await expect(settings.settingsHeading).toBeVisible();

      // Navigate to / — cached session should show signin, not OTP
      await page.goto(target.contentServerUrl);
      await expect(page).not.toHaveURL(/signin_passwordless_code/);
      await expect(signin.cachedSigninHeading).toBeVisible();
    });
  });

  test.describe('Passwordless authentication - Edge cases', () => {
    test('direct /signin URL with email param redirects passwordless account to OTP', async ({
      target,
      pages: { page, signin, signinPasswordlessCode, settings },
      testAccountTracker,
    }) => {
      // Existing passwordless account accessed via direct /signin?email=...
      // should redirect to OTP page without needing force_passwordless flag.
      // The auth server bypasses the client allowlist for existing passwordless
      // accounts, so this works even with the Settings clientId.
      const { email } = await testAccountTracker.signUpPasswordless();

      await signin.clearCache();

      // Direct /signin URL with email query param (no force_passwordless)
      await page.goto(
        `${target.contentServerUrl}/signin?email=${encodeURIComponent(email)}`
      );
      await page.waitForURL(/signin_passwordless_code/);
      await expect(signinPasswordlessCode.heading).toBeVisible();

      // Complete OTP flow — non-OAuth path should land on settings
      const code = await target.emailClient.getPasswordlessSigninCode(email);
      await signinPasswordlessCode.fillOutCodeForm(code);
      await expect(settings.settingsHeading).toBeVisible();
    });

    test('passwordless account with invalidated cached session redirects to passwordless code (not password form)', async ({
      target,
      pages: { page, signin, relier, signinPasswordlessCode },
      testAccountTracker,
    }) => {
      const { email, sessionToken } =
        await testAccountTracker.signUpPasswordless();

      // Destroy session server-side to simulate expiration/revocation
      await target.authClient.sessionDestroy(sessionToken);

      // Navigate WITHOUT force_passwordless — existing passwordless accounts
      // are always redirected to OTP regardless of feature flag
      await relier.goto();
      await relier.clickEmailFirst();
      await signin.fillOutEmailFirstForm(email);

      // Should go to passwordless code page, NOT a password form
      await page.waitForURL(/signin_passwordless_code/);
      await expect(signinPasswordlessCode.heading).toBeVisible();

      const code = await target.emailClient.getPasswordlessSigninCode(email);
      await signinPasswordlessCode.fillOutCodeForm(code);
      expect(await relier.isLoggedIn()).toBe(true);
    });

    test('password creation switches account to password flow; other passwordless accounts unaffected', async ({
      target,
      pages: { page, signin, relier, signinPasswordlessCode },
      testAccountTracker,
    }) => {
      // Create two passwordless accounts — one will get a password, the other stays passwordless
      const { email } = await testAccountTracker.signUpPasswordless();
      const account: any = testAccountTracker.accounts.find(
        (a) => a.email === email
      );
      const password = account?.password || '';
      const { email: otherPasswordlessEmail } =
        await testAccountTracker.signUpPasswordless();

      // Create a password on the first account via API
      await target.authClient.passwordlessSendCode(email, {
        clientId: 'dcdb5ae7add825d2',
      });
      const otpCode = await target.emailClient.getPasswordlessSigninCode(email);
      const result = await target.authClient.passwordlessConfirmCode(
        email,
        otpCode,
        { clientId: 'dcdb5ae7add825d2' }
      );
      await target.authClient.createPassword(
        result.sessionToken,
        email,
        password
      );
      account.isPasswordless = false;

      // First account now has a password — should show password form
      await signin.clearCache();
      await relier.goto('force_passwordless=true');
      await relier.clickEmailFirst();
      await signin.fillOutEmailFirstForm(email);
      await expect(signin.passwordFormHeading).toBeVisible();
      await expect(page).not.toHaveURL(/signin_passwordless_code/);

      // Second account is still passwordless — should get passwordless flow
      await relier.goto('force_passwordless=true');
      await relier.clickEmailFirst();
      await signin.fillOutEmailFirstForm(otherPasswordlessEmail);
      await page.waitForURL(/signin_passwordless_code/);
      await expect(signinPasswordlessCode.heading).toBeVisible();
    });
  });

  test.describe('Passwordless authentication - Sync flows', () => {
    // Note: New Sync users are excluded from passwordless flow.
    // They go through traditional password-first signup.
    // Only existing passwordless accounts can use OTP → SetPassword for Sync.

    test('passwordless signin - Sync with existing passwordless account', async ({
      target,
      syncOAuthBrowserPages: { page, signin, signinPasswordlessCode },
      testAccountTracker,
    }) => {
      // Create passwordless account via API first (no password)
      const { email } = await testAccountTracker.signUpPasswordless();
      const password = (testAccountTracker.accounts[0] as any).password;

      // Navigate to Sync OAuth signin — existing passwordless accounts
      // are redirected to OTP without needing force_passwordless flag
      const params = new URLSearchParams(syncDesktopOAuthQueryParams);
      await signin.goto('/authorization', params);
      await signin.fillOutEmailFirstForm(email);

      // Should go to passwordless code page
      await page.waitForURL(/signin_passwordless_code/);

      const code = await target.emailClient.getPasswordlessSigninCode(email);
      await signinPasswordlessCode.fillOutCodeForm(code);

      // For Sync with existing passwordless account (no password),
      // should redirect to set password page
      await page.waitForURL(/set_password/);
      await expect(
        page.getByRole('heading', { name: 'Create password to sync' })
      ).toBeVisible();

      // Complete password creation for Sync
      await page.getByLabel('Password', { exact: true }).fill(password);
      await page.getByLabel('Repeat password').fill(password);
      await page.getByRole('button', { name: 'Start syncing' }).click();

      // Should show Sync confirmed page with success banner
      await page.waitForURL(/signup_confirmed_sync/);
      await expect(
        page.getByRole('heading', { name: 'Sync is turned on' })
      ).toBeVisible();
    });

    test('passwordless signin - Sync with TOTP and set password', async ({
      target,
      syncOAuthBrowserPages: {
        page,
        signin,
        signinPasswordlessCode,
        signinTotpCode,
      },
      testAccountTracker,
    }) => {
      // Flow: Sync login → passwordless OTP → TOTP → set password → sync enabled
      // TOTP must come before set_password because /password/create requires
      // a verifiedSessionToken.

      // Create passwordless account and set up TOTP
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

      await signin.clearCache();

      // Navigate to Sync OAuth signin
      const params = new URLSearchParams(syncDesktopOAuthQueryParams);
      await signin.goto('/authorization', params);
      await signin.fillOutEmailFirstForm(email);

      // Should redirect to passwordless code page
      await page.waitForURL(/signin_passwordless_code/);

      const code = await target.emailClient.getPasswordlessSigninCode(email);
      await signinPasswordlessCode.fillOutCodeForm(code);

      // TOTP verification comes before set_password
      await page.waitForURL(/signin_totp_code/);

      const newTotpCode = await getTotpCode(secret);
      await signinTotpCode.fillOutCodeForm(newTotpCode);

      // After TOTP, redirect to set password for Sync key derivation
      await page.waitForURL(/set_password/);
      await expect(
        page.getByRole('heading', { name: 'Create password to sync' })
      ).toBeVisible();

      // Complete password creation for Sync
      await page.getByLabel('Password', { exact: true }).fill(password);
      await page.getByLabel('Repeat password').fill(password);
      await page.getByRole('button', { name: 'Start syncing' }).click();

      // Should show Sync confirmed page with success banner
      await page.waitForURL(/signup_confirmed_sync/);
      await expect(
        page.getByRole('heading', { name: 'Sync is turned on' })
      ).toBeVisible();

      // TODO: FXA-XXXX - Verify re-login uses password flow (not OTP) after
      // password creation. Requires fresh browser context for second Sync OAuth
      // flow since webchannel state from first login is stale.
    });
  });

  test.describe('Passwordless authentication - Browser Service (Relay)', () => {
    test('passwordless signin via Relay OAuth flow', async ({
      target,
      syncOAuthBrowserPages: { page, signin, signinPasswordlessCode },
      testAccountTracker,
    }) => {
      const { email } = await testAccountTracker.signUpPasswordless();

      const params = new URLSearchParams(relayDesktopOAuthQueryParams);
      params.set('force_passwordless', 'true');
      await signin.goto('/authorization', params);

      await signin.fillOutEmailFirstForm(email);

      await expect(page).toHaveURL(/signin_passwordless_code/);
      await expect(signinPasswordlessCode.heading).toBeVisible();

      const code = await target.emailClient.getPasswordlessSigninCode(email);
      await signinPasswordlessCode.fillOutCodeForm(code);

      // After OTP, the flow either redirects to set_password or
      // completes the OAuth flow — verify we left the OTP page
      await expect(page).not.toHaveURL(/signin_passwordless_code/);
    });

    test('passwordless signup via Relay OAuth flow - service allowed', async ({
      target,
      syncOAuthBrowserPages: { page, signin, signinPasswordlessCode },
      testAccountTracker,
    }, { project }) => {
      test.skip(
        project.name !== 'local',
        'No services enabled yet in Stage/Production. This can be removed once Relay service is enabled.'
      );
      // Test that Relay (which is in allowedClientServices) supports passwordless signup
      const { email } = testAccountTracker.generatePasswordlessAccountDetails();

      const params = new URLSearchParams(relayDesktopOAuthQueryParams);
      // Add force_passwordless to enable passwordless for new account
      params.set('force_passwordless', 'true');
      await signin.goto('/authorization', params);

      await signin.fillOutEmailFirstForm(email);

      // Should redirect to passwordless code page (Relay service is allowed)
      await expect(page).toHaveURL(/signin_passwordless_code/);
      await expect(signinPasswordlessCode.heading).toBeVisible();

      const code = await target.emailClient.getPasswordlessSignupCode(email);
      await signinPasswordlessCode.fillOutCodeForm(code);

      // Should complete OAuth flow
      await expect(page).not.toHaveURL(/signin_passwordless_code/);
    });

    test('passwordless signin via Relay OAuth flow - account with 2FA proceeds to TOTP verification', async ({
      target,
      syncOAuthBrowserPages: { page, signin, signinPasswordlessCode, signinTotpCode },
      testAccountTracker,
    }) => {
      // Create passwordless account and set up TOTP via API
      const { email, sessionToken } =
        await testAccountTracker.signUpPasswordless();
      const account: any = testAccountTracker.accounts.find(
        (a) => a.email === email
      );
      if (!account) {
        throw new Error(
          `Account for email ${email} not found in testAccountTracker.accounts`
        );
      }
      const password = account.password;

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

      await signin.clearCache();

      // Sign in via Relay OAuth flow
      const params = new URLSearchParams(relayDesktopOAuthQueryParams);
      params.set('force_passwordless', 'true');
      await signin.goto('/authorization', params);

      await signin.fillOutEmailFirstForm(email);

      // Should redirect to passwordless code page
      await page.waitForURL(/signin_passwordless_code/);

      const passwordlessCode =
        await target.emailClient.getPasswordlessSigninCode(email);
      await signinPasswordlessCode.fillOutCodeForm(passwordlessCode);

      // Should redirect to TOTP code entry page
      await page.waitForURL(/signin_totp_code/);

      const newTotpCode = await getTotpCode(secret);
      await signinTotpCode.fillOutCodeForm(newTotpCode);

      // Should complete OAuth flow and land on settings
      await page.waitForURL(/\/settings/);

      // Cleanup: set password so testAccountTracker can destroy the account
      await target.authClient.passwordlessSendCode(email, {
        clientId: 'dcdb5ae7add825d2',
      });
      const cleanupCode =
        await target.emailClient.getPasswordlessSigninCode(email);
      const cleanupResult = await target.authClient.passwordlessConfirmCode(
        email,
        cleanupCode,
        { clientId: 'dcdb5ae7add825d2' }
      );
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

      if (account) {
        account.isPasswordless = false;
      }
    });

    test('passwordless signup blocked for service not in allowedClientServices', async ({
      target,
      pages: { page, signin },
      testAccountTracker,
    }) => {
      // Test that services NOT in allowedClientServices are blocked from passwordless
      const { email } = testAccountTracker.generatePasswordlessAccountDetails();

      // Use a different OAuth client that is NOT in allowedClientServices
      // (using Sync client as an example of a service that doesn't support passwordless signup)
      const params = new URLSearchParams(syncDesktopOAuthQueryParams);
      params.set('force_passwordless', 'true');
      await signin.goto('/authorization', params);

      await signin.fillOutEmailFirstForm(email);

      // Should NOT redirect to passwordless code page
      // Instead should go to traditional signup flow (password form)
      await expect(page).not.toHaveURL(/signin_passwordless_code/);
      await expect(page).toHaveURL(/signup/);
    });
  });
});
