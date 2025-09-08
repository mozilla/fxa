/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';
import { syncDesktopOAuthQueryParams } from '../../lib/query-params';
import { getTotpCode } from '../../lib/totp';

const ENTRYPOINT_123Done = 'purple';
const CLIENTID_123Done = 'dcdb5ae7add825d2';
const ENTRYPOINT_SYNC = 'firefox-cms';
const CLIENTID_SYNC = '5882386c6d801776';

test.describe('severity-1 #smoke', () => {
  test.describe('CMS customization with 2FA flows', () => {
    let config: any;

    async function assertCmsCustomization(
      page: any,
      {
        headline,
        description,
        logoUrl,
        logoAlt = '123Done logo',
        buttonColor,
        buttonText,
      }: {
        headline: string;
        description?: string;
        logoUrl?: string;
        logoAlt?: string;
        buttonColor: string;
        buttonText: string;
      }
    ) {
      await expect(page.getByRole('heading', { name: headline })).toBeVisible();

      if (description) {
        await expect(page.getByText(description)).toBeVisible();
      }

      if (logoUrl) {
        const logo = page.getByRole('img', { name: logoAlt, exact: true });
        await expect(logo).toBeVisible();
        await expect(logo).toHaveAttribute('src', logoUrl);
      }

      const button = page.getByRole('button', {
        name: buttonText,
        exact: true,
      });
      await expect(button).toBeVisible();
      await expect(button).toHaveClass(/cta-primary-cms/);
      await expect(button).toHaveClass(/cta-xl/);
      await expect(button).toHaveClass(/cta-primary/);
      await expect(button).toHaveCSS('--cta-bg', buttonColor);
      await expect(button).toHaveCSS('--cta-border', buttonColor);
      await expect(button).toHaveCSS('--cta-active', buttonColor);
      await expect(button).toHaveCSS('--cta-disabled', `${buttonColor}60`);
    }

    test.beforeAll(async ({ target }) => {
      // These tests require customizations for 123Done and Sync. Please contact
      // account developer to get access to Strapi dev instance.
      const relierConfig = await target.authClient.getCmsConfig(
        CLIENTID_123Done,
        ENTRYPOINT_123Done
      );
      const syncConfig = await target.authClient.getCmsConfig(
        CLIENTID_SYNC,
        ENTRYPOINT_SYNC
      );

      // Check if configs are empty or null/undefined
      const isConfigEmpty = (config: any): boolean => {
        return (
          !config ||
          typeof config !== 'object' ||
          Object.keys(config).length === 0
        );
      };

      test.skip(
        isConfigEmpty(relierConfig) || isConfigEmpty(syncConfig),
        'CMS customization is not set up for 123Done or Sync'
      );

      // SmsClient is lazy loaded, check these flags to ensure it is initialized
      const isEnabled =
        target.smsClient.isRedisEnabled() || target.smsClient.isTwilioEnabled();
      test.skip(!isEnabled, 'SMS client needs redis or twilio to be enabled');
    });

    test.beforeEach(async ({ pages: { configPage } }) => {
      // Ensure that cms customization is enabled
      config = await configPage.getConfig();
      test.skip(
        config.cms.enabled !== true,
        'CMS customization is not enabled'
      );
    });

    test('enable 2FA and signin with TOTP - 123Done', async ({
      target,
      page,
      pages: { signin, relier, settings, totp, signinTotpCode },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();

      // First, sign in and enable 2FA
      await relier.goto(`entrypoint=${ENTRYPOINT_123Done}`);
      await relier.clickEmailFirst();

      await assertCmsCustomization(page, {
        headline: 'Make Space for What Matters',
        description:
          'Start your clutter-free to-do list with 123Done. Sign up with your email to create a Mozilla account and get started today.',
        logoUrl:
          'https://accounts-cdn.stage.mozaws.net/other/123Done-blue-logo.svg',
        buttonColor: '#4845D2',
        buttonText: 'Create My List',
      });

      await page
        .getByRole('textbox', { name: 'Email' })
        .fill(credentials.email);
      let submitButton = page.getByRole('button', {
        name: 'Create My List',
        exact: true,
      });
      await submitButton.click();

      await assertCmsCustomization(page, {
        headline: 'Enter your password',
        description: 'for your Mozilla account',
        logoUrl:
          'https://accounts-cdn.stage.mozaws.net/other/123Done-blue-logo.svg',
        buttonColor: '#4845D2',
        buttonText: 'Sign in',
      });
      await signin.passwordTextbox.fill(credentials.password);
      submitButton = page.getByRole('button', { name: 'Sign in', exact: true });
      await submitButton.click();

      // Verify successful login and go to settings
      expect(await relier.isLoggedIn()).toBe(true);
      await settings.goto();

      // Enable 2FA
      await expect(settings.totp.status).toHaveText('Disabled');
      await settings.totp.addButton.click();
      await settings.confirmMfaGuard(credentials.email);

      // Set up 2FA with QR code and backup codes
      const { secret } =
        await totp.setUpTwoStepAuthWithQrAndBackupCodesChoice();

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.alertBar).toHaveText(
        'Two-step authentication has been enabled'
      );
      await expect(settings.totp.status).toHaveText('Enabled');

      // Sign out
      await settings.signOut();
      await relier.goto(`entrypoint=${ENTRYPOINT_123Done}`);
      await relier.signOut();

      // Sign in again with 2FA
      await relier.goto(`entrypoint=${ENTRYPOINT_123Done}`);
      await relier.clickEmailFirst();

      await assertCmsCustomization(page, {
        headline: 'Make Space for What Matters',
        description:
          'Start your clutter-free to-do list with 123Done. Sign up with your email to create a Mozilla account and get started today.',
        logoUrl:
          'https://accounts-cdn.stage.mozaws.net/other/123Done-blue-logo.svg',
        buttonColor: '#4845D2',
        buttonText: 'Create My List',
      });

      await page
        .getByRole('textbox', { name: 'Email' })
        .fill(credentials.email);
      submitButton = page.getByRole('button', {
        name: 'Create My List',
        exact: true,
      });
      await submitButton.click();

      await assertCmsCustomization(page, {
        headline: 'Enter your password',
        description: 'for your Mozilla account',
        logoUrl:
          'https://accounts-cdn.stage.mozaws.net/other/123Done-blue-logo.svg',
        buttonColor: '#4845D2',
        buttonText: 'Sign in',
      });
      await signin.passwordTextbox.fill(credentials.password);
      submitButton = page.getByRole('button', { name: 'Sign in', exact: true });
      await submitButton.click();

      // Should now be on TOTP code page
      await expect(page).toHaveURL(/signin_totp_code/);

      await assertCmsCustomization(page, {
        headline: 'Enter two-step authentication code',
        description: '',
        logoUrl:
          'https://accounts-cdn.stage.mozaws.net/other/123Done-blue-logo.svg',
        buttonColor: '#4845D2',
        buttonText: 'Confirm',
      });

      // Enter TOTP code
      const totpCode = await getTotpCode(secret);
      await signinTotpCode.fillOutCodeForm(totpCode);

      // Verify successful login
      expect(await relier.isLoggedIn()).toBe(true);

      // Cleanup
      await settings.goto();
      await settings.disconnectTotp();
    });

    test('enable 2FA and signin with recovery phone - 123Done', async ({
      target,
      page,
      pages: {
        signin,
        relier,
        settings,
        totp,
        signinRecoveryPhone,
        recoveryPhone,
      },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();

      // First, sign in and enable 2FA
      await relier.goto(`entrypoint=${ENTRYPOINT_123Done}`);
      await relier.clickEmailFirst();

      await assertCmsCustomization(page, {
        headline: 'Make Space for What Matters',
        description:
          'Start your clutter-free to-do list with 123Done. Sign up with your email to create a Mozilla account and get started today.',
        logoUrl:
          'https://accounts-cdn.stage.mozaws.net/other/123Done-blue-logo.svg',
        buttonColor: '#4845D2',
        buttonText: 'Create My List',
      });

      await page
        .getByRole('textbox', { name: 'Email' })
        .fill(credentials.email);
      let submitButton = page.getByRole('button', {
        name: 'Create My List',
        exact: true,
      });
      await submitButton.click();

      await assertCmsCustomization(page, {
        headline: 'Enter your password',
        description: 'for your Mozilla account',
        logoUrl:
          'https://accounts-cdn.stage.mozaws.net/other/123Done-blue-logo.svg',
        buttonColor: '#4845D2',
        buttonText: 'Sign in',
      });
      await signin.passwordTextbox.fill(credentials.password);
      submitButton = page.getByRole('button', { name: 'Sign in', exact: true });
      await submitButton.click();

      // Verify successful login and go to settings
      expect(await relier.isLoggedIn()).toBe(true);
      await settings.goto();

      // Enable 2FA
      await expect(settings.totp.status).toHaveText('Disabled');
      await settings.totp.addButton.click();
      await settings.confirmMfaGuard(credentials.email);

      // Set up 2FA with QR code and recovery phone
      await totp.startTwoStepAuthWithQrCodeAndRecoveryPhoneChoice();

      await expect(recoveryPhone.addHeader()).toBeVisible();

      await recoveryPhone.enterPhoneNumber(target.smsClient.getPhoneNumber());
      await recoveryPhone.clickSendCode();

      await expect(recoveryPhone.confirmHeader).toBeVisible();

      const code = await target.smsClient.getCode({ ...credentials });

      await recoveryPhone.enterCode(code);
      await recoveryPhone.clickConfirm();

      await page.waitForURL(/settings/);

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.alertBar).toHaveText(
        'Two-step authentication has been enabled'
      );
      await expect(settings.totp.status).toHaveText('Enabled');

      // Sign out
      await settings.signOut();

      await relier.goto(`entrypoint=${ENTRYPOINT_123Done}`);
      await relier.signOut();

      // Sign in again with 2FA
      await relier.clickEmailFirst();

      await assertCmsCustomization(page, {
        headline: 'Make Space for What Matters',
        description:
          'Start your clutter-free to-do list with 123Done. Sign up with your email to create a Mozilla account and get started today.',
        logoUrl:
          'https://accounts-cdn.stage.mozaws.net/other/123Done-blue-logo.svg',
        buttonColor: '#4845D2',
        buttonText: 'Create My List',
      });

      await page
        .getByRole('textbox', { name: 'Email' })
        .fill(credentials.email);
      submitButton = page.getByRole('button', {
        name: 'Create My List',
        exact: true,
      });
      await submitButton.click();

      await assertCmsCustomization(page, {
        headline: 'Enter your password',
        description: 'for your Mozilla account',
        logoUrl:
          'https://accounts-cdn.stage.mozaws.net/other/123Done-blue-logo.svg',
        buttonColor: '#4845D2',
        buttonText: 'Sign in',
      });
      await signin.passwordTextbox.fill(credentials.password);
      submitButton = page.getByRole('button', { name: 'Sign in', exact: true });
      await submitButton.click();

      // Should now be on TOTP code page
      await expect(page).toHaveURL(/signin_totp_code/);

      await assertCmsCustomization(page, {
        headline: 'Enter two-step authentication code',
        description: '',
        logoUrl:
          'https://accounts-cdn.stage.mozaws.net/other/123Done-blue-logo.svg',
        buttonColor: '#4845D2',
        buttonText: 'Confirm',
      });

      // Click trouble entering code to use recovery phone
      await page.getByRole('link', { name: 'Trouble entering code?' }).click();

      // Should be on recovery phone page
      await expect(page).toHaveURL(/signin_recovery_phone/);

      await assertCmsCustomization(page, {
        headline: 'Enter recovery code',
        logoUrl:
          'https://accounts-cdn.stage.mozaws.net/other/123Done-blue-logo.svg',
        buttonColor: '#4845D2',
        buttonText: 'Confirm',
      });

      // Get SMS code and enter it
      const smsCode = await target.smsClient.getCode({ ...credentials });

      await signinRecoveryPhone.enterCode(smsCode);
      await signinRecoveryPhone.clickConfirm();

      // Verify successful login
      expect(await relier.isLoggedIn()).toBe(true);

      // Cleanup
      await settings.goto();
      await settings.disconnectTotp();
    });

    test('enable 2FA and signin with backup recovery code - 123Done', async ({
      target,
      page,
      pages: { signin, relier, settings, totp, signinRecoveryCode },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();

      // First, sign in and enable 2FA
      await relier.goto(`entrypoint=${ENTRYPOINT_123Done}`);
      await relier.clickEmailFirst();

      await assertCmsCustomization(page, {
        headline: 'Make Space for What Matters',
        description:
          'Start your clutter-free to-do list with 123Done. Sign up with your email to create a Mozilla account and get started today.',
        logoUrl:
          'https://accounts-cdn.stage.mozaws.net/other/123Done-blue-logo.svg',
        buttonColor: '#4845D2',
        buttonText: 'Create My List',
      });

      await page
        .getByRole('textbox', { name: 'Email' })
        .fill(credentials.email);
      let submitButton = page.getByRole('button', {
        name: 'Create My List',
        exact: true,
      });
      await submitButton.click();

      await assertCmsCustomization(page, {
        headline: 'Enter your password',
        description: 'for your Mozilla account',
        logoUrl:
          'https://accounts-cdn.stage.mozaws.net/other/123Done-blue-logo.svg',
        buttonColor: '#4845D2',
        buttonText: 'Sign in',
      });
      await signin.passwordTextbox.fill(credentials.password);
      submitButton = page.getByRole('button', { name: 'Sign in', exact: true });
      await submitButton.click();

      // Verify successful login and go to settings
      expect(await relier.isLoggedIn()).toBe(true);
      await settings.goto();

      // Enable 2FA
      await expect(settings.totp.status).toHaveText('Disabled');
      await settings.totp.addButton.click();
      await settings.confirmMfaGuard(credentials.email);

      // Set up 2FA with QR code and backup codes
      const { recoveryCodes } =
        await totp.setUpTwoStepAuthWithQrAndBackupCodesChoice();

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.alertBar).toHaveText(
        'Two-step authentication has been enabled'
      );
      await expect(settings.totp.status).toHaveText('Enabled');

      // Sign out
      await settings.signOut();

      // Sign in again with 2FA
      await relier.goto(`entrypoint=${ENTRYPOINT_123Done}`);
      await relier.signOut();

      await relier.clickEmailFirst();

      await assertCmsCustomization(page, {
        headline: 'Make Space for What Matters',
        description:
          'Start your clutter-free to-do list with 123Done. Sign up with your email to create a Mozilla account and get started today.',
        logoUrl:
          'https://accounts-cdn.stage.mozaws.net/other/123Done-blue-logo.svg',
        buttonColor: '#4845D2',
        buttonText: 'Create My List',
      });

      await page
        .getByRole('textbox', { name: 'Email' })
        .fill(credentials.email);
      submitButton = page.getByRole('button', {
        name: 'Create My List',
        exact: true,
      });
      await submitButton.click();

      await assertCmsCustomization(page, {
        headline: 'Enter your password',
        description: 'for your Mozilla account',
        logoUrl:
          'https://accounts-cdn.stage.mozaws.net/other/123Done-blue-logo.svg',
        buttonColor: '#4845D2',
        buttonText: 'Sign in',
      });
      await signin.passwordTextbox.fill(credentials.password);
      submitButton = page.getByRole('button', { name: 'Sign in', exact: true });
      await submitButton.click();

      // Should now be on TOTP code page
      await expect(page).toHaveURL(/signin_totp_code/);

      await assertCmsCustomization(page, {
        headline: 'Enter two-step authentication code',
        description: '',
        logoUrl:
          'https://accounts-cdn.stage.mozaws.net/other/123Done-blue-logo.svg',
        buttonColor: '#4845D2',
        buttonText: 'Confirm',
      });

      // Click trouble entering code to use recovery code
      await page.getByRole('link', { name: 'Trouble entering code?' }).click();

      // Should be on recovery code page
      await expect(page).toHaveURL(/signin_recovery_code/);

      await assertCmsCustomization(page, {
        headline: 'Enter backup authentication code',
        description: '',
        logoUrl:
          'https://accounts-cdn.stage.mozaws.net/other/123Done-blue-logo.svg',
        buttonColor: '#4845D2',
        buttonText: 'Confirm',
      });

      // Enter recovery code
      await signinRecoveryCode.fillOutCodeForm(recoveryCodes[0]);

      // Verify successful login
      expect(await relier.isLoggedIn()).toBe(true);

      // Cleanup
      await settings.goto();
      await settings.disconnectTotp();
    });

    test('enable 2FA and signin with TOTP - Sync', async ({
      target,
      syncOAuthBrowserPages: { page, signin, settings, totp, signinTotpCode },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();

      // First, sign in and enable 2FA
      syncDesktopOAuthQueryParams.set('entrypoint', ENTRYPOINT_SYNC);
      await signin.goto('/authorization', syncDesktopOAuthQueryParams);

      await assertCmsCustomization(page, {
        headline: 'Continue to your Mozilla account',
        description:
          'Sync your passwords, tabs, and bookmarks everywhere you use Firefox.',
        logoUrl:
          'https://accounts-cdn.stage.mozaws.net/other/firefox-browser-logo.svg',
        logoAlt: 'Firefox logo',
        buttonColor: '#FF630B',
        buttonText: 'Sign up or sign in',
      });

      await page
        .getByRole('textbox', { name: 'Email' })
        .fill(credentials.email);
      let submitButton = page.getByRole('button', {
        name: 'Sign up or sign in',
        exact: true,
      });
      await submitButton.click();

      await assertCmsCustomization(page, {
        headline: 'Enter your password',
        description: 'for your Mozilla account',
        logoUrl:
          'https://accounts-cdn.stage.mozaws.net/other/firefox-browser-logo.svg',
        logoAlt: 'Firefox logo',
        buttonColor: '#FF630B',
        buttonText: 'Sign in',
      });
      await page.getByTestId('input-field').fill(credentials.password);

      submitButton = page.getByRole('button', { name: 'Sign in', exact: true });
      await submitButton.click();

      await page.waitForURL(/pair/);

      await page.getByRole('link', { name: 'Not now' }).click();

      // Verify successful login and go to settings
      await expect(page).toHaveURL(/settings/);
      await settings.goto();

      // Enable 2FA
      await expect(settings.totp.status).toHaveText('Disabled');
      await settings.totp.addButton.click();
      await settings.confirmMfaGuard(credentials.email);

      // Set up 2FA with QR code and backup codes
      const { secret } =
        await totp.setUpTwoStepAuthWithQrAndBackupCodesChoice();

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.alertBar).toHaveText(
        'Two-step authentication has been enabled'
      );
      await expect(settings.totp.status).toHaveText('Enabled');

      // Sign out
      await settings.signOut();

      // Sign in again with 2FA
      syncDesktopOAuthQueryParams.set('entrypoint', ENTRYPOINT_SYNC);
      await signin.goto('/authorization', syncDesktopOAuthQueryParams);

      await assertCmsCustomization(page, {
        headline: 'Continue to your Mozilla account',
        description:
          'Sync your passwords, tabs, and bookmarks everywhere you use Firefox.',
        logoUrl:
          'https://accounts-cdn.stage.mozaws.net/other/firefox-browser-logo.svg',
        logoAlt: 'Firefox logo',
        buttonColor: '#FF630B',
        buttonText: 'Sign up or sign in',
      });

      await page
        .getByRole('textbox', { name: 'Email' })
        .fill(credentials.email);
      submitButton = page.getByRole('button', {
        name: 'Sign up or sign in',
        exact: true,
      });
      await submitButton.click();

      await assertCmsCustomization(page, {
        headline: 'Enter your password',
        description: 'for your Mozilla account',
        logoUrl:
          'https://accounts-cdn.stage.mozaws.net/other/firefox-browser-logo.svg',
        logoAlt: 'Firefox logo',
        buttonColor: '#FF630B',
        buttonText: 'Sign in',
      });
      await page.getByTestId('input-field').fill(credentials.password);

      submitButton = page.getByRole('button', { name: 'Sign in', exact: true });
      await submitButton.click();

      // Should now be on TOTP code page
      await expect(page).toHaveURL(/signin_totp_code/);

      await assertCmsCustomization(page, {
        headline: 'Enter two-step authentication code',
        logoUrl:
          'https://accounts-cdn.stage.mozaws.net/other/firefox-browser-logo.svg',
        logoAlt: 'Firefox logo',
        buttonColor: '#FF630B',
        buttonText: 'Confirm',
      });

      // Enter TOTP code
      const totpCode = await getTotpCode(secret);
      await signinTotpCode.fillOutCodeForm(totpCode);

      await page.waitForURL(/pair/);

      await page.getByRole('link', { name: 'Not now' }).click();

      // Verify successful login
      await expect(page).toHaveURL(/settings/);
      await expect(settings.settingsHeading).toBeVisible();

      // Cleanup
      await settings.disconnectTotp();
    });
  });
});
