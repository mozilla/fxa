/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BrowserContext } from '@playwright/test';
import { expect, Page, test } from '../../lib/fixtures/standard';
import { BaseTarget } from '../../lib/targets/base';

test.describe('severity-1 #smoke', () => {
  test('settings opens in multiple tabs with same account', async ({
    context,
    target,
    page,
    pages: { signin, settings },
    testAccountTracker,
  }) => {
    const pages = [signin, settings];
    const credentials1 = await testAccountTracker.signUp();
    await page.goto(target.contentServerUrl);
    await signin.fillOutEmailFirstForm(credentials1.email);
    await signin.fillOutPasswordForm(credentials1.password);
    await expect(settings.settingsHeading).toBeVisible();

    // Signin on new tab, and then sign out
    await openNewTab(context, target, pages);
    await signin.signInButton.click();
    await expect(settings.settingsHeading).toBeVisible();
    await settings.signOut();
    await expect(signin.emailFirstHeading).toBeVisible();

    // Switch focus to 1st tab. Page should logout, since
    // account on other tab logged out.
    await activateTab(page, pages);
    await expect(signin.emailFirstHeading).toBeVisible();
  });

  test('settings opens in multiple tabs with different accounts', async ({
    context,
    target,
    page,
    pages: { signin, settings, signup, confirmSignupCode },
    testAccountTracker,
  }) => {
    const pages = [signin, settings, signup, confirmSignupCode];
    const credentials = await testAccountTracker.signUp();
    await page.goto(target.contentServerUrl);
    await signin.fillOutEmailFirstForm(credentials.email);
    await signin.fillOutPasswordForm(credentials.password);
    await expect(settings.settingsHeading).toBeVisible();

    // Signup on new tab
    const email2 = credentials.email.replace('@', '.2@');
    const password2 = credentials.password;

    await openNewTab(context, target, pages);
    await signin.useDifferentAccountLink.click();

    await signup.fillOutEmailForm(email2);
    await signup.fillOutSignupForm(password2, '21');
    const code = await target.emailClient.getVerifyShortCode(email2);
    await confirmSignupCode.fillOutCodeForm(code);
    await expect(settings.settingsHeading).toBeVisible();

    // Signout of 2nd tab
    await settings.signOut();
    await expect(signin.passwordFormHeading).toBeVisible();

    // Switch focus back to 1st tab. Page should NOT logout,
    // since this account is unaffected
    await activateTab(page, pages);
    await expect(settings.settingsHeading).toBeVisible();
  });

  test('settings opens in multiple tabs user clears local storage', async ({
    context,
    target,
    page,
    pages: { signin, settings },
    testAccountTracker,
  }) => {
    const pages = [signin, settings];
    const credentials = await testAccountTracker.signUp();
    await page.goto(target.contentServerUrl);
    await signin.fillOutEmailFirstForm(credentials.email);
    await signin.fillOutPasswordForm(credentials.password);
    await expect(settings.settingsHeading).toBeVisible();

    // Open new tab, and clear localstorage
    const newPage = await openNewTab(context, target, pages);
    await newPage.evaluate(() => {
      localStorage.removeItem('__fxa_storage.accounts');
    });

    // Switch focus to 1st tab. Page should logout, since
    // local storage has been wiped clean
    await activateTab(page, pages);
    await expect(signin.emailFirstHeading).toBeVisible();
  });

  test('settings opens in multiple tabs and apollo account cache is dropped', async ({
    context,
    target,
    page,
    pages: { signin, settings },
    testAccountTracker,
  }) => {
    test.skip(
      !/localhost/.test(target.contentServerUrl),
      'Access to apollo client is only available during in dev mode, which requires running on localhost.'
    );

    const credentials = await testAccountTracker.signUp();
    await page.goto(target.contentServerUrl);
    await signin.fillOutEmailFirstForm(credentials.email);
    await signin.fillOutPasswordForm(credentials.password);
    await expect(settings.settingsHeading).toBeVisible();

    // Signin on new tab
    await openNewTab(context, target, [signin, settings]);
    await signin.signInButton.click();
    await expect(settings.settingsHeading).toBeVisible();

    // Mutate apollo cache on page 1, and refocus
    await page.evaluate(() => {
      // @ts-ignore
      const client = window.__APOLLO_CLIENT__;
      if (client) {
        client.cache.modify({
          id: 'ROOT_QUERY',
          fields: {
            account: () => {
              return undefined;
            },
          },
          broadcast: false,
        });
      }
    });

    await activateTab(page, [signin, settings]);
    await expect(signin.cachedSigninHeading).toBeVisible();
  });

  async function openNewTab(
    context: BrowserContext,
    target: BaseTarget,
    pages: Array<{ page: Page }>
  ) {
    const page = await context.newPage();
    pages.forEach((x) => {
      x.page = page;
    });
    await page.goto(target.contentServerUrl);
    return page;
  }
  async function activateTab(page: Page, pages: Array<{ page: Page }>) {
    pages.forEach((x) => {
      x.page = page;
    });
    await page.bringToFront();
    await page.dispatchEvent('body', 'focus');
  }
});
