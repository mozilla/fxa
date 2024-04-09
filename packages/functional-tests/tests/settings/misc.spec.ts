/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect } from '../../lib/fixtures/standard';

test.describe('severity-1 #smoke', () => {
  test('settings help link', async ({ pages: { settings } }) => {
    await settings.goto();
    const helpPage = await settings.clickHelp();

    expect(helpPage.url()).toContain('https://support.mozilla.org');
  });
});

test.describe('severity-2 #smoke', () => {
  test('open and close bento drop-down menu', async ({
    pages: { settings },
  }) => {
    await settings.goto();

    await expect(settings.bentoDropDownMenu).toBeHidden();

    await settings.bentoDropDownMenuToggle.click();

    await expect(settings.bentoDropDownMenu).toBeVisible();

    await settings.settingsHeading.click(); // Click anywhere outside menu

    await expect(settings.bentoDropDownMenu).toBeHidden();
  });
});
