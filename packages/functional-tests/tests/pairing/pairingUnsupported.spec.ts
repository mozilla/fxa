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

import { Page } from '@playwright/test';
import { test, expect } from '../../lib/fixtures/standard';
import { GleanEventsHelper } from '../../lib/glean';

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

const FIREFOX_IOS_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) ' +
  'AppleWebKit/605.1.15 (KHTML, like Gecko) ' +
  'FxiOS/124.0 Mobile/15E148 Safari/605.1.15';

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
      const gleanEventsHelper = new GleanEventsHelper(page);
      await gleanEventsHelper.start();

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

      const ping = await gleanEventsHelper.waitForEvent(
        'cad_redirect_desktop_view'
      );
      expect(ping.extras.browser_family).toBe('chrome');
    });
  });

  // A phone that scanned the QR with its system camera. Safari cannot infer a
  // failed launch of firefox://, so it gets the App Store as its own CTA next
  // to the deep link. The deep link opens the pair URL once iOS v2 is rolled
  // out (version 2 and an iOS minimum served), else the connect hint page.
  test.describe('pairing from the iOS system camera in Safari', () => {
    test.use({ userAgent: IOS_SAFARI_UA });

    let iosV2RolledOut: boolean;

    test.beforeEach(async ({ pages: { configPage } }) => {
      const { pairing } = await configPage.getConfig();
      const iosMinVersion = pairing?.v2MinVersion?.ios;
      // Same rule as isPairingV2RolledOut in fxa-settings.
      iosV2RolledOut =
        pairing?.version === 2 &&
        typeof iosMinVersion === 'number' &&
        Number.isFinite(iosMinVersion);
    });

    // Asserts the download page and returns the url the deep link opens.
    async function openDownloadPage(page: Page, contentServerUrl: string) {
      const gleanEventsHelper = new GleanEventsHelper(page);
      await gleanEventsHelper.start();

      await page.goto(`${contentServerUrl}/pair${PAIRING_HASH}`, {
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

      const ping = await gleanEventsHelper.waitForEvent(
        'cad_firefox_download_firefox_view'
      );
      expect(ping.extras.browser_family).toBe('safari');

      return opened.searchParams.get('url');
    }

    test('offers the App Store and a Firefox deep link to the connect hint', async ({
      target,
      page,
    }) => {
      test.skip(iosV2RolledOut, 'iOS pairing v2 is rolled out');
      expect(await openDownloadPage(page, target.contentServerUrl)).toBe(
        `${target.contentServerUrl}/pair/supplicant/connect_hint`
      );
    });

    test('offers the App Store and a Firefox deep link to the pair URL', async ({
      target,
      page,
    }) => {
      test.skip(!iosV2RolledOut, 'iOS pairing v2 is not rolled out');
      expect(await openDownloadPage(page, target.contentServerUrl)).toBe(
        `${target.contentServerUrl}/pair${PAIRING_HASH}`
      );
    });
  });

  // Any other iOS browser fails an unregistered scheme silently, so the store
  // stays an inferred fallback behind a single CTA.
  test.describe('pairing from the iOS system camera in Chrome', () => {
    test.use({ userAgent: IOS_CHROME_UA });

    test('offers a single Firefox deep link', async ({ target, page }) => {
      const gleanEventsHelper = new GleanEventsHelper(page);
      await gleanEventsHelper.start();

      await page.goto(`${target.contentServerUrl}/pair${PAIRING_HASH}`, {
        waitUntil: 'load',
      });

      await page.waitForURL(/\/pair\/supplicant\/download_firefox/, {
        timeout: 10_000,
      });

      await expect(page.locator(DEEP_LINK)).toHaveCount(1);
      await expect(page.locator(APP_STORE_LINK)).toHaveCount(0);

      const ping = await gleanEventsHelper.waitForEvent(
        'cad_firefox_download_firefox_view'
      );
      expect(ping.extras.browser_family).toBe('chrome');
    });
  });

  // The download screen hands off to this page in a Firefox tab.
  test.describe('the connect hint in Firefox iOS', () => {
    test.use({ userAgent: FIREFOX_IOS_UA });

    test('shows the steps to pair from the app menu', async ({
      target,
      page,
    }) => {
      await page.goto(
        `${target.contentServerUrl}/pair/supplicant/connect_hint`
      );

      await expect(
        page.getByRole('heading', { name: 'Finish pairing in the app' })
      ).toBeVisible();
      const steps = page.getByRole('listitem');
      await expect(steps).toHaveCount(2);
      await expect(steps.nth(0)).toHaveText(/Tap the app menu/);
      await expect(steps.nth(1)).toHaveText(/Sign in, then scan the code/);
    });
  });
});
