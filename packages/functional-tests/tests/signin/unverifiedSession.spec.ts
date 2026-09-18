/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { EmailHeader, EmailType } from '../../lib/email';
import { expect, test } from '../../lib/fixtures/standard';
import { enableTotpOnAccount } from '../../lib/pairing-helpers';

// The non-Sync, non-2FA unverified session: the primary email is verified, the
// session is unverified, and `mustVerify` is unset. Real users reach it when the
// auth-server's sign-in heuristics decline to pre-verify (account must be older
// than `skipForNewAccounts.maxAge`). Test accounts are always new, so the
// auth-server's `forcedHeuristicEmailAddresses` default forces it for the
// `unverifiedsession` prefix instead. The `sync` prefix is a different state:
// `forcedSyncEmailAddresses` sets `mustVerify`, which blocks OAuth grants until
// the code is entered.
test.describe('severity-1 #smoke', () => {
  test.describe('heuristic unverified session', () => {
    test('forced unverified session has mustVerify unset', async ({
      target,
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUpUnverifiedSession();

      const login = await target.authClient.signIn(
        credentials.email,
        credentials.password,
        { reason: 'signin' }
      );
      expect(login.sessionVerified).toBe(false);

      // /recovery_email/status reports `verified` as the email status unless
      // the session is `mustVerify`, in which case it also requires the
      // session to be verified. `true` here is the only externally observable
      // proof that `mustVerify` is unset on an unverified session.
      const status = await target.authClient.recoveryEmailStatus(
        login.sessionToken
      );
      expect(status.sessionVerified).toBe(false);
      expect(status.verified).toBe(true);
    });

    test('Settings sign-in lands on signin_token_code and sends exactly one verifyLoginCode', async ({
      target,
      pages: { page, settings, signin, signinTokenCode },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUpUnverifiedSession();
      await target.emailClient.clear(credentials.email);

      await page.goto(target.contentServerUrl);
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);
      await expect(page).toHaveURL(/signin_token_code/);

      // Read from the header rather than `getVerifyLoginCode`, which clears
      // the inbox this test counts.
      const code = await target.emailClient.waitForEmail(
        credentials.email,
        EmailType.verifyLoginCode,
        EmailHeader.signinCode
      );
      await signinTokenCode.fillOutCodeForm(code);
      await expect(settings.settingsHeading).toBeVisible();

      // `newDeviceLogin` is sent by /session/verify_code, after both possible
      // senders of the code email, so its arrival bounds any duplicate.
      await target.emailClient.waitForEmail(
        credentials.email,
        EmailType.newDeviceLogin
      );
      expect(
        await target.emailClient.countEmailsByType(
          credentials.email,
          EmailType.verifyLoginCode
        )
      ).toBe(1);
    });

    test('RP outside servicesWithEmailVerification grants without a code; Settings then asks for it and only one verifyLoginCode is sent', async ({
      target,
      pages: { page, relier, settings, signin, signinTokenCode },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUpUnverifiedSession();
      await target.emailClient.clear(credentials.email);

      await relier.goto();
      await relier.clickEmailFirst();
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      // Straight to the RP: no code page, and the session stays unverified.
      expect(await relier.isLoggedIn()).toBe(true);

      // The unverified session cannot use Settings, which bounces to the
      // cached sign-in and from there to the code page.
      await settings.goto();
      await expect(signin.cachedSigninSubmitButton).toBeVisible();
      await signin.cachedSigninSubmitButton.click();
      await expect(page).toHaveURL(/signin_token_code/);

      const code = await target.emailClient.waitForEmail(
        credentials.email,
        EmailType.verifyLoginCode,
        EmailHeader.signinCode
      );
      await signinTokenCode.fillOutCodeForm(code);
      await expect(settings.settingsHeading).toBeVisible();

      // The local inbox blocks reads on an empty mailbox, so the RP step
      // cannot be counted on its own. `newDeviceLogin` follows verification
      // and bounds both possible senders of the code email, on both steps.
      await target.emailClient.waitForEmail(
        credentials.email,
        EmailType.newDeviceLogin
      );
      expect(
        await target.emailClient.countEmailsByType(
          credentials.email,
          EmailType.verifyLoginCode
        ),
        'the RP pass-through must not email a code no one is asked for'
      ).toBe(1);
    });

    // Paired with the checkout test in tests-payments-next. This one is the
    // only one that runs on PRs, where Payments Next is never started, so it
    // drives the client id directly and asserts the grant response. Removing
    // it drops this coverage from every PR.
    test('RP in servicesWithEmailVerification, Payments Next, lands on signin_token_code and sends exactly one verifyLoginCode', async ({
      target,
      pages: { page, signin, signinTokenCode },
      testAccountTracker,
    }) => {
      test.skip(
        target.name !== 'local',
        'uses the local Payments Next client id and redirect_uri'
      );
      const credentials = await testAccountTracker.signUpUnverifiedSession();
      await target.emailClient.clear(credentials.email);

      const params = new URLSearchParams({
        client_id: '32aaeb6f1c21316a',
        redirect_uri: 'http://localhost:3035/api/auth/callback/fxa',
        scope: 'https://identity.mozilla.com/account/subscriptions',
        response_type: 'code',
        state: 'fakestate',
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
      // The backend guard for listed services releases the session once the
      // code is accepted. The grant response is the assertion; the redirect
      // to Payments Next then fails locally because it is not running.
      const grant = page.waitForResponse(
        (response) =>
          response.url().endsWith('/v1/oauth/authorization') &&
          response.status() === 200
      );
      await signinTokenCode.fillOutCodeForm(code);
      await grant;

      await target.emailClient.waitForEmail(
        credentials.email,
        EmailType.newDeviceLogin
      );
      expect(
        await target.emailClient.countEmailsByType(
          credentials.email,
          EmailType.verifyLoginCode
        )
      ).toBe(1);
    });
    // prompt=none must never interact: it either grants silently or fails back
    // to the RP. The pass-through is what makes the silent grant possible, so
    // both halves are exercised against the same session state.
    test.describe('prompt=none', () => {
      test('grants silently for an RP outside servicesWithEmailVerification', async ({
        target,
        pages: { page, relier, settings, signin, signinTokenCode },
        testAccountTracker,
      }) => {
        const credentials = await testAccountTracker.signUpUnverifiedSession();
        await target.emailClient.clear(credentials.email);

        await relier.goto();
        await relier.clickEmailFirst();
        await signin.fillOutEmailFirstForm(credentials.email);
        await signin.fillOutPasswordForm(credentials.password);
        expect(await relier.isLoggedIn()).toBe(true);

        // Only the relier's own session; the unverified FxA session survives
        // and is what the silent grant below runs against. Signing out is also
        // what puts the prompt=none button back on the page.
        await relier.signOut();

        const query = new URLSearchParams({ login_hint: credentials.email });
        await page.goto(`${target.relierUrl}/?${query.toString()}`);
        await relier.signInPromptNone();
        expect(await relier.isLoggedIn()).toBe(true);

        // Settings is the barrier: it forces the code the two grants did not,
        // and its newDeviceLogin bounds every earlier send.
        await settings.goto();
        await expect(signin.cachedSigninSubmitButton).toBeVisible();
        await signin.cachedSigninSubmitButton.click();
        await expect(page).toHaveURL(/signin_token_code/);
        const code = await target.emailClient.waitForEmail(
          credentials.email,
          EmailType.verifyLoginCode,
          EmailHeader.signinCode
        );
        await signinTokenCode.fillOutCodeForm(code);
        await expect(settings.settingsHeading).toBeVisible();

        await target.emailClient.waitForEmail(
          credentials.email,
          EmailType.newDeviceLogin
        );
        expect(
          await target.emailClient.countEmailsByType(
            credentials.email,
            EmailType.verifyLoginCode
          ),
          'a silent grant must not email a code'
        ).toBe(1);
      });

      test('fails back to the RP for acr_values=AAL2 without emailing a code', async ({
        target,
        pages: { page, relier, settings, signin, signinTokenCode },
        testAccountTracker,
      }) => {
        const credentials = await testAccountTracker.signUpUnverifiedSession();
        await target.emailClient.clear(credentials.email);

        await relier.goto();
        await relier.clickEmailFirst();
        await signin.fillOutEmailFirstForm(credentials.email);
        await signin.fillOutPasswordForm(credentials.password);
        expect(await relier.isLoggedIn()).toBe(true);

        // Built by hand because no 123Done route asks for both: /api/prompt_none
        // sets prompt=none but no acr_values, and /api/step_up sets acr_values
        // but omits the prompt parameter entirely. No login_hint, so the
        // per-client prompt=none allowlist is not consulted and this runs
        // outside local too.
        const authorization = new URLSearchParams({
          client_id: target.relierClientID,
          redirect_uri: `${target.relierUrl}/api/oauth`,
          scope: 'profile openid',
          response_type: 'code',
          state: 'fakestate',
          acr_values: 'AAL2',
          prompt: 'none',
        });
        // Watched as a request, not a URL: 123Done does not recognise the
        // state it did not issue, so it redirects on rather than landing the
        // browser on the error.
        const errorRedirect = page.waitForRequest(
          (request) =>
            request.url().includes('/api/oauth?') &&
            request.url().includes('error=')
        );
        await page.goto(
          `${target.contentServerUrl}/authorization?${authorization}`
        );

        const params = new URL((await errorRedirect).url()).searchParams;
        expect(params.get('error')).toBe('interaction_required');
        expect(params.get('state')).toBe('fakestate');

        await settings.goto();
        await expect(signin.cachedSigninSubmitButton).toBeVisible();
        await signin.cachedSigninSubmitButton.click();
        await expect(page).toHaveURL(/signin_token_code/);
        const code = await target.emailClient.waitForEmail(
          credentials.email,
          EmailType.verifyLoginCode,
          EmailHeader.signinCode
        );
        await signinTokenCode.fillOutCodeForm(code);
        await expect(settings.settingsHeading).toBeVisible();

        await target.emailClient.waitForEmail(
          credentials.email,
          EmailType.newDeviceLogin
        );
        expect(
          await target.emailClient.countEmailsByType(
            credentials.email,
            EmailType.verifyLoginCode
          ),
          'a refused prompt=none request must not email a code'
        ).toBe(1);
      });

      test('fails back to the RP for a client in servicesWithEmailVerification', async ({
        target,
        pages: { page, relier, settings, signin, signinTokenCode },
        testAccountTracker,
      }) => {
        test.skip(
          target.name !== 'local',
          'hardcodes the local Payments Next client id and redirect_uri'
        );
        const credentials = await testAccountTracker.signUpUnverifiedSession();
        await target.emailClient.clear(credentials.email);

        await relier.goto();
        await relier.clickEmailFirst();
        await signin.fillOutEmailFirstForm(credentials.email);
        await signin.fillOutPasswordForm(credentials.password);
        expect(await relier.isLoggedIn()).toBe(true);

        // The same session the RP above was granted silently. Listed clients
        // are refused instead, by the Authorization container's own guard.
        const authorization = new URLSearchParams({
          client_id: '32aaeb6f1c21316a',
          redirect_uri: 'http://localhost:3035/api/auth/callback/fxa',
          scope: 'https://identity.mozilla.com/account/subscriptions',
          response_type: 'code',
          state: 'fakestate',
          prompt: 'none',
        });
        const errorRedirect = page.waitForRequest((request) =>
          request.url().includes('error=')
        );
        await page.goto(
          `${target.contentServerUrl}/authorization?${authorization}`
        );

        const params = new URL((await errorRedirect).url()).searchParams;
        expect(params.get('error')).toBe('interaction_required');
        expect(params.get('state')).toBe('fakestate');

        await settings.goto();
        await expect(signin.cachedSigninSubmitButton).toBeVisible();
        await signin.cachedSigninSubmitButton.click();
        await expect(page).toHaveURL(/signin_token_code/);
        const code = await target.emailClient.waitForEmail(
          credentials.email,
          EmailType.verifyLoginCode,
          EmailHeader.signinCode
        );
        await signinTokenCode.fillOutCodeForm(code);
        await expect(settings.settingsHeading).toBeVisible();

        await target.emailClient.waitForEmail(
          credentials.email,
          EmailType.newDeviceLogin
        );
        expect(
          await target.emailClient.countEmailsByType(
            credentials.email,
            EmailType.verifyLoginCode
          ),
          'a refused prompt=none request must not email a code'
        ).toBe(1);
      });
    });
  });

  // The 2FA state: the account has TOTP and the code has not been entered, so
  // the session is unverified for a reason no RP can wait out. prompt=none is
  // refused for the same reason as the other two states — the only way forward
  // is a page.
  test.describe('2FA unverified session', () => {
    test('prompt=none fails back to the RP rather than ask for the TOTP code', async ({
      target,
      pages: { page, relier, signin },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      // Kept on the tracked credentials: teardown needs it to reach AAL2 and
      // delete the account.
      credentials.secret = await enableTotpOnAccount(
        target.authClient,
        credentials.sessionToken
      );

      await relier.goto();
      await relier.clickEmailFirst();
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);
      // Stop here: the session exists and is cached, but stays unverified.
      await expect(page).toHaveURL(/signin_totp_code/);

      const query = new URLSearchParams({ login_hint: credentials.email });
      await page.goto(`${target.relierUrl}/?${query.toString()}`);
      const errorRedirect = page.waitForRequest(
        (request) =>
          request.url().includes('/api/oauth?') &&
          request.url().includes('error=')
      );
      await relier.signInPromptNone();

      const params = new URL((await errorRedirect).url()).searchParams;
      expect(params.get('error')).toBe('interaction_required');
    });
  });

  // The Sync-style state: the same forced confirmation, but `mustVerify` is
  // set (the `sync` prefix), so the server refuses the OAuth grant and the
  // front end falls back to the code page. The code email must follow it.
  test.describe('mustVerify unverified session (scoped keys)', () => {
    test('RP outside servicesWithEmailVerification is still forced to verify', async ({
      target,
      pages: { page, relier, signin, signinTokenCode },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUpSync();
      await target.emailClient.clear(credentials.email);

      await relier.goto();
      await relier.clickEmailFirst();
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);
      await expect(page).toHaveURL(/signin_token_code/);

      const code = await target.emailClient.waitForEmail(
        credentials.email,
        EmailType.verifyLoginCode,
        EmailHeader.signinCode
      );
      await signinTokenCode.fillOutCodeForm(code);
      expect(await relier.isLoggedIn()).toBe(true);

      await target.emailClient.waitForEmail(
        credentials.email,
        EmailType.newDeviceLogin
      );
      expect(
        await target.emailClient.countEmailsByType(
          credentials.email,
          EmailType.verifyLoginCode
        )
      ).toBe(1);
    });
  });
});
