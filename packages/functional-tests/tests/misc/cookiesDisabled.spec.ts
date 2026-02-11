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

    //Verify the Cookies disabled header
    await page.waitForURL(/\/cookies_disabled/);
    await expect(await cookiesDisabled.cookiesDisabledHeader()).toBeVisible();

    //Click retry
    await cookiesDisabled.clickRetry();
    // this is needed in this test but manual clicking once works just fine in
    // a manual test so
    await cookiesDisabled.clickRetry();

    //Verify the error
    await expect(await cookiesDisabled.isCookiesDiabledError()).toBeVisible();
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
