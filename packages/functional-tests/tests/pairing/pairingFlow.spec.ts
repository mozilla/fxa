/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * End-to-end pairing flow test.
 *
 * Uses Marionette (authority / desktop Firefox) + Playwright (supplicant)
 * to exercise the full two-device Firefox pairing flow:
 *
 *   Authority (Marionette)          Supplicant (Playwright)
 *   ─────────────────────           ────────────────────────
 *   1. Sign in to FxA via OAuth
 *   2. FxAccountsPairingFlow.start()
 *      → generates QR URL
 *                                   3. Open QR URL → /pair/supp
 *   4. Navigate to approval page
 *   5. Click "Yes, approve device"
 *                                   6. Click "Confirm pairing"
 *   7. → /pair/auth/complete        7. → /oauth/success
 *
 * Prerequisites:
 *   - FXA stack running (auth :9000, content :3030)
 *   - Firefox binary (FIREFOX_BINARY env)
 *   - Internet access (uses production channel server by default;
 *     override with CHANNEL_SERVER_URI env for local testing)
 */

import { test, expect } from '../../lib/fixtures/pairing';
import {
  PAIRING_CLIENT_ID,
  PAIRING_REDIRECT_URI,
  PAIRING_SCOPE,
  SELECTORS,
  TIMEOUTS,
} from '../../lib/pairing-constants';
import {
  signInAuthorityViaMarionette,
  getSignedInUser,
  startPairingFlow,
  buildSupplicantUrl,
  extractChannelId,
  findElementBySelectors,
  waitForUrlContaining,
} from '../../lib/pairing-helpers';

// Increase timeout — pairing involves launching a separate Firefox + channel negotiation
test.setTimeout(120_000);

test.describe('severity-2 #smoke', () => {
  test.describe('Firefox pairing flow', () => {
    test.slow();

    test('authority generates QR URL and supplicant connects via channel', async ({
      target,
      syncOAuthBrowserPages: { page },
      testAccountTracker,
      marionetteAuthority,
    }) => {
      const client = marionetteAuthority.client;

      // ── Step 1: Create a pre-verified test account ──
      const credentials = await testAccountTracker.signUp();

      // ── Step 2: Sign in authority Firefox via Marionette ──
      await signInAuthorityViaMarionette(
        client,
        target.contentServerUrl,
        credentials.email,
        credentials.password
      );

      // Verify signed-in state in chrome context
      const signedInUser = await getSignedInUser(client);
      expect(signedInUser.signedIn).toBe(true);
      expect(signedInUser.email).toBe(credentials.email);

      // ── Step 3: Start pairing on authority ──
      const pairUrl = await startPairingFlow(client);
      expect(pairUrl).toBeTruthy();
      expect(pairUrl).toContain('/pair#');
      expect(pairUrl).toContain('channel_id=');

      const channelId = extractChannelId(pairUrl);
      expect(channelId).toBeTruthy();

      // ── Step 4: Open QR URL in Playwright browser (supplicant) ──
      const suppUrl = buildSupplicantUrl(target.contentServerUrl, pairUrl);
      await page.goto(suppUrl, { waitUntil: 'load' });

      // Wait for supplicant to reach /pair/supp/allow — this means the channel
      // handshake completed and the authority received pair:supp:request.
      // The state machine must be in PendingConfirmations before we open the
      // authority approval page.
      await page.waitForURL(/pair\/supp\/allow/, {
        timeout: TIMEOUTS.SUPPLICANT_ALLOW,
      });

      // ── Step 5: Open authority approval page ──
      // Firefox normally loads this in the fxaPairDevice.xhtml dialog.
      // The /oauth path with the pairing redirect_uri triggers AuthorityRelier.
      expect(signedInUser.uid).toBeTruthy();
      const authorityOAuthParams = new URLSearchParams({
        client_id: PAIRING_CLIENT_ID,
        scope: PAIRING_SCOPE,
        email: credentials.email,
        uid: signedInUser.uid as string,
        channel_id: channelId,
        redirect_uri: PAIRING_REDIRECT_URI,
      });
      const authorityOAuthUrl = `${target.contentServerUrl}/oauth?${authorityOAuthParams}`;

      await client.setContext('content');
      await client.navigate(authorityOAuthUrl);

      // ── Step 6: Authority clicks "Yes, approve device" ──
      // Wait for the approve button to appear instead of a fixed sleep
      const authorityApproveBtn = await findElementBySelectors(
        client,
        SELECTORS.AUTHORITY_APPROVE
      );
      await client.clickElement(authorityApproveBtn);

      // ── Step 7: Supplicant clicks "Confirm pairing" ──
      const confirmButton = page
        .locator('#supp-approve-btn')
        .or(page.getByRole('button', { name: /Confirm|Approve/i }));
      await expect(confirmButton.first()).toBeVisible({
        timeout: TIMEOUTS.AUTHORITY_COMPLETE,
      });
      await confirmButton.first().click();

      // ── Step 8: Verify both sides completed ──
      await expect(async () => {
        const url = page.url();
        expect(url).not.toContain('pair/supp/allow');
      }).toPass({ timeout: TIMEOUTS.AUTHORITY_COMPLETE });

      const finalSuppUrl = page.url();
      expect(finalSuppUrl).not.toContain('pair/failure');
      expect(finalSuppUrl).toContain('oauth/success');

      // Wait for authority to advance from wait_for_supp to complete
      await client.setContext('content');
      const finalAuthUrl = await waitForUrlContaining(
        client,
        'pair/auth/complete',
        TIMEOUTS.AUTHORITY_COMPLETE
      );
      expect(finalAuthUrl).not.toContain('pair/failure');
    });
  });
});
