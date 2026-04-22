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
 *   ---------------------           ------------------------
 *   1. Sign in to FxA via OAuth
 *   2. FxAccountsPairingFlow.start()
 *      -> generates QR URL
 *                                   3. Open QR URL -> /pair/supp
 *   4. Navigate to approval page
 *   5. Click "Yes, approve device"
 *                                   6. Click "Confirm pairing"
 *   7. -> /pair/auth/complete       7. -> /oauth/success
 *
 * Prerequisites:
 *   - FXA stack running (auth :9000, content :3030)
 *   - Firefox binary (FIREFOX_BINARY env)
 *   - Internet access (uses production channel server by default;
 *     override with CHANNEL_SERVER_URI env for local testing)
 */

import { test, expect } from '../../lib/fixtures/pairing';
import { MarionetteClient } from '../../lib/marionette';
import { SELECTORS, TIMEOUTS } from '../../lib/pairing-constants';
import {
  signInAuthorityViaMarionette,
  getSignedInUser,
  startPairingFlow,
  buildSupplicantUrl,
  buildAuthorityOAuthUrl,
  extractChannelId,
  findElementBySelectors,
  enableTotpOnAccount,
  enterTotpCodeViaMarionette,
  completeSupplicantApproval,
  captureDiagnostics,
  verifyPairChoiceScreen,
  isPairRoutesReact,
} from '../../lib/pairing-helpers';

async function approveAuthorityPairing(
  client: MarionetteClient,
  contentServerUrl: string,
  opts: { email: string; uid: string; channelId: string; totpSecret?: string }
) {
  const authorityOAuthUrl = buildAuthorityOAuthUrl(contentServerUrl, {
    email: opts.email,
    uid: opts.uid,
    channelId: opts.channelId,
  });

  await client.setContext('content');
  await client.navigate(authorityOAuthUrl);

  if (opts.totpSecret) {
    await enterTotpCodeViaMarionette(client, opts.totpSecret);
  }

  const { url: preApproveUrl } = await captureDiagnostics(client);
  if (preApproveUrl.includes('pair/failure')) {
    throw new Error(
      `Authority reached /pair/failure before approve. ` +
        `Supplicant likely did not connect to channel in time.`
    );
  }

  const approveBtn = await findElementBySelectors(
    client,
    SELECTORS.AUTHORITY_APPROVE
  );
  await client.clickElement(approveBtn);
}

// Increase timeout — pairing involves launching a separate Firefox + channel negotiation
test.setTimeout(120_000);

test.describe('severity-2 #smoke', () => {
  test.describe.serial('Firefox pairing flow', () => {
    // Pairing tests use Marionette (Firefox-only) on a shared port. This spec
    // covers the React pair flow — the Backbone equivalent lives in
    // pairingFlowBackbone.spec.ts. The two are mutually exclusive at runtime
    // because content-server reads showReactApp.pairRoutes at startup (see
    // add-routes.js) and pair routes have fullProdRollout: true, so a single
    // server instance only serves one stack.
    // Runs once per worker. Pair-route rollout is env-stable.
    test.beforeAll(async ({ browser, target }) => {
      const isReact = await isPairRoutesReact(browser, target);
      test.skip(
        !isReact,
        'React pair specs require showReactApp.pairRoutes=true'
      );
    });

    test('authority generates QR URL and supplicant connects via channel', async ({
      target,
      syncOAuthBrowserPages: { page },
      testAccountTracker,
      marionetteAuthority,
    }) => {
      const client = marionetteAuthority.client;

      const credentials = await test.step('Create test account', async () => {
        return await testAccountTracker.signUp();
      });

      const signedInUser =
        await test.step('Sign in authority via Marionette', async () => {
          await signInAuthorityViaMarionette(
            client,
            target.contentServerUrl,
            credentials.email,
            credentials.password
          );

          const user = await getSignedInUser(client);
          expect(user.signedIn).toBe(true);
          expect(user.email).toBe(credentials.email);
          return user;
        });

      await test.step('Verify /pair choice screen', async () => {
        await verifyPairChoiceScreen(client, target.contentServerUrl);
      });

      const { pairUrl, channelId } =
        await test.step('Start pairing flow on authority', async () => {
          const url = await startPairingFlow(client);
          expect(url).toBeTruthy();
          expect(url).toContain('/pair#');
          expect(url).toContain('channel_id=');

          const id = extractChannelId(url);
          expect(id).toBeTruthy();
          return { pairUrl: url, channelId: id };
        });

      await test.step('Supplicant opens QR URL', async () => {
        const suppUrl = buildSupplicantUrl(target.contentServerUrl, pairUrl);
        await page.goto(suppUrl, { waitUntil: 'load' });

        // #supp-approve-btn is the supplicant Confirm button rendered by both
        // React and Backbone /pair/supp/allow templates with the same id. It
        // only exists once the channel handshake completes and the authority
        // has sent pair:supp:request, so this single check proves both that
        // the supplicant reached /pair/supp/allow and that the form is
        // interactive.
        await expect(page.locator('#supp-approve-btn')).toBeVisible({
          timeout: TIMEOUTS.SUPPLICANT_ALLOW,
        });
      });

      await test.step('Authority approves pairing', async () => {
        expect(signedInUser.uid).toBeTruthy();
        await approveAuthorityPairing(client, target.contentServerUrl, {
          email: credentials.email,
          uid: signedInUser.uid as string,
          channelId,
        });
      });

      await test.step('Supplicant confirms and verify success', async () => {
        await completeSupplicantApproval(page, client);
      });
    });

    test('pairing with 2FA-enabled account requires TOTP on authority', async ({
      target,
      syncOAuthBrowserPages: { page },
      testAccountTracker,
      marionetteAuthority,
    }) => {
      const client = marionetteAuthority.client;

      const { credentials, secret } =
        await test.step('Create test account with TOTP', async () => {
          const creds = await testAccountTracker.signUp();
          const totpSecret = await enableTotpOnAccount(
            target.authClient,
            creds.sessionToken
          );
          creds.secret = totpSecret;
          return { credentials: creds, secret: totpSecret };
        });

      const signedInUser =
        await test.step('Sign in authority via Marionette', async () => {
          await signInAuthorityViaMarionette(
            client,
            target.contentServerUrl,
            credentials.email,
            credentials.password,
            secret
          );
          const user = await getSignedInUser(client);
          expect(user.signedIn).toBe(true);
          return user;
        });

      await test.step('Verify /pair choice screen', async () => {
        await verifyPairChoiceScreen(client, target.contentServerUrl);
      });

      const channelId =
        await test.step('Start pairing flow on authority', async () => {
          const pairUrl = await startPairingFlow(client);
          const id = extractChannelId(pairUrl);

          const suppUrl = buildSupplicantUrl(target.contentServerUrl, pairUrl);
          await page.goto(suppUrl, { waitUntil: 'load' });
          // See the happy-path test above for the rationale on #supp-approve-btn.
          await expect(page.locator('#supp-approve-btn')).toBeVisible({
            timeout: TIMEOUTS.SUPPLICANT_ALLOW,
          });

          return id;
        });

      await test.step('Authority approves pairing with TOTP', async () => {
        expect(signedInUser.uid).toBeTruthy();
        await approveAuthorityPairing(client, target.contentServerUrl, {
          email: credentials.email,
          uid: signedInUser.uid as string,
          channelId,
          totpSecret: secret,
        });
      });

      await test.step('Supplicant confirms and verify success', async () => {
        await completeSupplicantApproval(page, client);
      });
    });
  });
});
