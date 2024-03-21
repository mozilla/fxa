/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect } from '../../lib/fixtures/standard';

test.describe('severity-1 #smoke', () => {
  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293498
  test('settings avatar drop-down #1293498', async ({
    credentials,
    page,
    pages: { settings },
  }) => {
    await settings.goto();
    await settings.avatarDropDownMenuToggle.click();
    await expect(settings.avatarDropDownMenu).toBeVisible();
    await expect(settings.avatarDropDownMenu).toContainText(credentials.email);
    await page.keyboard.press('Escape');
    await expect(settings.avatarDropDownMenu).toBeHidden();
    await settings.signOut();
  });

  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293513
  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293517
  test('upload avatar #1293513 #1293517', async ({
    pages: { settings, avatar },
  }) => {
    await settings.goto();
    await settings.avatar.clickAdd();
    const filechooser = await avatar.clickAddPhoto();
    await filechooser.setFiles('./pages/settings/avatar.png');
    await avatar.clickSave();
    expect(await settings.avatar.isDefault()).toBeFalsy();
    await settings.avatar.clickChange();
    await avatar.clickRemove();
    expect(await settings.avatar.isDefault()).toBeTruthy();
  });
});
