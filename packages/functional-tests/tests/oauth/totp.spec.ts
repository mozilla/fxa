/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page, expect, test } from '../../lib/fixtures/standard';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { TestAccountTracker } from '../../lib/testAccountTracker';
import { LoginPage } from '../../pages/login';

test.describe('severity-1 #smoke', () => {
  test.describe('OAuth totp', () => {
    test.beforeEach(async () => {
      test.slow();
    });

    test('can add TOTP to account and confirm oauth signin', async ({
      target,
      pages: { page, login, relier, settings, totp },
      testAccountTracker,
    }) => {
      const credentials = await signInAccount(
        target,
        page,
        login,
        testAccountTracker
      );

      await settings.goto();
      await settings.totp.addButton.click();
      const { secret } = await totp.fillOutTotpForms();
      await settings.signOut();
      await relier.goto();
      await relier.clickEmailFirst();
      await login.login(credentials.email, credentials.password);
      await login.setTotp(secret);

      expect(await relier.isLoggedIn()).toBe(true);

      await settings.goto();
      await settings.disconnectTotp();
    });

    test('can remove TOTP from account and skip confirmation', async ({
      target,
      pages: { login, relier, settings, totp, page },
      testAccountTracker,
    }) => {
      await signInAccount(target, page, login, testAccountTracker);
      await settings.goto();
      await settings.totp.addButton.click();
      await totp.fillOutTotpForms();
      await settings.totp.disableButton.click();
      await settings.clickModalConfirm();

      // wait for alert bar message
      await expect(
        page.getByText('Two-step authentication disabled')
      ).toBeVisible();
      await expect(settings.totp.status).toHaveText('Not Set');

      await relier.goto();
      await relier.clickEmailFirst();
      await login.submit();

      expect(await relier.isLoggedIn()).toBe(true);
    });
  });
});

async function signInAccount(
  target: BaseTarget,
  page: Page,
  login: LoginPage,
  testAccountTracker: TestAccountTracker
): Promise<Credentials> {
  const credentials = await testAccountTracker.signUp();
  await page.goto(target.contentServerUrl);
  await login.fillOutEmailFirstSignIn(credentials.email, credentials.password);

  //Verify logged in on Settings page
  expect(await login.isUserLoggedIn()).toBe(true);

  return credentials;
}
