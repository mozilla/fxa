/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FirefoxCommand } from '../../lib/channels';
import { Page, expect } from '../../lib/fixtures/standard';
import { test } from '../../lib/fixtures/pairing';
import { findV2AuthorityBinary } from '../../lib/firefox-binary';
import { MarionetteClient } from '../../lib/marionette';
import { PAIR_V2_ROUTES, SELECTORS } from '../../lib/pairing-constants';
import {
  findElementBySelectors,
  getServedPairingVersion,
  setPairingVersion,
  signInAuthorityViaMarionette,
  waitForUrlContaining,
} from '../../lib/pairing-helpers';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { SettingsPage } from '../../pages/settings';
import { SigninPage } from '../../pages/signin';

// What the Firefox app-menu entry sends; /connect_another_device requires an
// eligible entrypoint to consider pairing at all.
const ELIGIBLE_ENTRYPOINT_QS =
  'context=oauth_webchannel_v1&entrypoint=fxa_app_menu';

test.describe('severity-2 #smoke', () => {
  test.describe('Pair entry flow', () => {
    test('direct /pair dispatches fxa_status and oauth_flow_begin and reveals the choice screen', async ({
      target,
      syncOAuthBrowserPages: { page, settings, signin, signinTokenCode },
      testAccountTracker,
    }) => {
      // /pair requires a signed-in browser to reveal the choice screen; a fresh
      // browser is redirected to sign-in first.
      const credentials = await testAccountTracker.signUpSync();
      await page.goto(`${target.contentServerUrl}/pair`);
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);
      await page.waitForURL(/signin_token_code/);
      const code = await target.emailClient.getVerifyLoginCode(
        credentials.email
      );
      await signinTokenCode.fillOutCodeForm(code);

      // testid avoids the Localized/label text-content quirk that confuses
      // getByLabel/getByRole here.
      await expect(page.getByTestId('has-mobile')).toBeVisible();
      await expect(page).toHaveURL(/\/pair(\?|$)/);

      await settings.checkWebChannelMessage(FirefoxCommand.FxAStatus);
      await settings.checkWebChannelMessage(FirefoxCommand.OAuthFlowBegin);
    });

    test('Continue advances to the download view when no mobile is selected', async ({
      target,
      syncOAuthBrowserPages: { page, signin, signinTokenCode },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUpSync();
      await page.goto(`${target.contentServerUrl}/pair`);
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);
      await page.waitForURL(/signin_token_code/);
      const code = await target.emailClient.getVerifyLoginCode(
        credentials.email
      );
      await signinTokenCode.fillOutCodeForm(code);

      // Click the label so React's onChange fires; the radio is hidden behind
      // it, and check() on the input itself fails actionability.
      await page.locator('label[for="needs-mobile"]').click();
      await expect(page.getByTestId('pair-continue-btn')).toBeEnabled();

      await page.getByTestId('pair-continue-btn').click();

      await expect(page.locator('#pair-header-mobile')).toBeVisible();
    });

    test('direct /connect_another_device dispatches fxa_status and oauth_flow_begin', async ({
      target,
      syncOAuthBrowserPages: { page, settings },
    }) => {
      await page.goto(`${target.contentServerUrl}/connect_another_device`);

      await settings.checkWebChannelMessage(FirefoxCommand.FxAStatus);
      await settings.checkWebChannelMessage(FirefoxCommand.OAuthFlowBegin);
    });

    // v2 removes the supplicant choice screen: a native-camera scan opens
    // /pair#...&v=2, which forwards straight into the single-QR v2 supplicant
    // flow instead of the has-mobile / needs-mobile choice (FXA-13865). No
    // sign-in is needed on the supplicant, so this is deterministic.
    test('v2 supplicant URL bypasses the choice screen', async ({
      target,
      syncOAuthBrowserPages: { page },
    }) => {
      await page.goto(
        `${target.contentServerUrl}/pair#channel_id=testchannelid&channel_key=testchannelkey&v=2`
      );

      await page.waitForURL(/\/pair\/supplicant\/approve_signin/);
      // The v1 choice screen must not appear in the v2 flow.
      await expect(page.getByTestId('has-mobile')).toBeHidden();
    });

    // Firefox mobile does not open /pair; app-services opens /pair/supp with the
    // OAuth params in the query and the channel + v=2 marker in the fragment.
    // That entry must also forward into the v2 supplicant flow, preserving both
    // the query and the fragment. (FXA-13865 — the on-device entry point.)
    test('v2 /pair/supp entry forwards to the v2 supplicant flow', async ({
      target,
      syncOAuthBrowserPages: { page },
    }) => {
      await page.goto(
        `${target.contentServerUrl}/pair/supp?client_id=a2270f727f45f648&scope=profile#channel_id=testchannelid&channel_key=testchannelkey&v=2`
      );

      await page.waitForURL(/\/pair\/supplicant\/approve_signin/);
      // The OAuth query and the channel fragment must survive the forward.
      expect(page.url()).toContain('client_id=a2270f727f45f648');
      expect(page.url()).toContain('channel_id=testchannelid');
      expect(page.url()).toContain('v=2');
    });

    /**
     * Settings "Connect a device" is the other way into pairing. The CTA is
     * gated to desktop Firefox (isFirefox && !isMobile).
     *
     * Note: the link currently targets /pair (v1). Carrying `?v=2` when the v2
     * pref is on is FXA-14289 / FXA-13869 work not yet wired into this link;
     * when it lands, extend this to assert the v2 target.
     */
    test('Settings "Connect a device" launches the pair flow', async ({
      target,
      page,
      pages: { signin, settings },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      await signInAccount(target, page, settings, signin, credentials);

      await settings.goto();

      // The CTA is gated to desktop Firefox; the functional-test browser qualifies.
      const connectDevice = page.locator(
        '[data-glean-id="account_pref_connect_device_submit"]'
      );
      await expect(connectDevice).toBeVisible();
      await expect(connectDevice).toHaveAttribute('href', /\/pair/);

      await connectDevice.click();
      await page.waitForURL(/\/pair(\?|#|$)/);
    });
  });

  /**
   * The authority enters v2 only when FxA and the browser agree, via
   * `capabilities.pairingVersion` in the fxa_status reply. Playwright's own
   * build omits it and reads as v1, so these need Marionette on Nightly.
   *
   * No URL here carries `v=2`: the tests above use that override, which skips
   * this branch entirely.
   */
  test.describe.serial('v2 pairing version negotiation', () => {
    let servedVersion = 1;

    // Baked in at server boot, so a test cannot change it.
    test.beforeAll(async ({ browser, target }) => {
      servedVersion = await getServedPairingVersion(browser, target);
    });

    test.beforeEach(() => {
      test.skip(
        !findV2AuthorityBinary(),
        'Firefox Nightly not found — install it, or set FIREFOX_BINARY to a v2-capable build'
      );
      test.skip(
        servedVersion !== 2,
        `Needs the stack to serve config.pairing.version=2 (serving ${servedVersion})`
      );
    });

    async function signInAtVersion(
      client: MarionetteClient,
      contentServerUrl: string,
      version: number,
      credentials: { email: string; password: string }
    ) {
      await setPairingVersion(client, version);
      await signInAuthorityViaMarionette(
        client,
        contentServerUrl,
        credentials.email,
        credentials.password
      );
      // Sign-in ends on a chrome-context check, and navigate() needs content.
      await client.setContext('content');
    }

    // Each authority entry negotiates separately. /pair is where Settings
    // "Connect a device" and the post-signin handoffs land.
    for (const entry of ['/connect_another_device', '/pair']) {
      test(`a v2 browser skips the choice screen on ${entry}`, async ({
        target,
        testAccountTracker,
        marionetteAuthority,
      }) => {
        const client = marionetteAuthority.client;
        const credentials = await testAccountTracker.signUp();
        await signInAtVersion(client, target.contentServerUrl, 2, credentials);

        await client.navigate(
          `${target.contentServerUrl}${entry}?${ELIGIBLE_ENTRYPOINT_QS}`
        );

        const url = await waitForUrlContaining(
          client,
          PAIR_V2_ROUTES.AUTHORITY_SCAN_QR
        );
        // Reached on capability alone; nothing here asked for v2.
        expect(url).not.toContain('v=2');
      });
    }

    // Without this, a branch that always fired would pass the two above.
    test('a v1 browser still gets the choice screen', async ({
      target,
      testAccountTracker,
      marionetteAuthority,
    }) => {
      const client = marionetteAuthority.client;
      const credentials = await testAccountTracker.signUp();
      await signInAtVersion(client, target.contentServerUrl, 1, credentials);

      await client.navigate(
        `${target.contentServerUrl}/connect_another_device?${ELIGIBLE_ENTRYPOINT_QS}`
      );

      // Renders only once negotiation finishes, so this waits for the URL check.
      await findElementBySelectors(client, SELECTORS.PAIR_RADIO_HAS_MOBILE);
      expect(await client.getUrl()).not.toContain('/pair/authority');
    });
  });
});

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
