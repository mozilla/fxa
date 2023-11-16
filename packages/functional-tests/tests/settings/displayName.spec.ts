/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect } from '../../lib/fixtures/standard';

test.describe('severity-2 #smoke', () => {
  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293371
  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293373
  test('add/change/cancel/remove the display name', async ({
    pages: { settings, displayName },
  }) => {
    await settings.goto();
    expect(await settings.displayName.statusText()).toEqual('None');
    await settings.displayName.clickAdd();
    await displayName.setDisplayName('TestUser1');

    // Click cancel to cancel adding a display name
    await displayName.clickCancelDisplayName();
    await settings.displayName.clickAdd();
    await displayName.setDisplayName('TestUser1');
    await displayName.submit();

    // Verify the added display name
    expect(await settings.displayName.statusText()).toEqual('TestUser1');
    await settings.displayName.clickAdd();
    await displayName.setDisplayName('TestUser2');

    // Click cancel to cancel changing the display name
    await displayName.clickCancelDisplayName();
    await settings.displayName.clickAdd();
    await displayName.setDisplayName('TestUser2');
    await displayName.submit();

    //Verify the changed display name
    expect(await settings.displayName.statusText()).toEqual('TestUser2');

    // Remove display name
    await settings.displayName.clickAdd();
    await displayName.setDisplayName('');
    await displayName.submit();
    expect(await settings.displayName.statusText()).toEqual('None');
  });
});
