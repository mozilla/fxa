/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect } from '../../lib/fixtures/standard';

const AVATAR_IMAGE_PATH = './pages/settings/avatar.png';

test.describe('severity-1 #smoke', () => {
  test('open and close avatar drop-down menu', async ({
    credentials,
    pages: { settings },
  }) => {
    await settings.goto();

    await expect(settings.avatarDropDownMenu).toBeHidden();

    await settings.avatarDropDownMenuToggle.click();

    await expect(settings.avatarDropDownMenu).toBeVisible();
    await expect(settings.avatarDropDownMenu).toContainText(credentials.email);

    await settings.settingsHeading.click(); // Click anywhere outside menu

    await expect(settings.avatarDropDownMenu).toBeHidden();
  });

  test('upload and remove avatar profile photo', async ({
    pages: { settings, avatar },
  }) => {
    await settings.goto();

    await expect(settings.settingsHeading).toBeVisible();
    await expect(settings.avatar.photo).toHaveAttribute('src', /avatar/);
    await expect(settings.avatarDropDownMenuPhoto).toHaveAttribute(
      'src',
      /avatar/
    );

    await settings.avatar.addButton.click();

    await expect(avatar.profilePictureHeading).toBeVisible();
    await expect(avatar.photo).toHaveAttribute('src', /avatar/);
    await expect(avatar.saveButton).toBeDisabled();

    await avatar.addPhoto(AVATAR_IMAGE_PATH);
    await avatar.saveButton.click();

    await expect(settings.settingsHeading).toBeVisible();
    await expect(settings.avatar.photo).not.toHaveAttribute('src', /avatar/);
    await expect(settings.avatarDropDownMenuPhoto).not.toHaveAttribute(
      'src',
      /avatar/
    );

    await settings.avatar.changeButton.click();

    await expect(avatar.profilePictureHeading).toBeVisible();
    await expect(avatar.photo).not.toHaveAttribute('src', /avatar/);

    await avatar.removePhotoButton.click();

    await expect(settings.settingsHeading).toBeVisible();
    await expect(settings.avatar.photo).toHaveAttribute('src', /avatar/);
    await expect(settings.avatarDropDownMenuPhoto).toHaveAttribute(
      'src',
      /avatar/
    );
  });
});
