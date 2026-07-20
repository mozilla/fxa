/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Negative-path pairing E2E tests against Backbone templates.
 *
 * Mirrors pairingFlowNegative.spec.ts but uses Backbone selectors and
 * skips when showReactApp.pairRoutes=true. See pairingFlowBackbone.spec.ts
 * header for the manual config-toggle workflow.
 *
 * Two scenarios:
 *   1. Supplicant clicks the Cancel link on /pair/supp/allow and lands
 *      on /pair/failure with the Backbone copy.
 *   2. Channel server WebSocket disconnects mid-flow — the Backbone
 *      supplicant state machine routes to /pair/failure on a channel
 *      close just like React's PairingSupplicantIntegration.
 */

import { test, expect } from '../../lib/fixtures/pairing';
import { FAILURE_COPY, TIMEOUTS } from '../../lib/pairing-constants';
import {
  signInAuthorityViaMarionette,
  getSignedInUser,
  startPairingFlow,
  buildSupplicantUrl,
  extractChannelId,
  isPairRoutesReact,
} from '../../lib/pairing-helpers';

declare global {
  interface Window {
    __fxaTestWebSockets?: WebSocket[];
  }
}

test.setTimeout(120_000);

test.describe('severity-2 #smoke', () => {
  test.describe.serial('Backbone pairing flow — negative paths', () => {
    // Runs once per worker. Pair-route rollout is env-stable.
    test.beforeAll(async ({ browser, target }) => {
      const isReact = await isPairRoutesReact(browser, target);
      test.skip(
        isReact,
        'Backbone pair specs require showReactApp.pairRoutes=false'
      );
    });

    test('supplicant cancels on /pair/supp/allow and lands on /pair/failure', async ({
      target,
      syncOAuthBrowserPages: { page },
      testAccountTracker,
      marionetteAuthority,
    }) => {
      const client = marionetteAuthority.client;

      const credentials = await test.step('Create test account', async () => {
        return await testAccountTracker.signUp();
      });

      await test.step('Sign in authority via Marionette', async () => {
        await signInAuthorityViaMarionette(
          client,
          target.contentServerUrl,
          credentials.email,
          credentials.password
        );
        const user = await getSignedInUser(client);
        expect(user.signedIn).toBe(true);
      });

      const pairUrl =
        await test.step('Start pairing flow on authority', async () => {
          const url = await startPairingFlow(client);
          expect(url).toContain('/pair#');
          expect(extractChannelId(url)).toBeTruthy();
          return url;
        });

      await test.step('Supplicant opens QR URL', async () => {
        const suppUrl = buildSupplicantUrl(target.contentServerUrl, pairUrl);
        await page.goto(suppUrl, { waitUntil: 'load' });
        // #supp-approve-btn is the "Confirm pairing" button — Backbone and
        // React both render it on /pair/supp/allow with the same id. It only
        // exists after the channel handshake completes, so this single check
        // proves both that the page navigated to /pair/supp/allow and that
        // the form is interactive.
        await expect(page.locator('#supp-approve-btn')).toBeVisible({
          timeout: TIMEOUTS.SUPPLICANT_ALLOW,
        });
      });

      await test.step('Supplicant clicks Cancel', async () => {
        // Backbone supp_allow.mustache renders <a href="#" id="cancel">.
        // The click handler calls replaceCurrentPage('pair/failure').
        const cancelLink = page.locator('a#cancel');
        await expect(cancelLink).toBeVisible();
        await cancelLink.click();
        await page.waitForURL(/pair\/failure/, {
          timeout: TIMEOUTS.AUTHORITY_COMPLETE,
        });
      });

      await test.step('Verify failure page copy', async () => {
        await expect(
          page.getByRole('heading', { name: FAILURE_COPY.heading })
        ).toBeVisible();
        await expect(page.getByText(FAILURE_COPY.body)).toBeVisible();
      });
    });

    test('channel WebSocket disconnect routes supplicant to /pair/failure', async ({
      target,
      syncOAuthBrowserPages: { page },
      testAccountTracker,
      marionetteAuthority,
    }) => {
      const client = marionetteAuthority.client;

      // Same approach as the React negative spec: wrap `window.WebSocket`
      // before any page JS runs so we can later force-close the supplicant's
      // channel WebSocket via `page.evaluate` and verify the disconnect path
      // routes to /pair/failure.
      //
      // Why a wrapper instead of network interception: Playwright 1.44.1
      // (pinned by this package) has no `routeWebSocket` API. Subclassing
      // the native WebSocket lets static constants and prototype methods
      // inherit for free, so the wrapped class is a drop-in replacement.
      //
      // Stack-agnostic: Backbone's `pairing-channel-client.js` and React's
      // `PairingSupplicantIntegration` both call `new WebSocket(uri)` once
      // per channel session, so tracking instances on `window` works the
      // same way in both.
      //
      // No teardown is needed: `page.addInitScript` is scoped to this `page`
      // instance only, and the page is closed at end-of-test by the
      // `syncOAuthBrowserPages` fixture, so the wrapper does not leak.
      await page.addInitScript(() => {
        const OriginalWebSocket = window.WebSocket;
        const sockets: WebSocket[] = [];
        window.__fxaTestWebSockets = sockets;
        class TrackedWebSocket extends OriginalWebSocket {
          constructor(url: string | URL, protocols?: string | string[]) {
            super(url, protocols);
            sockets.push(this);
          }
        }
        window.WebSocket = TrackedWebSocket as unknown as typeof WebSocket;
      });

      const credentials = await test.step('Create test account', async () => {
        return await testAccountTracker.signUp();
      });

      await test.step('Sign in authority via Marionette', async () => {
        await signInAuthorityViaMarionette(
          client,
          target.contentServerUrl,
          credentials.email,
          credentials.password
        );
        const user = await getSignedInUser(client);
        expect(user.signedIn).toBe(true);
      });

      const pairUrl =
        await test.step('Start pairing flow on authority', async () => {
          return await startPairingFlow(client);
        });

      await test.step('Supplicant opens QR URL and reaches allow page', async () => {
        const suppUrl = buildSupplicantUrl(target.contentServerUrl, pairUrl);
        await page.goto(suppUrl, { waitUntil: 'load' });
        // See the cancel test above for the rationale on #supp-approve-btn.
        await expect(page.locator('#supp-approve-btn')).toBeVisible({
          timeout: TIMEOUTS.SUPPLICANT_ALLOW,
        });
      });

      await test.step('Force-close the channel WebSocket', async () => {
        const closed = await page.evaluate(() => {
          const sockets = window.__fxaTestWebSockets || [];
          let n = 0;
          for (const ws of sockets) {
            try {
              ws.close();
              n++;
            } catch {
              /* ignore */
            }
          }
          return n;
        });
        expect(
          closed,
          'Expected at least one tracked WebSocket to close'
        ).toBeGreaterThan(0);
      });

      await test.step('Supplicant navigates to /pair/failure', async () => {
        await page.waitForURL(/pair\/failure/, {
          timeout: TIMEOUTS.AUTHORITY_COMPLETE,
        });
        await expect(
          page.getByRole('heading', { name: FAILURE_COPY.heading })
        ).toBeVisible();
      });
    });
  });
});
