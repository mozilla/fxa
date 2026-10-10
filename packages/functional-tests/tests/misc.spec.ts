/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page } from '@playwright/test';
import { expect, test } from '../lib/fixtures/standard';

test.describe('severity-1', () => {
  // runs all mocha tests - see output here: http://127.0.0.1:3030/tests/index.html
  test('content-server mocha tests', async ({ target, page }, { project }) => {
    test.skip(project.name !== 'local', 'mocha tests are local only');
    test.slow();
    await page.goto(`${target.contentServerUrl}/tests/index.html`, {
      waitUntil: 'load',
    });
    await page.waitForFunction(() => !!(globalThis as any).runner);
    await page.evaluate(() => {
      const runner = (globalThis as any).runner;
      // runner may have already ended by the time we subscribe, so handle that too
      if (runner.stats && runner.stats.end) {
        (globalThis as any).done = true;
      } else {
        runner.on('end', () => ((globalThis as any).done = true));
      }
    });
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

test.describe('severity-2 #smoke', () => {
  test.describe('assetlinks.json', () => {
    // Digital Asset Links only accepts upper-case, colon-separated SHA-256 hex.
    const FINGERPRINT = /^([0-9A-F]{2}:){31}[0-9A-F]{2}$/;
    const FENIX_PACKAGES = [
      'org.mozilla.fenix',
      'org.mozilla.firefox',
      'org.mozilla.firefox_beta',
    ];

    type Statement = {
      relation: string[];
      target: {
        namespace: string;
        package_name: string;
        sha256_cert_fingerprints: string[];
      };
    };

    function getAssetLinks(page: Page, contentServerUrl: string) {
      return page.request.get(
        `${contentServerUrl}/.well-known/assetlinks.json`
      );
    }

    async function getStatements(page: Page, contentServerUrl: string) {
      const response = await getAssetLinks(page, contentServerUrl);
      return (await response.json()) as Statement[];
    }

    test('serves JSON', async ({ target, page }) => {
      const response = await getAssetLinks(page, target.contentServerUrl);
      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toMatch(/^application\/json/);
    });

    test('lists each Fenix package exactly once', async ({ target, page }) => {
      const statements = await getStatements(page, target.contentServerUrl);
      const packages = statements.map((s) => s.target.package_name).sort();
      expect(packages).toEqual(FENIX_PACKAGES);
    });

    test('grants handle_all_urls to every android app', async ({
      target,
      page,
    }) => {
      const statements = await getStatements(page, target.contentServerUrl);
      const nonConforming = statements.filter(
        (s) =>
          s.target.namespace !== 'android_app' ||
          !s.relation.includes('delegate_permission/common.handle_all_urls')
      );
      expect(nonConforming).toEqual([]);
    });

    test('lists at least one well-formed fingerprint per app', async ({
      target,
      page,
    }) => {
      const statements = await getStatements(page, target.contentServerUrl);
      const missing = statements
        .filter((s) => s.target.sha256_cert_fingerprints.length === 0)
        .map((s) => s.target.package_name);
      expect(missing).toEqual([]);

      const malformed = statements
        .flatMap((s) => s.target.sha256_cert_fingerprints)
        .filter((f) => !FINGERPRINT.test(f));
      expect(malformed).toEqual([]);
    });
  });
});
