/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect } from '../../lib/fixtures/standard';
import { BaseTarget } from '../../lib/targets/base';

function getReactFeatureFlagUrl(target: BaseTarget, path: string) {
  return `${target.contentServerUrl}${path}?showReactApp=true`;
}

test.describe('react-conversion', () => {
  test('Cannot create account', async ({ page, target }) => {
    await page.goto(getReactFeatureFlagUrl(target, '/cannot_create_account'));
    expect(await page.locator('#root').isVisible()).toBeTruthy();
  });
});
