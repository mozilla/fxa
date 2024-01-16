/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { EmailHeader, EmailType } from '../../lib/email';
import { test, expect } from '../../lib/fixtures/standard';

let signUpReactEnabled = false;
test.describe('severity-2 #smoke', () => {
  test.describe('redirect_to', () => {
    test.beforeEach(
      async ({ credentials, pages: { settings, login, configPage } }) => {
        const config = await configPage.getConfig();
        signUpReactEnabled = config.showReactApp.signUpRoutes === true;

        await settings.goto();
        await settings.signOut();
        await login.login(credentials.email, credentials.password);
      }
    );

    async function engageRedirect(page, target, redirectTo, email: string) {
      await page.goto(
        `${target.contentServerUrl}/confirm_signup_code?redirect_to=${redirectTo}`
      );
      // In React, we show the message after the user submits
      if (signUpReactEnabled) {
        const emailNewCodeText = 'text=/Email new code/';
        await page.waitForSelector(emailNewCodeText);
        page.click(emailNewCodeText);
        const code = await target.email.waitForEmail(
          email,
          EmailType.verifyLoginCode,
          EmailHeader.signinCode
        );
        page.getByLabel('Enter 6-digit code').fill(code);
      }
      await page.click('button[type=submit]');
    }

    test('prevent invalid redirect_to parameter', async ({
      credentials,
      target,
      pages: { page },
    }) => {
      const redirectTo = 'https://evil.com/';
      await engageRedirect(page, target, redirectTo, credentials.email);
      await page.waitForSelector('text=/Invalid redirect/');
      expect(page.url).not.toEqual(redirectTo);
    });

    test('prevent xss in redirect_to parameter', async ({
      credentials,
      target,
      pages: { page },
    }) => {
      const redirectTo = 'javascript:alert(1)';
      await engageRedirect(page, target, redirectTo, credentials.email);
      await page.waitForSelector('text=/Invalid redirect/');
    });

    test('allows valid redirect_to parameter', async ({
      credentials,
      target,
      pages: { page },
    }) => {
      const redirectTo = `${target.contentServerUrl}/settings`;
      await page.goto(
        `${target.contentServerUrl}/confirm_signup_code?redirect_to=${redirectTo}`
      );
      // In React, we show the message after the user submits
      if (signUpReactEnabled) {
        const emailNewCodeText = 'text=/Email new code/';
        await page.waitForSelector(emailNewCodeText);
        page.click(emailNewCodeText);
        const code = await target.email.waitForEmail(
          credentials.email,
          EmailType.verifyLoginCode,
          EmailHeader.signinCode
        );
        page.getByLabel('Enter 6-digit code').fill(code);
      }
      await page.click('button[type=submit]');
      await page.waitForURL(redirectTo);
    });
  });
});
