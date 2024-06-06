/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getCode } from 'fxa-settings/src/lib/totp';
import { Page, expect, test } from '../../lib/fixtures/standard';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { TestAccountTracker } from '../../lib/testAccountTracker';
import { SettingsPage } from '../../pages/settings';
import { SigninPage } from '../../pages/signin';

test.describe('severity-1 #smoke', () => {
  test.describe('OAuth totp', () => {
    test('can add TOTP to account and confirm oauth signin', async ({
      target,
      pages: { page, signin, relier, settings, totp, signinTotpCode },
      testAccountTracker,
    }) => {
      const credentials = await signInAccount(
        target,
        page,
        settings,
        signin,
        testAccountTracker
      );

      await settings.goto();
      await settings.totp.addButton.click();
      const { secret } = await totp.fillOutTotpForms();
      await settings.signOut();
      await relier.goto();
      await relier.clickEmailFirst();
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);
      await expect(page).toHaveURL(/signin_totp_code/);
      const code = await getCode(secret);
      await signinTotpCode.fillOutCodeForm(code);

      expect(await relier.isLoggedIn()).toBe(true);

      await settings.goto();
      await settings.disconnectTotp();
    });

    test('can remove TOTP from account and skip confirmation', async ({
      target,
      pages: { page, relier, settings, signin, totp },
      testAccountTracker,
    }) => {
      await signInAccount(target, page, settings, signin, testAccountTracker);
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
      await signin.signInButton.click();

      expect(await relier.isLoggedIn()).toBe(true);
    });
  });
});

async function signInAccount(
  target: BaseTarget,
  page: Page,
  settings: SettingsPage,
  signin: SigninPage,
  testAccountTracker: TestAccountTracker
): Promise<Credentials> {
  const credentials = await testAccountTracker.signUp();
  await page.goto(target.contentServerUrl);
  await signin.fillOutEmailFirstForm(credentials.email);
  await signin.fillOutPasswordForm(credentials.password);

  //Verify logged in on Settings page
  await expect(settings.settingsHeading).toBeVisible();

  return credentials;
}
