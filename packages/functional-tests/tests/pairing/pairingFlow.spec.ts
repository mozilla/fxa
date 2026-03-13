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
 *
 * Set PAIRING_DEBUG=1 for verbose debug output.
 *
 * The test checks showReactApp.pairRoutes from the content server config to
 * determine whether to run the React or Backbone variant. When pairRoutes is
 * enabled, the Backbone /pair/* routes are deregistered and only React
 * (fxa-settings) serves them. When disabled, only Backbone is available.
 */

import { test, expect } from '../../lib/fixtures/pairing';
import {
  SELECTORS,
  TIMEOUTS,
} from '../../lib/pairing-constants';
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
  screenshotSupplicant,
  screenshotAuthority,
  isPairRoutesReact,
  captureDiagnostics,
} from '../../lib/pairing-helpers';

const DEBUG = !!process.env.PAIRING_DEBUG;
const debug = (msg: string) => DEBUG && console.log(`[PAIRING] ${msg}`);

// Increase timeout — pairing involves launching a separate Firefox + channel negotiation
test.setTimeout(120_000);

test.describe('severity-2 #smoke', () => {
  for (const useReact of [false, true]) {
    const variant = useReact ? 'React' : 'Backbone';

    test.describe.serial(`Firefox pairing flow (${variant})`, () => {
      test.slow();

      // Pairing tests use Marionette (Firefox-only) on a shared port and require
      // a local FXA stack. Only run on the "local" project (Firefox browser).
      // Skip the variant that doesn't match the server's pairRoutes config:
      // when pairRoutes is enabled, Backbone routes 404 — run React only.
      // When disabled, React routes aren't registered — run Backbone only.
      test.beforeEach(async ({ target }, testInfo) => {
        if (testInfo.project.name !== 'local') {
          testInfo.skip(true, 'Pairing tests only run on the local (Firefox) project');
        }
        const reactEnabled = await isPairRoutesReact(target.contentServerUrl);
        if (useReact !== reactEnabled) {
          testInfo.skip(
            true,
            `pairRoutes=${reactEnabled}, skipping ${variant} variant`
          );
        }
      });

      test('authority generates QR URL and supplicant connects via channel', async ({
        target,
        syncOAuthBrowserPages: { page },
        testAccountTracker,
        marionetteAuthority,
      }) => {
        const client = marionetteAuthority.client;

        const credentials = await test.step('Create test account', async () => {
          const creds = await testAccountTracker.signUp();
          debug(`Account created: ${creds.email}`);
          return creds;
        });

        const signedInUser = await test.step('Sign in authority via Marionette', async () => {
          await signInAuthorityViaMarionette(
            client,
            target.contentServerUrl,
            credentials.email,
            credentials.password,
            undefined,
            useReact
          );

          const user = await getSignedInUser(client);
          expect(user.signedIn).toBe(true);
          expect(user.email).toBe(credentials.email);
          await screenshotAuthority(client, variant, '1-signed-in');
          return user;
        });

        const { pairUrl, channelId } = await test.step('Start pairing flow on authority', async () => {
          const url = await startPairingFlow(client);
          debug(`Pair URL: ${url}`);
          expect(url).toBeTruthy();
          expect(url).toContain('/pair#');
          expect(url).toContain('channel_id=');

          const id = extractChannelId(url);
          expect(id).toBeTruthy();
          return { pairUrl: url, channelId: id };
        });

        await test.step('Supplicant opens QR URL', async () => {
          const suppUrl = buildSupplicantUrl(target.contentServerUrl, pairUrl, useReact);
          await page.goto(suppUrl, { waitUntil: 'load' });

          // Wait for supplicant to reach /pair/supp/allow — this means the channel
          // handshake completed and the authority received pair:supp:request.
          await page.waitForURL(/pair\/supp\/allow/, {
            timeout: TIMEOUTS.SUPPLICANT_ALLOW,
          });
          await screenshotSupplicant(page, variant, '2-supp-allow');
        });

        await test.step('Authority approves pairing', async () => {
          expect(signedInUser.uid).toBeTruthy();
          const authorityOAuthUrl = buildAuthorityOAuthUrl(
            target.contentServerUrl,
            {
              email: credentials.email,
              uid: signedInUser.uid as string,
              channelId,
            },
            useReact
          );

          await client.setContext('content');
          await client.navigate(authorityOAuthUrl);
          await screenshotAuthority(client, variant, '3-auth-approve');

          // Check we haven't landed on failure before attempting approve
          const { url: preApproveUrl } = await captureDiagnostics(client);
          if (preApproveUrl.includes('pair/failure')) {
            throw new Error(
              `Authority reached /pair/failure before approve. ` +
              `Supplicant likely did not connect to channel in time.`
            );
          }

          const authorityApproveBtn = await findElementBySelectors(
            client,
            SELECTORS.AUTHORITY_APPROVE
          );
          await client.clickElement(authorityApproveBtn);
          await screenshotAuthority(client, variant, '4-auth-approved');
        });

        await test.step('Supplicant confirms and verify success', async () => {
          await screenshotSupplicant(page, variant, '5-supp-confirm');
          await completeSupplicantApproval(page, client);
          await screenshotSupplicant(page, variant, '6-supp-success');
          await screenshotAuthority(client, variant, '7-auth-complete');
        });
      });

      test('pairing with 2FA-enabled account requires TOTP on authority', async ({
        target,
        syncOAuthBrowserPages: { page },
        testAccountTracker,
        marionetteAuthority,
      }) => {
        const client = marionetteAuthority.client;

        const { credentials, secret } = await test.step('Create test account with TOTP', async () => {
          const creds = await testAccountTracker.signUp();
          const totpSecret = await enableTotpOnAccount(
            target.authClient,
            creds.sessionToken
          );
          creds.secret = totpSecret;
          return { credentials: creds, secret: totpSecret };
        });

        const signedInUser = await test.step('Sign in authority via Marionette', async () => {
          await signInAuthorityViaMarionette(
            client,
            target.contentServerUrl,
            credentials.email,
            credentials.password,
            secret,
            useReact
          );
          const user = await getSignedInUser(client);
          expect(user.signedIn).toBe(true);
          return user;
        });

        const channelId = await test.step('Start pairing flow on authority', async () => {
          const pairUrl = await startPairingFlow(client);
          const id = extractChannelId(pairUrl);

          const suppUrl = buildSupplicantUrl(target.contentServerUrl, pairUrl, useReact);
          await page.goto(suppUrl, { waitUntil: 'load' });
          await page.waitForURL(/pair\/supp\/allow/, {
            timeout: TIMEOUTS.SUPPLICANT_ALLOW,
          });

          return id;
        });

        await test.step('Authority approves pairing with TOTP', async () => {
          expect(signedInUser.uid).toBeTruthy();
          const authorityOAuthUrl = buildAuthorityOAuthUrl(
            target.contentServerUrl,
            {
              email: credentials.email,
              uid: signedInUser.uid as string,
              channelId,
            },
            useReact
          );

          await client.setContext('content');
          await client.navigate(authorityOAuthUrl);

          await enterTotpCodeViaMarionette(client, secret);

          // Check we haven't landed on failure before attempting approve
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
        });

        await test.step('Supplicant confirms and verify success', async () => {
          await completeSupplicantApproval(page, client);
        });
      });
    });
  }
});
