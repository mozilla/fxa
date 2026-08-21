/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Version-gating for the pairing entrypoint.
 *
 * `/connect_another_device` decides between the v1 flow and the v2 rewrite. The
 * logic lives in fxa-settings `pages/ConnectAnotherDevice/index.tsx`:
 *   - config.pairing.version === 2 AND the browser reports
 *     capabilities.pairingVersion === 2  -> /pair/authority/scan_qr (v2)
 *   - else if the URL carries ?v=2 (escape hatch)  -> /pair/authority/scan_qr
 *   - else  -> /pair (v1 choice screen)
 *
 * These specs drive the entrypoint with a signed-in authority (Marionette) and
 * assert only which route it lands on, not the flow behind it. The full v2 flow
 * is covered separately and is blocked on FXA-13868/13865/13867.
 *
 * Prerequisites: FXA stack (content :3030, auth :9000) and a Firefox binary via
 * FIREFOX_BINARY. The negotiation test additionally needs a content server
 * started with PAIRING_VERSION=2, and skips when the stack serves version 1.
 * The browser half of the gate is set per test through the pairing version
 * pref, so one browser covers both the v1 and v2 cases.
 */

import { test, expect } from '../../lib/fixtures/pairing';
import { MarionetteClient } from '../../lib/marionette';
import { PAIR_V2_ROUTES } from '../../lib/pairing-constants';
import {
  signInAuthorityViaMarionette,
  getSignedInUser,
  waitForUrlContaining,
  setPairingVersion,
  getServedPairingVersion,
} from '../../lib/pairing-helpers';

// Launching a real Firefox + OAuth sign-in.
test.setTimeout(120_000);

// `/connect_another_device` only routes into a pairing flow for an eligible
// entrypoint: a Sync webchannel context plus a Firefox-chrome entrypoint in
// PAIRING_ENTRYPOINTS (see ConnectAnotherDevice `isEligibleForPairing`). A bare
// visit just renders the page. This mirrors the real Firefox menu entrypoint.
const ELIGIBLE_ENTRYPOINT_QS =
  'context=oauth_webchannel_v1&entrypoint=fxa_app_menu';

async function signInAuthority(
  client: MarionetteClient,
  contentServerUrl: string,
  email: string,
  password: string
) {
  await signInAuthorityViaMarionette(client, contentServerUrl, email, password);
  const user = await getSignedInUser(client);
  expect(user.signedIn).toBe(true);
}

test.describe('severity-2 #smoke', () => {
  test.describe.serial('pairing entrypoint version gating', () => {
    test('without v=2, the entrypoint stays on the v1 flow', async ({
      target,
      testAccountTracker,
      marionetteAuthority,
    }) => {
      const client = marionetteAuthority.client;
      const { email, password } = await testAccountTracker.signUp();
      await signInAuthority(client, target.contentServerUrl, email, password);

      // State the browser half of the gate. On a PAIRING_VERSION=2 stack this
      // is what keeps the entrypoint on v1; these tests run serially, so
      // leaving it unset would inherit the previous test's pref.
      await setPairingVersion(client, 1);

      await client.setContext('content');
      await client.navigate(
        `${target.contentServerUrl}/connect_another_device?${ELIGIBLE_ENTRYPOINT_QS}`
      );

      // Both the v1 choice screen and the v2 scan page contain "/pair"; the v1
      // entrypoint does not, so this resolves once the redirect settles.
      const landed = await waitForUrlContaining(client, '/pair');
      expect(landed).not.toContain(PAIR_V2_ROUTES.AUTHORITY_SCAN_QR);
      expect(landed).not.toContain('connect_another_device');
    });

    test('with ?v=2, the escape hatch routes to the v2 scan page', async ({
      target,
      testAccountTracker,
      marionetteAuthority,
    }) => {
      const client = marionetteAuthority.client;
      const { email, password } = await testAccountTracker.signUp();
      await signInAuthority(client, target.contentServerUrl, email, password);

      await client.setContext('content');
      await client.navigate(
        `${target.contentServerUrl}/connect_another_device?${ELIGIBLE_ENTRYPOINT_QS}&v=2`
      );

      const landed = await waitForUrlContaining(
        client,
        PAIR_V2_ROUTES.AUTHORITY_SCAN_QR
      );
      expect(landed).toContain(PAIR_V2_ROUTES.AUTHORITY_SCAN_QR);
    });

    test('with config version 2 and a v2-capable browser, negotiation routes to scan_qr', async ({
      browser,
      target,
      testAccountTracker,
      marionetteAuthority,
    }) => {
      // config.pairing.version is baked in at server boot, so a test cannot
      // set it. Skip rather than fail when the stack serves version 1.
      const servedVersion = await getServedPairingVersion(browser, target);
      test.skip(
        servedVersion !== 2,
        'Needs a content server started with PAIRING_VERSION=2'
      );

      const client = marionetteAuthority.client;
      const { email, password } = await testAccountTracker.signUp();
      await signInAuthority(client, target.contentServerUrl, email, password);

      // The browser half of the gate; no ?v=2, so only negotiation can route.
      await setPairingVersion(client, 2);

      await client.setContext('content');
      await client.navigate(
        `${target.contentServerUrl}/connect_another_device?${ELIGIBLE_ENTRYPOINT_QS}`
      );

      const landed = await waitForUrlContaining(
        client,
        PAIR_V2_ROUTES.AUTHORITY_SCAN_QR
      );
      expect(landed).toContain(PAIR_V2_ROUTES.AUTHORITY_SCAN_QR);
    });
  });
});
