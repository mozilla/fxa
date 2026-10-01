/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';

test.describe('severity-2', () => {
  test.beforeEach(
    async ({
      target,
      page,
      pages: { signin, settings },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      await page.goto(target.contentServerUrl);
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);
      await expect(settings.settingsHeading).toBeVisible();
    }
  );

  test('settings shows the error dialog when the account fetch fails', async ({
    page,
    pages: { settings },
  }) => {
    await page.route('**/v1/account', (route) =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ code: 500, errno: 999, error: 'Internal' }),
      })
    );
    await settings.goto();

    await expect(settings.errorLoadingApp).toBeVisible();
    await expect(settings.settingsHeading).toBeHidden();
  });

  test('password row shows no created date without passwordCreatedAt', async ({
    page,
    pages: { settings },
  }) => {
    await page.route('**/v1/account', async (route) => {
      const response = await route.fetch();
      const body = await response.json();
      delete body.passwordCreatedAt;
      await route.fulfill({ response, json: body });
    });
    await settings.goto();

    await expect(settings.password.status).toHaveText('••••••••••••••••••');
    await expect(page.getByTestId('settings-security')).not.toContainText(
      'Created'
    );
  });
});
