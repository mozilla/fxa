/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';
import { syncDesktopOAuthQueryParams } from '../../lib/query-params';
import { Page } from '@playwright/test';

const ENTRYPOINT_123Done = 'purple';
const CLIENTID_123Done = 'dcdb5ae7add825d2';
const ENTRYPOINT_SYNC = 'firefox-cms';
const CLIENTID_SYNC = '5882386c6d801776';

test.describe('severity-1 #smoke', () => {
  test.describe('CMS customization', () => {
    async function assertCmsCustomization(
      page: Page,
      {
        headline,
        description,
        logoUrl,
        logoAlt = '123Done logo',
        buttonColor,
        buttonText,
      }: {
        headline: string;
        description: string;
        logoUrl?: string;
        logoAlt?: string;
        buttonColor: string;
        buttonText: string;
      }
    ) {
      await expect(page.getByRole('heading', { name: headline })).toBeVisible();
      await expect(page.getByText(description)).toBeVisible();

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
    });

    test.beforeEach(async ({ pages: { configPage } }) => {
      // Ensure that cms customization is enabled
      const config = await configPage.getConfig();
      test.skip(
        config.cms.enabled !== true,
        'CMS customization is not enabled'
      );
    });

    test.describe('Relying Party customization', () => {
      test('default experience with invalid entrypoint', async ({
        target,
        page,
        pages: { relier },
        testAccountTracker,
      }) => {
        await testAccountTracker.generateAccountDetails();

        await relier.goto('entrypoint=invalid');
        await relier.clickEmailFirst();

        await expect(
          page.getByRole('heading', { name: 'Enter your email' })
        ).toBeVisible();
        const button = page.getByRole('button', {
          name: 'Sign up or sign in',
          exact: true,
        });
        await expect(button).not.toHaveClass(/cta-primary-cms/);

        // Assert no logo is shown
        const logo = page.getByRole('img', { name: '123Done logo' });
        await expect(logo).not.toBeVisible();
      });

      test('signup', async ({
        target,
        page,
        pages: { signin, relier },
        testAccountTracker,
      }) => {
        const credentials = await testAccountTracker.generateAccountDetails();

        // Navigate to the CMS entrypoint
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
          headline: 'Create Your Password',
          description:
            'Keep your account private and secure. Set a password for your Mozilla account and get started with 123Done.',
          logoUrl:
            'https://accounts-cdn.stage.mozaws.net/other/123Done-blue-logo.svg',
          buttonColor: '#4845D2',
          buttonText: 'Continue',
        });
        await signin.passwordTextbox.fill(credentials.password);
        submitButton = page.getByRole('button', {
          name: 'Continue',
          exact: true,
        });
        await submitButton.click();

        await assertCmsCustomization(page, {
          headline: 'Almost There',
          description:
            'Just one quick step. Enter the code from your email to activate your Mozilla account and unlock 123Done.',
          logoUrl:
            'https://accounts-cdn.stage.mozaws.net/other/123Done-blue-logo.svg',
          buttonColor: '#4845D2',
          buttonText: 'Finish Setup',
        });
        const code = await target.emailClient.getVerifyShortCode(
          credentials.email
        );
        await page.getByLabel('Enter 6-digit code').fill(code);
        submitButton = page.getByRole('button', {
          name: 'Finish Setup',
          exact: true,
        });
        await submitButton.click();

        // Verify successful login
        expect(await relier.isLoggedIn()).toBe(true);
      });

      test('signin', async ({
        target,
        page,
        pages: { signin, relier },
        testAccountTracker,
      }) => {
        const credentials = await testAccountTracker.signUp();

        // Navigate to the CMS entrypoint
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
        submitButton = page.getByRole('button', {
          name: 'Sign in',
          exact: true,
        });
        await submitButton.click();

        // Verify successful login
        expect(await relier.isLoggedIn()).toBe(true);
      });

      test('signup with Sync', async ({
        target,
        syncOAuthBrowserPages: { page, signup },
        testAccountTracker,
      }) => {
        const credentials = testAccountTracker.generateAccountDetails();

        syncDesktopOAuthQueryParams.set('entrypoint', ENTRYPOINT_SYNC);
        await signup.goto('/authorization', syncDesktopOAuthQueryParams);

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
          headline: 'Create a password',
          description:
            'Sync your passwords, payment methods, bookmarks, and more everywhere you use Firefox.',
          logoUrl:
            'https://accounts-cdn.stage.mozaws.net/other/firefox-browser-logo.svg',
          logoAlt: 'Firefox logo',
          buttonColor: '#FF630B',
          buttonText: 'Create account',
        });
        await page
          .getByTestId('new-password-input-field')
          .fill(credentials.password);
        await page
          .getByTestId('verify-password-input-field')
          .fill(credentials.password);
        submitButton = page.getByRole('button', {
          name: 'Create account',
          exact: true,
        });
        await submitButton.click();

        await assertCmsCustomization(page, {
          headline: 'Enter confirmation code',
          description:
            'Just one quick step. Enter the code from your email to activate your Mozilla account.',
          logoUrl:
            'https://accounts-cdn.stage.mozaws.net/other/firefox-browser-logo.svg',
          logoAlt: 'Firefox logo',
          buttonColor: '#FF630B',
          buttonText: 'Start syncing',
        });
        const code = await target.emailClient.getVerifyShortCode(
          credentials.email
        );
        await page.getByLabel('Enter 6-digit code').fill(code);
        submitButton = page.getByRole('button', {
          name: 'Start syncing',
          exact: true,
        });
        await submitButton.click();

        await assertCmsCustomization(page, {
          headline: 'Sync is turned on',
          description:
            'Your passwords, payment methods, addresses, bookmarks, history, and more can sync everywhere you use Firefox.',
          buttonColor: '#FF630B',
          buttonText: 'Add another device',
        });
      });

      test('signin with Sync', async ({
        syncOAuthBrowserPages: { page, signin },
        testAccountTracker,
      }) => {
        const credentials = await testAccountTracker.signUp();

        // Navigate to the CMS entrypoint
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

        submitButton = page.getByRole('button', {
          name: 'Sign in',
          exact: true,
        });
        await submitButton.click();

        await page.getByRole('link', { name: 'Not now', exact: true }).click();
      });

      test('signin login confirmation with Sync', async ({
        target,
        syncOAuthBrowserPages: { page, signin, relier },
        testAccountTracker,
      }) => {
        const credentials = await testAccountTracker.signUpSync();

        // Navigate to the CMS entrypoint
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

        await page.waitForURL(/signin/);

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

        submitButton = page.getByRole('button', {
          name: 'Sign in',
          exact: true,
        });
        await submitButton.click();

        await page.waitForURL(/signin_token_code/);

        await assertCmsCustomization(page, {
          headline: 'Enter confirmation code',
          description: 'for your Mozilla account',
          logoUrl:
            'https://accounts-cdn.stage.mozaws.net/other/firefox-browser-logo.svg',
          logoAlt: 'Firefox logo',
          buttonColor: '#FF630B',
          buttonText: 'Confirm',
        });
        const code = await target.emailClient.getVerifyLoginCode(
          credentials.email
        );
        await page.getByLabel('Enter 6-digit code').fill(code);
        submitButton = page.getByRole('button', {
          name: 'Confirm',
          exact: true,
        });
        await submitButton.click();

        await page.getByRole('link', { name: 'Not now', exact: true }).click();
      });
    });
  });
});
