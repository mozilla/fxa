/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Unsupported-browser pairing test.
 *
 * Spoofs the user-agent to a non-Firefox desktop browser, opens /pair,
 * and verifies the unsupported screen renders with the "Oops!" heading
 * and a Download Firefox link.
 *
 * Runs on the standard Firefox project — only the UA string is faked,
 * so no extra browser binary is required.
 *
 * Works in BOTH the React and Backbone pair modes. Both stacks render
 * the same "Oops!" heading on `#pair-unsupported-header` and the same
 * "Download Firefox" anchor pointing at mozilla.org/firefox/new, so we
 * don't gate on showReactApp.pairRoutes.
 */

import { test, expect } from '../../lib/fixtures/standard';

const CHROME_DESKTOP_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ' +
  'AppleWebKit/537.36 (KHTML, like Gecko) ' +
  'Chrome/124.0.0.0 Safari/537.36';

test.describe('severity-2 #smoke', () => {
  test.describe('pairing unsupported browser', () => {
    test.use({ userAgent: CHROME_DESKTOP_UA });

    test('opening /pair with a non-Firefox UA redirects to /pair/unsupported', async ({
      target,
      page,
    }) => {
      // Sanity check — the spoofed UA must actually reach the page.
      await page.goto(`${target.contentServerUrl}/pair`, {
        waitUntil: 'load',
      });
      const ua = await page.evaluate(() => navigator.userAgent);
      expect(ua).toContain('Chrome/');

      // The Pair Index page (React or Backbone) navigates to /pair/unsupported
      // on mount when the browser is not Firefox desktop.
      await page.waitForURL(/\/pair\/unsupported/, { timeout: 10_000 });

      // Both stacks render the "Oops!" heading on `#pair-unsupported-header`.
      // React's Fluent wraps "Firefox" in BiDi isolation markers (U+2068/2069);
      // Backbone uses the bare word. Use a curly-quote-tolerant prefix match
      // and check "Firefox" separately so the same assertion works in both.
      const header = page.locator('#pair-unsupported-header');
      await expect(header).toBeVisible();
      await expect(header).toContainText(
        /Oops! It looks like you.re not using/
      );
      await expect(header).toContainText('Firefox');

      // Download Firefox CTA points at the marketing site
      const downloadLink = page.getByRole('link', {
        name: /Download Firefox/i,
      });
      await expect(downloadLink).toBeVisible();
      await expect(downloadLink).toHaveAttribute(
        'href',
        /mozilla\.org\/firefox\/new/
      );
    });
  });
});
