/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getCode } from 'fxa-settings/src/lib/totp';
import { TestAccountTracker } from '../../lib/testAccountTracker';
import { EmailHeader, EmailType } from '../../lib/email';
import { Page, expect, test } from '../../lib/fixtures/standard';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { LoginPage } from '../../pages/login';

test.describe.configure({ mode: 'parallel' });

test.describe('severity-2 #smoke', () => {
  test.beforeEach(async () => {
    test.slow();
  });

  test.describe('Firefox Desktop Sync v3 sign in', () => {
    test('verified email, does not need to confirm', async ({
      target,
      syncBrowserPages: { page, login, connectAnotherDevice },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();

      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email`
      );
      await login.login(credentials.email, credentials.password);

      await expect(connectAnotherDevice.fxaConnected).toBeEnabled();
    });

    test('verified email with signin verification, can ask to resend code', async ({
      target,
      syncBrowserPages: { page, login, connectAnotherDevice, signinTokenCode },
      testAccountTracker,
    }) => {
      // Simulate a new sign up that requires a signin verification code.
      const credentials = await testAccountTracker.signUpSync({
        lang: 'en',
        service: 'sync',
        preVerified: 'true',
      });

      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email`
      );
      await login.login(credentials.email, credentials.password);

      // Click resend link
      await signinTokenCode.resendLink.click();
      await expect(signinTokenCode.successMessage).toBeVisible();
      await expect(signinTokenCode.successMessage).toContainText(
        /Email re-?sent/
      );
      const code = await target.emailClient.waitForEmail(
        credentials.email,
        EmailType.verifyLoginCode,
        EmailHeader.signinCode
      );
      await signinTokenCode.input.fill(code);
      await signinTokenCode.submit.click();

      await expect(connectAnotherDevice.fxaConnected).toBeVisible();
    });

    test('verified email with signin verification, accepts valid sign in code', async ({
      target,
      syncBrowserPages: { page, login, connectAnotherDevice, signinTokenCode },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUpSync({
        lang: 'en',
        service: 'sync',
        preVerified: 'true',
      });

      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email`
      );
      await login.login(credentials.email, credentials.password);

      const code = await target.emailClient.waitForEmail(
        credentials.email,
        EmailType.verifyLoginCode,
        EmailHeader.signinCode
      );
      await signinTokenCode.input.fill(code);
      await signinTokenCode.submit.click();

      await expect(connectAnotherDevice.fxaConnected).toBeVisible();
    });

    test('verified email with signin verification, rejects invalid signin code', async ({
      target,
      syncBrowserPages: { page, login, connectAnotherDevice, signinTokenCode },
      testAccountTracker,
    }) => {
      // Simulate a new sign up that requires a signin verification code.
      const credentials = await testAccountTracker.signUpSync({
        lang: 'en',
        service: 'sync',
        preVerified: 'true',
      });

      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email`
      );
      await login.login(credentials.email, credentials.password);

      // Input invalid code and verify the tooltip error
      await signinTokenCode.input.fill('000000');
      await signinTokenCode.submit.click();

      await expect(signinTokenCode.tooltip).toBeVisible();
      await expect(signinTokenCode.tooltip).toContainText('Invalid or expired');

      const code = await target.emailClient.waitForEmail(
        credentials.email,
        EmailType.verifyLoginCode,
        EmailHeader.signinCode
      );
      await signinTokenCode.input.fill(code);
      await signinTokenCode.submit.click();

      await expect(connectAnotherDevice.fxaConnected).toBeVisible();
    });

    test('unverified email', async ({
      target,
      syncBrowserPages: {
        page,
        login,
        connectAnotherDevice,
        confirmSignupCode,
      },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUpSync({
        lang: 'en',
        service: 'sync',
        preVerified: 'false',
      });

      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email`
      );
      await login.login(credentials.email, credentials.password);

      // Since the account is not verified yet, we'd expect to see the signup code confirmation
      const code = await target.emailClient.waitForEmail(
        credentials.email,
        EmailType.verifyLoginCode,
        EmailHeader.signinCode
      );
      await confirmSignupCode.input.fill(code);
      await confirmSignupCode.submit.click();

      await expect(connectAnotherDevice.fxaConnected).toBeVisible();
    });

    test('add TOTP and confirm sync signin', async ({
      target,
      syncBrowserPages: {
        page,
        login,
        connectAnotherDevice,
        settings,
        totp,
        signinTotpCode,
      },
      testAccountTracker,
    }) => {
      const credentials = await signInAccount(
        target,
        page,
        login,
        testAccountTracker
      );

      await settings.goto();
      await settings.totp.addButton.click();
      const { secret } = await totp.fillOutTotpForms();
      await settings.signOut();

      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync`,
        { waitUntil: 'load' }
      );

      await login.login(credentials.email, credentials.password);

      const code = await getCode(secret);
      await signinTotpCode.input.fill(code);
      await signinTotpCode.submit.click();

      await expect(connectAnotherDevice.fxaConnected).toBeVisible();

      // Required before teardown
      await settings.goto();
      await settings.disconnectTotp();
    });

    test('verified email, in blocked state', async ({
      target,
      syncBrowserPages: {
        page,
        login,
        signinUnblock,
        connectAnotherDevice,
        settings,
        deleteAccount,
      },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUpBlocked({
        lang: 'en',
        service: 'sync',
        preVerified: 'true',
      });

      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync`
      );
      await login.login(credentials.email, credentials.password);

      const code = await target.emailClient.waitForEmail(
        credentials.email,
        EmailType.unblockCode,
        EmailHeader.unblockCode
      );
      await signinUnblock.input.fill(code);
      await signinUnblock.submit.click();

      await expect(connectAnotherDevice.fxaConnected).toBeVisible();

      //Delete blocked account, required before teardown
      await connectAnotherDevice.notNowButton.click();
      await settings.deleteAccountButton.click();
      await deleteAccount.deleteAccount(credentials.password);

      await expect(
        page.getByText('Account deleted successfully')
      ).toBeVisible();
    });
  });

  test.describe('severity-1 #smoke', () => {
    test.describe('OAuth and Fx Desktop handshake', () => {
      test('user signed into browser and OAuth login', async ({
        target,
        syncBrowserPages: { page, login, relier, settings },
        testAccountTracker,
      }) => {
        const credentials = await testAccountTracker.signUp();

        await page.goto(
          target.contentServerUrl +
            '?context=fx_desktop_v3&entrypoint=fxa%3Aenter_email&service=sync&action=email'
        );
        await login.login(credentials.email, credentials.password);
        expect(await login.isSyncConnectedHeader()).toBe(true);

        await relier.goto();
        await relier.clickEmailFirst();

        // User can sign in with cached credentials, no password needed.
        expect(await login.getPrefilledEmail()).toContain(credentials.email);
        expect(await login.isCachedLogin()).toBe(true);

        await login.submit();
        expect(await relier.isLoggedIn()).toBe(true);

        await relier.signOut();

        // Attempt to sign back in
        await relier.clickEmailFirst();

        expect(await login.getPrefilledEmail()).toContain(credentials.email);
        expect(await login.isCachedLogin()).toBe(true);

        await login.submit();
        expect(await relier.isLoggedIn()).toBe(true);

        // Disconnect sync otherwise we can have flaky tests.
        await settings.disconnectSync(credentials);

        expect(page.url()).toContain(login.url);
      });
    });
  });
});

async function signInAccount(
  target: BaseTarget,
  page: Page,
  login: LoginPage,
  testAccountTracker: TestAccountTracker
): Promise<Credentials> {
  const credentials = await testAccountTracker.signUp();
  await page.goto(target.contentServerUrl);
  await login.fillOutEmailFirstSignIn(credentials.email, credentials.password);

  //Verify logged in on Settings page
  expect(await login.isUserLoggedIn()).toBe(true);

  return credentials;
}
