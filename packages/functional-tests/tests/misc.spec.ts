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
