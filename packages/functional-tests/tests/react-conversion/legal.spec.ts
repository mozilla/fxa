/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect } from '../../lib/fixtures/standard';

test.describe('severity-2 #smoke', () => {
  test.describe('legal', () => {
    test('start at legal page', async ({ page, target }) => {
      await page.goto(`${target.contentServerUrl}/legal`);

      // Verify legal page is visible
      expect(
        await page.locator('.card-header:has-text("Legal")').isEnabled()
      ).toBeTruthy();

      // Verify Terms Of Service link is visible
      expect(
        await page.locator('a:has-text("Terms of Service")').isVisible()
      ).toBeTruthy();

      // Currently Back button on this page is not working,
      // check https://mozilla-hub.atlassian.net/browse/FXA-6874
      // await page.locator('a:has-text("Terms of Service")').click();
      //await page.locator('button:has-text("Back")').click();
      //expect(await page.locator('.card-header:has-text("Legal")').isVisible()).toBeTruthy();

      // Verify Privacy Notice link is visible
      expect(
        await page.locator('a:has-text("Privacy Notice")').isVisible()
      ).toBeTruthy();
      await page.locator('a:has-text("Privacy Notice")').click();
      await page.waitForURL(`${target.contentServerUrl}/legal/privacy`);
      await page.locator('button:has-text("Back")').click();
      await page.waitForURL(`${target.contentServerUrl}/legal`);
      await page.waitForSelector('.card-header:has-text("Legal")');
    });

    test('start at terms page', async ({ page, target }) => {
      await page.goto(`${target.contentServerUrl}/legal/terms`);

      // Verify legal page is visible
      // this text is not in our codebase, it's pulled from the `legal-docs` repo
      await page
        .locator('text="Firefox Cloud Services: Terms of Service"')
        .isVisible();
    });

    test('start at privacy page', async ({ page, target }) => {
      await page.goto(`${target.contentServerUrl}/legal/privacy`);

      // Verify privacy page is visible
      await page.waitForTimeout(1000);
      // this text is not in our codebase, it's pulled from the `legal-docs` repo
      await page.locator('text="Firefox Privacy Notice"').isVisible();
    });
  });
});
