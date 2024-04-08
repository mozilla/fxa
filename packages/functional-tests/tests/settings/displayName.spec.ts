/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect } from '../../lib/fixtures/standard';

test.describe('severity-2 #smoke', () => {
  test('add the display name', async ({ pages: { settings, displayName } }) => {
    await settings.goto();

    await expect(settings.displayName.status).toHaveText('None');

    await settings.displayName.addButton.click();
    await displayName.fillOutForm('TestUser1', true);

    await expect(settings.alertBar).toHaveText('Display name updated');
    await expect(settings.displayName.status).toHaveText('TestUser1');
  });

  test('cancel add the display name', async ({
    pages: { settings, displayName },
  }) => {
    await settings.goto();

    await expect(settings.displayName.status).toHaveText('None');

    await settings.displayName.addButton.click();

    await displayName.fillOutForm('TestUser1', false);
    await displayName.cancelButton.click();

    await expect(settings.displayName.status).toHaveText('None');
  });

  test('change the display name', async ({
    pages: { settings, displayName },
  }) => {
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
    pages: { settings, displayName },
  }) => {
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
