/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page, expect, test } from '../../lib/fixtures/standard';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { TestAccountTracker } from '../../lib/testAccountTracker';
import { SettingsPage } from '../../pages/settings';
import { SigninPage } from '../../pages/signin';

test.describe('severity-2 #smoke', () => {
  test('add the display name', async ({
    target,
    pages: { page, displayName, settings, signin },
    testAccountTracker,
  }) => {
    await signInAccount(target, page, settings, signin, testAccountTracker);

    await settings.goto();

    await expect(settings.displayName.status).toHaveText('None');

    await settings.displayName.addButton.click();
    await displayName.fillOutForm('TestUser1', true);

    await expect(settings.alertBar).toHaveText('Display name updated');
    await expect(settings.displayName.status).toHaveText('TestUser1');
  });

  test('cancel add the display name', async ({
    target,
    pages: { page, displayName, settings, signin },
    testAccountTracker,
  }) => {
    await signInAccount(target, page, settings, signin, testAccountTracker);

    await settings.goto();

    await expect(settings.displayName.status).toHaveText('None');

    await settings.displayName.addButton.click();

    await displayName.fillOutForm('TestUser1', false);
    await displayName.cancelButton.click();

    await expect(settings.displayName.status).toHaveText('None');
  });

  test('change the display name', async ({
    target,
    pages: { page, displayName, settings, signin },
    testAccountTracker,
  }) => {
    await signInAccount(target, page, settings, signin, testAccountTracker);

    await settings.goto();

    await expect(settings.displayName.status).toHaveText('None');

    await settings.displayName.addButton.click();
    await displayName.fillOutForm('TestUser1', true);

    await expect(settings.alertBar).toHaveText('Display name updated');
    await expect(settings.displayName.status).toHaveText('TestUser1');

    await settings.displayName.changeButton.click();
    await displayName.fillOutForm('TestUser2', true);

    await expect(settings.alertBar).toHaveText('Display name updated');
    await expect(settings.displayName.status).toHaveText('TestUser2');
  });

  test('remove the display name', async ({
    target,
    pages: { page, displayName, settings, signin },
    testAccountTracker,
  }) => {
    await signInAccount(target, page, settings, signin, testAccountTracker);

    await settings.goto();

    await expect(settings.displayName.status).toHaveText('None');

    await settings.displayName.addButton.click();
    await displayName.fillOutForm('TestUser1', true);

    await expect(settings.alertBar).toHaveText('Display name updated');
    await expect(settings.displayName.status).toHaveText('TestUser1');

    await settings.displayName.changeButton.click();
    await displayName.fillOutForm('', true);

    await expect(settings.alertBar).toHaveText('Display name updated');
    await expect(settings.displayName.status).toHaveText('None');
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
