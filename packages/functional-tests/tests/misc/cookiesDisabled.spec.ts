/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';

//Add `disable_local_storage` to the URL to synthesize cookies being disabled.
test.describe('cookies disabled', () => {
  test.beforeEach(async ({ pages: { signin } }) => {
    await signin.clearCache();
  });

  test('visit signup page with localStorage disabled', async ({
    target,
    page,
    pages: { configPage, cookiesDisabled },
  }) => {
    const config = await configPage.getConfig();
    test.fixme(
      config.showReactApp.emailFirstRoutes === true &&
        config.rolloutRates.generalizedReactApp > 0,
      'FXA-11428 fix redirect to cookies_disabled when cookies disabled, and review testing approach - tests were passing even though redirect is not working when cookies are truly disabled'
    );
    //Goto cookies disabled url
    await page.goto(`${target.contentServerUrl}?disable_local_storage=1`);

    //Adding the timeout as the page closes before loading
    await page.waitForTimeout(2000);

    //Verify the Cookies disabled header
    await page.waitForURL(/\/cookies_disabled/);
    await expect(await cookiesDisabled.cookiesDisabledHeader()).toBeVisible();

    //Click retry
    await cookiesDisabled.clickRetry();

    //Verify the error
    await expect(await cookiesDisabled.isCookiesDiabledError()).toBeVisible();
  });

  test('synthesize enabling cookies by visiting the enter email page, then cookies_disabled, then clicking "try again', async ({
    target,
    page,
    pages: { cookiesDisabled, signin },
  }) => {
    //Goto cookies enabled url
    await page.goto(target.contentServerUrl, {
      waitUntil: 'load',
    });

    //Verify Email header
    await expect(signin.emailFirstHeading).toBeVisible();

    //Goto cookies disabled url
    await page.goto(`${target.contentServerUrl}/cookies_disabled`, {
      waitUntil: 'load',
    });

    //Adding the timeout as the page closes before loading
    await page.waitForTimeout(500);

    //Verify the Cookies disabled header
    await page.waitForURL(/\/cookies_disabled/);
    await expect(await cookiesDisabled.cookiesDisabledHeader()).toBeVisible();

    //Click retry
    await cookiesDisabled.clickRetry();
    await page.waitForLoadState();

    //Verify Email header
    await expect(signin.emailFirstHeading).toBeVisible();
  });

  test('visit verify page with localStorage disabled', async ({
    target,
    page,
    pages: { cookiesDisabled },
  }) => {
    //Goto cookies enabled url
    await page.goto(
      `${target.contentServerUrl}/verify_email?disable_local_storage=1&uid=240103bbecd645848103021e7d245bcb&code=fc46f44802b2a2ce979f39b2187aa1c0`,
      {
        waitUntil: 'load',
      }
    );
    await page.waitForURL(/\/cookies_disabled/);

    // Verify the Cookies disabled header
    // Updated in FXA-9323 as waitForTimeOut tests can be flaky in production:
    // https://playwright.dev/docs/api/class-page#page-wait-for-timeout
    await expect(cookiesDisabled.cookiesDisabledHeader()).resolves.toBeVisible({
      timeout: 500,
    });
  });
});
