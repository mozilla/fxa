/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Pairing from a browser that cannot pair on its own.
 *
 * Spoofs the user-agent — a non-Firefox desktop, and iOS browsers opening a
 * scanned pairing URL — and verifies where `/pair` sends each: desktop to the
 * unsupported screen, phones to the download screen that hands off to the
 * Firefox app.
 *
 * Runs on the standard Firefox project — only the UA string is faked,
 * so no extra browser binary is required.
 *
 * The iOS cases locate CTAs by href rather than by name: Fluent wraps the
 * brand name in BiDi isolation marks (U+2068/2069), so an accessible-name
 * match on "Download Firefox" would not resolve.
 */

import { test, expect } from '../../lib/fixtures/standard';

const CHROME_DESKTOP_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ' +
  'AppleWebKit/537.36 (KHTML, like Gecko) ' +
  'Chrome/124.0.0.0 Safari/537.36';

const IOS_SAFARI_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) ' +
  'AppleWebKit/605.1.15 (KHTML, like Gecko) ' +
  'Version/17.4 Mobile/15E148 Safari/604.1';

const IOS_CHROME_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) ' +
  'AppleWebKit/605.1.15 (KHTML, like Gecko) ' +
  'CriOS/124.0.6367.88 Mobile/15E148 Safari/604.1';

/** What the system camera opens after scanning a v2 authority QR. */
const PAIRING_HASH = '#channel_id=chan-1&channel_key=key-1&v=2';

const DEEP_LINK = 'a[href^="firefox://open-url"]';
const APP_STORE_LINK = 'a[href*="apps.apple.com"]';

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

      // The Pair Index page navigates to /pair/unsupported
      // on mount when the browser is not Firefox desktop.
      await page.waitForURL(/\/pair\/unsupported/, { timeout: 10_000 });

      // Fluent wraps "Firefox" in BiDi isolation markers (U+2068/2069), so use
      // a curly-quote-tolerant prefix match and check "Firefox" separately.
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

  // A phone that scanned the QR with its system camera. Safari cannot infer a
  // failed launch of firefox://, so it gets the App Store as its own CTA next
  // to the deep link. With no iOS minimum served, the deep link opens the
  // connect hint page rather than the pair URL.
  test.describe('pairing from the iOS system camera in Safari', () => {
    test.use({ userAgent: IOS_SAFARI_UA });

    test('offers the App Store and a Firefox deep link to the connect hint', async ({
      target,
      page,
    }) => {
      await page.goto(`${target.contentServerUrl}/pair${PAIRING_HASH}`, {
        waitUntil: 'load',
      });

      await page.waitForURL(/\/pair\/supplicant\/download_firefox/, {
        timeout: 10_000,
      });
      // The channel key is the pairing PSK and travels as router state only.
      expect(page.url()).not.toContain('channel_key');

      // Matched on the part of the heading outside the isolated brand name.
      await expect(
        page.getByRole('heading', { name: /on this device/ })
      ).toBeVisible();

      await expect(page.locator(APP_STORE_LINK)).toBeVisible();

      const deepLink = page.locator(DEEP_LINK);
      await expect(deepLink).toBeVisible();
      const href = (await deepLink.getAttribute('href')) ?? '';
      const opened = new URL(href.replace('firefox://', 'https://'));
      expect(opened.searchParams.get('url')).toBe(
        `${target.contentServerUrl}/pair/supplicant/connect_hint`
      );
    });
  });

  // Any other iOS browser fails an unregistered scheme silently, so the store
  // stays an inferred fallback behind a single CTA.
  test.describe('pairing from the iOS system camera in Chrome', () => {
    test.use({ userAgent: IOS_CHROME_UA });

    test('offers a single Firefox deep link', async ({ target, page }) => {
      await page.goto(`${target.contentServerUrl}/pair${PAIRING_HASH}`, {
        waitUntil: 'load',
      });

      await page.waitForURL(/\/pair\/supplicant\/download_firefox/, {
        timeout: 10_000,
      });

      await expect(page.locator(DEEP_LINK)).toHaveCount(1);
      await expect(page.locator(APP_STORE_LINK)).toHaveCount(0);
    });
  });
});
