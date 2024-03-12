/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { EmailHeader, EmailType } from '../../lib/email';
import { expect, test } from '../../lib/fixtures/standard';

const password = 'passwordzxcv';
let email;

test.describe.configure({ mode: 'parallel' });

test.describe('severity-2 #smoke', () => {
  test.describe('Firefox Desktop Sync v3 sign in', () => {
    test.beforeEach(async ({ syncBrowserPages: { login } }) => {
      test.slow();
      email = login.createEmail('sync{id}');
    });

    test('verified, does not need to confirm', async ({
      target,
      syncBrowserPages,
    }) => {
      const { page, login, connectAnotherDevice, signinTokenCode } =
        syncBrowserPages;
      const email = login.createEmail();
      await target.auth.signUp(email, password, {
        lang: 'en',
        preVerified: 'true',
      });
      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email`
      );
      await login.setEmail(email);
      await signinTokenCode.clickSubmitButton();
      await login.setPassword(password);
      await login.submit();
      await expect(connectAnotherDevice.fxaConnected).toBeEnabled();
    });

    // TODO in FXA-8973 - use sign in not sign up flow
    test('verified, resend', async ({ target, syncBrowserPages }) => {
      const { configPage, page, login, connectAnotherDevice, signinTokenCode } =
        syncBrowserPages;

      const config = await configPage.getConfig();
      test.fixme(
        config.showReactApp.signUpRoutes,
        'this test goes through the signup flow instead of sign in, skipping for react'
      );

      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email`
      );
      await login.setEmail(email);
      await signinTokenCode.clickSubmitButton();
      await login.setPassword(password);
      await login.confirmPassword(password);
      await login.setAge('21');
      await login.submit();

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

    // TODO in FXA-8973 - use sign in not sign up flow
    test('verified - invalid code', async ({ target, syncBrowserPages }) => {
      const { configPage, page, login, connectAnotherDevice, signinTokenCode } =
        syncBrowserPages;

      const config = await configPage.getConfig();
      test.fixme(
        config.showReactApp.signUpRoutes,
        'this test goes through the signup flow instead of sign in, skipping for react'
      );

      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email`
      );
      await login.setEmail(email);
      await signinTokenCode.clickSubmitButton();
      await login.setPassword(password);
      await login.confirmPassword(password);
      await login.setAge('21');
      await login.submit();

      // Input invalid code and verify the tooltip error
      await signinTokenCode.input.fill('000000');
      await signinTokenCode.submit.click();
      await expect(signinTokenCode.tooltip).toContainText('Invalid or expired');

      //Input Valid code and verify the success
      await login.fillOutSignUpCode(email);
      await expect(connectAnotherDevice.fxaConnected).toBeVisible();
    });

    test('verified, blocked', async ({ target, syncBrowserPages }) => {
      const { page, login, connectAnotherDevice, signinTokenCode } =
        syncBrowserPages;

      const blockedEmail = login.createEmail('blocked{id}');
      await target.auth.signUp(blockedEmail, password, {
        lang: 'en',
        preVerified: 'true',
      });
      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync`
      );
      await login.setEmail(blockedEmail);
      await signinTokenCode.clickSubmitButton();
      await login.setPassword(password);
      await login.submit();
      await login.unblock(blockedEmail);
      await expect(connectAnotherDevice.fxaConnected).toBeVisible();
    });

    test('unverified', async ({ target, syncBrowserPages }) => {
      const { page, login, connectAnotherDevice, signinTokenCode } =
        syncBrowserPages;

      await target.auth.signUp(email, password, {
        lang: 'en',
        preVerified: 'false',
      });
      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email`
      );
      await login.setEmail(email);
      await signinTokenCode.clickSubmitButton();
      await login.setPassword(password);
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
      await totp.enable(credentials);
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
