/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../lib/fixtures/standard';

test.describe('severity-1', () => {
  // runs all mocha tests - see output here: http://127.0.0.1:3030/tests/index.html
  test('content-server mocha tests', async ({ target, page }, { project }) => {
    test.skip(project.name !== 'local', 'mocha tests are local only');
    await page.goto(`${target.contentServerUrl}/tests/index.html`, {
      waitUntil: 'load',
    });
    await page.waitForTimeout(2000); // wait for mocha to load
    await page.evaluate(() =>
      (globalThis as any).runner.on(
        'end',
        () => ((globalThis as any).done = true)
      )
    );
    await page.waitForFunction(
      () => (globalThis as any).done,
      {},
      { timeout: 0 }
    );
    const failures = await page.evaluate(
      () => (globalThis as any).runner.failures
    );
    expect(failures).toBe(0);
  });

  test('prompt=consent', async ({
    pages: { configPage, relier, signin },
    testAccountTracker,
  }) => {
    const config = await configPage.getConfig();
    test.skip(
      config.showReactApp.signInRoutes === true,
      'permissions page is not supported in React, see FXA-8827'
    );
    const credentials = await testAccountTracker.signUp();

    await relier.goto('prompt=consent');
    await relier.clickEmailFirst();
    await signin.fillOutEmailFirstForm(credentials.email);
    await signin.fillOutPasswordForm(credentials.password);
    await expect(signin.permissionsHeading).toBeVisible();
    await signin.permissionsAcceptButton.click();
    expect(await relier.isLoggedIn()).toBe(true);
  });
});

test.describe('robots.txt', () => {
  test('should allow bots to access all pages', async ({ target, page }) => {
    await page.goto(`${target.contentServerUrl}/robots.txt`, {
      waitUntil: 'load',
    });
    const text = await page.locator('body').innerText();
    expect(/^Allow:/gm.test(text)).toBeTruthy();
  });
});
