/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';

test.describe('Firefox Desktop Sync v3 email first', () => {
  test('open directly to /signin page, refresh on the /signin page', async ({
    target,
    syncBrowserPages: { configPage, page, signin },
    testAccountTracker,
  }) => {
    const config = await configPage.getConfig();
    test.skip(
      config.showReactApp.signInRoutes === true,
      'With react, reloading the page does not redirect away from signin'
    );
    const credentials = await testAccountTracker.signUpSync();

    await page.goto(
      `${target.contentServerUrl}/signin?context=fx_desktop_v3&service=sync&action=email`,
      { waitUntil: 'load' }
    );
    await signin.fillOutEmailFirstForm(credentials.email);

    // Verify user is redirected to the password page
    await expect(signin.passwordFormHeading).toBeVisible();

    //Refresh the page
    await page.reload();

    // reloading should keep the user on the password page
    await expect(signin.syncSignInHeading).toBeVisible();
  });

  test('enter a firefox.com address', async ({
    target,
    syncBrowserPages: { signin, page },
  }) => {
    await page.goto(
      `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email`,
      { waitUntil: 'load' }
    );
    await signin.fillOutEmailFirstForm('testuser@firefox.com');

    // Verify the error
    await expect(
      page.getByText(
        'Enter a valid email address. firefox.com does not offer email.'
      )
    ).toBeVisible();
  });
});
