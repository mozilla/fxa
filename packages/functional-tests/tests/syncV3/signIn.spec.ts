/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { sign } from 'crypto';
import { EmailHeader, EmailType } from '../../lib/email';
import { expect, test, PASSWORD } from '../../lib/fixtures/standard';
import { getCode } from 'fxa-settings/src/lib/totp';

test.describe.configure({ mode: 'parallel' });

test.describe('severity-2 #smoke', () => {
  test.describe('Firefox Desktop Sync v3 sign in', () => {
    test.use({
      emailOptions: [
        { prefix: 'sync{id}', PASSWORD },
        { prefix: 'blocked{id}', PASSWORD },
      ],
    });

    test.beforeEach(async ({ syncBrowserPages: { login } }) => {
      test.slow();
    });

    test('verified email, does not need to confirm', async ({
      target,
      credentials,
      syncBrowserPages,
    }) => {
      const email = credentials.email;
      const { page, login, connectAnotherDevice } = syncBrowserPages;

      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email`
      );
      await login.login(email, PASSWORD);

      await expect(connectAnotherDevice.fxaConnected).toBeEnabled();
    });

    test('verified email with signin verification, can ask to resend code', async ({
      emails,
      target,
      syncBrowserPages,
    }) => {
      const { page, login, connectAnotherDevice, signinTokenCode } =
        syncBrowserPages;

      const [email] = emails;

      // Simulate a new sign up that requires a signin verification code.
      target.auth.signUp(email, PASSWORD, {
        service: 'sync',
        preVerified: 'true',
      });

      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email`
      );
      await login.login(email, PASSWORD);

      // Click resend link
      await signinTokenCode.resendLink.click();
      await expect(signinTokenCode.successMessage).toBeVisible();
      await expect(signinTokenCode.successMessage).toContainText(
        /Email re-?sent/
      );
      const code = await target.email.waitForEmail(
        email,
        EmailType.verifyLoginCode,
        EmailHeader.signinCode
      );
      await signinTokenCode.input.fill(code);
      await signinTokenCode.submit.click();

      await expect(connectAnotherDevice.fxaConnected).toBeVisible();
    });

    test('verified email with signin verification, accepts valid sign in code', async ({
      emails,
      target,
      syncBrowserPages,
    }) => {
      const { page, login, connectAnotherDevice, signinTokenCode } =
        syncBrowserPages;

      const [email] = emails;

      // Simulate a new sign up that requires a signin verification code.
      target.auth.signUp(email, PASSWORD, {
        service: 'sync',
        preVerified: 'true',
      });

      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email`
      );
      await login.login(email, PASSWORD);

      const code = await target.email.waitForEmail(
        email,
        EmailType.verifyLoginCode,
        EmailHeader.signinCode
      );
      await signinTokenCode.input.fill(code);
      await signinTokenCode.submit.click();

      await expect(connectAnotherDevice.fxaConnected).toBeVisible();
    });

    test('verified email with signin verification, rejects invalid signin code', async ({
      emails,
      target,
      syncBrowserPages,
    }) => {
      const { page, login, connectAnotherDevice, signinTokenCode } =
        syncBrowserPages;

      const [email] = emails;

      // Simulate a new sign up that requires a signin verification code.
      target.auth.signUp(email, PASSWORD, {
        service: 'sync',
        preVerified: 'true',
      });

      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email`
      );
      await login.login(email, PASSWORD);

      // Input invalid code and verify the tooltip error
      await signinTokenCode.input.fill('000000');
      await signinTokenCode.submit.click();

      await expect(signinTokenCode.tooltip).toBeVisible();
      await expect(signinTokenCode.tooltip).toContainText('Invalid or expired');

      const code = await target.email.waitForEmail(
        email,
        EmailType.verifyLoginCode,
        EmailHeader.signinCode
      );
      await signinTokenCode.input.fill(code);
      await signinTokenCode.submit.click();

      await expect(connectAnotherDevice.fxaConnected).toBeVisible();
    });

    test('verified email, in blocked state', async ({
      emails,
      target,
      syncBrowserPages,
    }) => {
      const { page, login, signinUnblock, connectAnotherDevice } =
        syncBrowserPages;
      const [, blockedEmail] = emails;
      await target.auth.signUp(blockedEmail, PASSWORD, {
        service: 'sync',
        lang: 'en',
        preVerified: 'true',
      });

      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync`
      );
      await login.login(blockedEmail, PASSWORD);

      const code = await target.email.waitForEmail(
        blockedEmail,
        EmailType.unblockCode,
        EmailHeader.unblockCode
      );
      await signinUnblock.input.fill(code);
      await signinUnblock.submit.click();

      await expect(connectAnotherDevice.fxaConnected).toBeVisible();
    });

    test('unverified email', async ({ emails, target, syncBrowserPages }) => {
      const { page, login, connectAnotherDevice, confirmSignupCode } =
        syncBrowserPages;
      const [email] = emails;

      await target.auth.signUp(email, PASSWORD, {
        service: 'sync',
        lang: 'en',
        preVerified: 'false',
      });

      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email`
      );
      await login.login(email, PASSWORD);

      // Since the account is not verified yet, we'd expect to see the signup code confirmation
      const code = await target.email.waitForEmail(
        email,
        EmailType.verifyLoginCode,
        EmailHeader.signinCode
      );
      await confirmSignupCode.input.fill(code);
      await confirmSignupCode.submit.click();

      await expect(connectAnotherDevice.fxaConnected).toBeVisible();
    });

    test('add TOTP and confirm sync signin', async ({
      credentials,
      target,
      syncBrowserPages,
    }) => {
      const {
        page,
        login,
        connectAnotherDevice,
        settings,
        totp,
        signinTotpCode,
      } = syncBrowserPages;

      await settings.goto();
      await settings.totp.clickAdd();
      const { secret } = await totp.fillOutTwoStepAuthenticationForm();
      credentials.secret = secret;
      await settings.signOut();

      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync`,
        { waitUntil: 'load' }
      );

      await login.login(credentials.email, credentials.password);

      const code = await getCode(credentials.secret);
      await signinTotpCode.input.fill(code);
      await signinTotpCode.submit.click();

      await expect(connectAnotherDevice.fxaConnected).toBeVisible();
    });
  });

  test.describe('severity-1 #smoke', () => {
    test.describe('OAuth and Fx Desktop handshake', () => {
      test('user signed into browser and OAuth login', async ({
        target,
        credentials,
        syncBrowserPages: { page, login, relier, settings },
      }) => {
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
