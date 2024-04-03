/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { EmailHeader, EmailType } from '../../lib/email';
import { expect, test, PASSWORD } from '../../lib/fixtures/standard';

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

    test('verified, does not need to confirm', async ({
      target,
      credentials,
      syncBrowserPages,
    }) => {
      const email = credentials.email;
      const { page, login, connectAnotherDevice, signinTokenCode } =
        syncBrowserPages;
      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email`
      );
      await login.setEmail(email);
      await signinTokenCode.clickSubmitButton();
      await login.setPassword(PASSWORD);
      await login.submit();
      await expect(connectAnotherDevice.fxaConnected).toBeEnabled();
    });

    test('verified, resend', async ({ emails, target, syncBrowserPages }) => {
      const { page, login, connectAnotherDevice, signinTokenCode } =
        syncBrowserPages;

      const [email] = emails;

      target.auth.signUp(email, PASSWORD, { service: 'sync', keys: true });

      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email`
      );

      await login.setEmail(email);
      await login.clickSubmit();
      await login.setPassword(PASSWORD);
      await login.clickSubmit();

      // Click resend link
      await signinTokenCode.resendLink.click();
      await signinTokenCode.successMessage.waitFor({ state: 'visible' });
      await expect(signinTokenCode.successMessage).toBeVisible();
      await expect(signinTokenCode.successMessage).toContainText(
        'Email resent.'
      );
      const code = await target.email.waitForEmail(
        email,
        EmailType.verifyShortCode,
        EmailHeader.shortCode
      );
      await signinTokenCode.input.fill(code);
      await login.submit();
      await expect(connectAnotherDevice.fxaConnected).toBeVisible();
    });

    test('verified - invalid code', async ({
      emails,
      target,
      syncBrowserPages,
    }) => {
      const { page, login, signinTokenCode } = syncBrowserPages;

      const [email] = emails;

      target.auth.signUp(email, PASSWORD, { service: 'sync', keys: true });

      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email`
      );

      await login.setEmail(email);
      await login.clickSubmit();
      await login.setPassword(PASSWORD);
      await login.clickSubmit();

      // Input invalid code and verify the tooltip error
      await signinTokenCode.input.fill('000000');
      await signinTokenCode.submit.click();
      await expect(signinTokenCode.tooltip).toBeVisible();
    });

    test('verified, blocked', async ({ emails, target, syncBrowserPages }) => {
      const { page, login, connectAnotherDevice, signinTokenCode } =
        syncBrowserPages;
      const [, blockedEmail] = emails;
      await target.auth.signUp(blockedEmail, PASSWORD, {
        lang: 'en',
        preVerified: 'true',
      });
      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync`
      );
      await login.setEmail(blockedEmail);
      await signinTokenCode.clickSubmitButton();
      await login.setPassword(PASSWORD);
      await login.submit();
      await login.unblock(blockedEmail);
      await expect(connectAnotherDevice.fxaConnected).toBeVisible();
    });

    test('unverified', async ({ emails, target, syncBrowserPages }) => {
      const { page, login, connectAnotherDevice, signinTokenCode } =
        syncBrowserPages;
      const [email] = emails;
      await target.auth.signUp(email, PASSWORD, {
        lang: 'en',
        preVerified: 'false',
      });
      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email`
      );
      await login.setEmail(email);
      await signinTokenCode.clickSubmitButton();
      await login.setPassword(PASSWORD);
      await login.submit();
      await login.fillOutSignInCode(email);
      await expect(connectAnotherDevice.fxaConnected).toBeVisible();
    });

    test('add TOTP and confirm sync signin', async ({
      credentials,
      target,
      syncBrowserPages,
    }) => {
      const { page, login, connectAnotherDevice, settings, totp } =
        syncBrowserPages;

      await settings.goto();
      await settings.totp.clickAdd();
      const { secret } = await totp.fillTwoStepAuthenticationForm();
      credentials.secret = secret;
      await settings.signOut();

      // Sync sign in
      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync`,
        { waitUntil: 'load' }
      );
      await login.login(credentials.email, credentials.password);
      await login.setTotp(credentials.secret);
      await expect(connectAnotherDevice.fxaConnected).toBeVisible();
    });
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

      // Normally we wouldn't need this delay, but because we are
      // disconnecting the sync service, we need to ensure that the device
      // record and web channels have been sent and created.
      await page.waitForTimeout(1000);

      await relier.goto();
      await relier.clickEmailFirst();

      // User can sign in with cached credentials, no password needed.
      await expect(await login.getPrefilledEmail()).toContain(
        credentials.email
      );
      await expect(await login.isCachedLogin()).toBe(true);

      await login.submit();
      expect(await relier.isLoggedIn()).toBe(true);

      await relier.signOut();

      // Attempt to sign back in
      await relier.clickEmailFirst();

      await expect(await login.getPrefilledEmail()).toContain(
        credentials.email
      );
      await expect(await login.isCachedLogin()).toBe(true);

      await login.submit();
      expect(await relier.isLoggedIn()).toBe(true);

      // Disconnect sync otherwise we can have flaky tests.
      await settings.disconnectSync(credentials);

      expect(page.url()).toContain(login.url);
    });
  });
});
