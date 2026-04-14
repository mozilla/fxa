/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Backbone pairing flow E2E test.
 *
 * Mirrors pairingFlow.spec.ts but exercises the legacy Backbone `/pair/*`
 * templates served by fxa-content-server. Runs only when
 * showReactApp.pairRoutes=false; otherwise skips cleanly.
 *
 * To run this spec locally:
 *   1. Edit packages/fxa-content-server/server/config/local.json
 *      → set "showReactApp.pairRoutes" to false
 *   2. npx pm2 restart content
 *   3. Wait ~10s for the dev server to recompile, then:
 *      cd packages/functional-tests && yarn test-local tests/pairing/
 *   4. Restore by flipping the flag back to true + pm2 restart content
 *
 * The helper functions come from ../../lib/pairing-helpers. Most are
 * stack-agnostic because the sign-in flow, Marionette FxAccounts APIs, and
 * WebSocket channel client are identical between Backbone and React — only
 * the visible pair templates differ. We thread `useReact = false` through
 * the URL builders so no `?showReactApp=true` suffix is appended, which is
 * a no-op under fullProdRollout but keeps intent explicit.
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
  captureDiagnostics,
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

/**
 * Complete the Backbone supplicant approval flow.
 *
 * Mirrors the React `completeSupplicantApproval` helper but finds the
 * confirm button via the Backbone-only id `#supp-approve-btn` without the
 * React `data-testid`. The button id is actually identical between the
 * stacks, so this function could be shared — kept here for symmetry and
 * to avoid touching the React helper.
 */
async function completeBackboneSupplicantApproval(
  page: import('@playwright/test').Page,
  client: MarionetteClient
): Promise<void> {
  const confirmButton = page.locator('#supp-approve-btn');
  await expect(confirmButton).toBeVisible({
    timeout: TIMEOUTS.AUTHORITY_COMPLETE,
  });
  await confirmButton.click();

  await expect(async () => {
    expect(page.url()).not.toContain('pair/supp/allow');
  }).toPass({ timeout: TIMEOUTS.AUTHORITY_COMPLETE });

  const finalSuppUrl = page.url();
  expect(finalSuppUrl).not.toContain('pair/failure');

  await client.setContext('content');
  // Poll the authority URL until it reaches pair/auth/complete
  const start = Date.now();
  let lastAuthUrl = '';
  while (Date.now() - start < TIMEOUTS.AUTHORITY_COMPLETE) {
    lastAuthUrl = await client.getUrl();
    if (lastAuthUrl.includes('pair/auth/complete')) {
      break;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  expect(lastAuthUrl).toContain('pair/auth/complete');
  expect(lastAuthUrl).not.toContain('pair/failure');
}

test.setTimeout(120_000);

test.describe('severity-2 #smoke', () => {
  test.describe.serial('Backbone pairing flow', () => {
    // Mutually exclusive with pairingFlow.spec.ts — only one of these suites
    // runs at a time, gated by the server's showReactApp.pairRoutes config.
    test.beforeEach(async ({ target }, testInfo) => {
      const isReact = await isPairRoutesReact(target.contentServerUrl);
      if (isReact) {
        testInfo.skip(
          true,
          'Backbone pair specs require showReactApp.pairRoutes=false'
        );
      }
    });

    test('authority generates QR URL and supplicant connects via Backbone templates', async ({
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

        // Backbone's supplicant-state-machine.js navigates to /pair/supp/allow
        // once the channel handshake completes (same URL as React). The
        // `#supp-approve-btn` Confirm button is rendered by both stacks with
        // the same id and only appears once /pair/supp/allow has rendered the
        // form, so this single check proves both that the channel handshake
        // succeeded and that the page is interactive.
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
        await completeBackboneSupplicantApproval(page, client);
      });
    });

    test('Backbone pairing with 2FA-enabled account requires TOTP on authority', async ({
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
        await completeBackboneSupplicantApproval(page, client);
      });
    });
  });
});
