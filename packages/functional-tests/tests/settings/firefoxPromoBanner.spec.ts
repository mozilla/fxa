/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Settings Firefox promo banner test.
 *
 * Verifies the banner at the top of settings renders the correct variant
 * based on the browser:
 *  - Firefox signed into the browser (the test signs in via Sync to get the
 *    browser into a signed-in state): the "Connect a device" install-mobile
 *    variant, linking to /pair. It must show regardless of window size (a
 *    narrow viewport must NOT hide it).
 *  - Non-Firefox desktop (spoofed Chrome UA): the "Switch to Firefox"
 *    variant, linking to the Firefox download page.
 *  - Firefox mobile (spoofed Firefox Android UA): hidden, the app is already
 *    installed.
 *
 * Also verifies the banner can be dismissed and stays dismissed across a
 * reload (localStorage persistence).
 */

import { Page, expect, test } from '../../lib/fixtures/standard';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { SettingsPage } from '../../pages/settings';
import { SigninPage } from '../../pages/signin';
import { SigninTokenCodePage } from '../../pages/signinTokenCode';
import { ConnectAnotherDevicePage } from '../../pages/connectAnotherDevice';

const CHROME_DESKTOP_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ' +
  'AppleWebKit/537.36 (KHTML, like Gecko) ' +
  'Chrome/124.0.0.0 Safari/537.36';

const FIREFOX_ANDROID_UA =
  'Mozilla/5.0 (Android 13; Mobile; rv:120.0) Gecko/120.0 Firefox/120.0';

test.describe('firefox promo banner', () => {
  // FIXME: the install-mobile variant needs the browser to report the user as
  // signed in (verified), which relies on the `fxaccounts:oauth_flow_begin` WebChannel
  // command (Firefox Bug 1990334, Feb 2026). Playwright 1.44.1's Firefox 125
  // predates it, so the browser-initiated OAuth flow never completes and the
  // browser stays unverified. Re-enable after the Playwright upgrade (works
  // against a current Firefox manually).
  test.describe('settings banner', () => {
    test.fixme(
      'shows the install-mobile variant on Firefox signed into the browser',
      async ({
        target,
        syncOAuthBrowserPages: {
          page,
          settings,
          signin,
          signinTokenCode,
          connectAnotherDevice,
        },
        testAccountTracker,
      }) => {
        const credentials = await testAccountTracker.signUpSync();
        await signInToBrowser(
          target,
          page,
          settings,
          signin,
          signinTokenCode,
          connectAnotherDevice,
          credentials
        );

        // Signed into the browser, so the install-mobile variant shows: a
        // "Connect a device" CTA pointing at the pairing flow.
        const cta = page.getByTestId('firefox-promo-cta');
        await expect(cta).toBeVisible();
        await expect(cta).toHaveText('Connect a device');
        await expect(cta).toHaveAttribute('href', /\/pair/);
      }
    );

    test.fixme(
      'shows on Firefox even in a narrow viewport',
      async ({
        target,
        syncOAuthBrowserPages: {
          page,
          settings,
          signin,
          signinTokenCode,
          connectAnotherDevice,
        },
        testAccountTracker,
      }) => {
        const credentials = await testAccountTracker.signUpSync();
        await signInToBrowser(
          target,
          page,
          settings,
          signin,
          signinTokenCode,
          connectAnotherDevice,
          credentials
        );

        // Regression guard: a narrow desktop Firefox window keeps its desktop
        // UA, so the banner must still show (hiding is user-agent based, not
        // width based).
        await page.setViewportSize({ width: 600, height: 900 });
        await settings.goto();

        const cta = page.getByTestId('firefox-promo-cta');
        await expect(cta).toBeVisible();
        await expect(cta).toHaveText('Connect a device');
      }
    );

    test.fixme(
      'can be dismissed and stays dismissed after reload',
      async ({
        target,
        syncOAuthBrowserPages: {
          page,
          settings,
          signin,
          signinTokenCode,
          connectAnotherDevice,
        },
        testAccountTracker,
      }) => {
        const credentials = await testAccountTracker.signUpSync();
        await signInToBrowser(
          target,
          page,
          settings,
          signin,
          signinTokenCode,
          connectAnotherDevice,
          credentials
        );

        const banner = page.getByTestId('firefox-promo-cta');
        await expect(banner).toBeVisible();

        // Target this banner's dismiss button specifically — other promo
        // banners share the same "Dismiss banner" aria-label.
        await page.getByTestId('firefox-promo-dismiss').click();
        await expect(banner).toBeHidden();

        // Dismissal persists in localStorage, so it stays hidden on reload.
        await settings.goto();
        await expect(settings.settingsHeading).toBeVisible();
        await expect(banner).toBeHidden();
      }
    );
  });

  test.describe('settings banner - non-Firefox browser', () => {
    test.use({ userAgent: CHROME_DESKTOP_UA });

    test('shows the switch-to-Firefox variant', async ({
      target,
      pages: { page, settings, signin },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      await signInAccount(target, page, settings, signin, credentials);

      // Sanity check — the spoofed UA must actually reach the page.
      const ua = await page.evaluate(() => navigator.userAgent);
      expect(ua).toContain('Chrome/');

      // The switch heading is brand-free, so it avoids Fluent BiDi markers.
      await expect(
        page.getByText('Fast to switch. Easy to settle in.')
      ).toBeVisible();

      // The CTA points at the Firefox desktop download page.
      const cta = page.getByTestId('firefox-promo-cta');
      await expect(cta).toBeVisible();
      await expect(cta).toHaveAttribute('href', /firefox\.com/);
    });
  });

  test.describe('settings banner - Firefox mobile', () => {
    test.use({ userAgent: FIREFOX_ANDROID_UA });

    test('is hidden because the app is already installed', async ({
      target,
      pages: { page, settings, signin },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      await signInAccount(target, page, settings, signin, credentials);

      // Sanity check — the spoofed mobile Firefox UA must reach the page.
      const ua = await page.evaluate(() => navigator.userAgent);
      expect(ua).toContain('Firefox/');
      expect(ua).toContain('Mobile');

      // Firefox mobile users already have the app, so the banner is suppressed.
      await expect(page.getByTestId('firefox-promo-cta')).toHaveCount(0);
    });
  });
});

// Plain web sign-in (no Sync), landing on settings.
async function signInAccount(
  target: BaseTarget,
  page: Page,
  settings: SettingsPage,
  signin: SigninPage,
  credentials: Credentials
): Promise<void> {
  await page.goto(target.contentServerUrl);
  await signin.fillOutEmailFirstForm(credentials.email);
  await signin.fillOutPasswordForm(credentials.password);
  await page.waitForURL(/settings/);
  await expect(settings.settingsHeading).toBeVisible();
}

// Signs into the browser via the browser-initiated Sync OAuth flow: /pair sends
// `fxaccounts:oauth_flow_begin`, the browser returns its OAuth params, FxA
// redirects to sign-in, and after the email code the browser marks itself
// verified (which the install-mobile promo requires).
async function signInToBrowser(
  target: BaseTarget,
  page: Page,
  settings: SettingsPage,
  signin: SigninPage,
  signinTokenCode: SigninTokenCodePage,
  connectAnotherDevice: ConnectAnotherDevicePage,
  credentials: Credentials
): Promise<void> {
  await page.goto(`${target.contentServerUrl}/pair`);
  await signin.fillOutEmailFirstForm(credentials.email);
  await signin.fillOutPasswordForm(credentials.password);

  await page.waitForURL(/signin_token_code/);
  const code = await target.emailClient.getVerifyLoginCode(credentials.email);
  await signinTokenCode.fillOutCodeForm(code);

  await expect(connectAnotherDevice.fxaConnected).toBeVisible();
  await connectAnotherDevice.clickNotNowPair();
  await page.waitForURL(/settings/);
  await expect(settings.settingsHeading).toBeVisible();
}
