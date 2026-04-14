/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Negative-path pairing E2E tests.
 *
 * Exercises failure modes that should land the user on /pair/failure:
 *
 *   1. Supplicant clicks "Cancel" on /pair/supp/allow
 *   2. Channel server WebSocket disconnects mid-flow
 *
 * Shares the happy-path setup from pairingFlow.spec.ts (Marionette authority
 * plus Playwright supplicant) but stops short of completing the approval.
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

// Extend the window type so TS accepts the init-script hook.
declare global {
  interface Window {
    __fxaTestWebSockets?: WebSocket[];
  }
}

test.setTimeout(120_000);

test.describe('severity-2 #smoke', () => {
  test.describe.serial('Firefox pairing flow — negative paths', () => {
    test.beforeEach(async ({ target }, testInfo) => {
      const isReact = await isPairRoutesReact(target.contentServerUrl);
      if (!isReact) {
        testInfo.skip(
          true,
          'React pair specs require showReactApp.pairRoutes=true'
        );
      }
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
        // #supp-approve-btn is the supplicant "Confirm pairing" button rendered
        // by both React and Backbone /pair/supp/allow templates with the same
        // id. It only exists after the channel handshake completes and the
        // form renders, so this single check proves both that the page is on
        // /pair/supp/allow and that the supplicant integration is interactive.
        await expect(page.locator('#supp-approve-btn')).toBeVisible({
          timeout: TIMEOUTS.SUPPLICANT_ALLOW,
        });
      });

      await test.step('Supplicant clicks Cancel', async () => {
        const cancelButton = page.getByRole('button', { name: /^Cancel$/ });
        await expect(cancelButton).toBeVisible();
        await cancelButton.click();
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

      // To simulate a channel-server disconnect, we need to forcibly close
      // the supplicant's WebSocket mid-flow and verify the supplicant
      // integration handles the close by routing to /pair/failure. Playwright
      // 1.44.1 (the version pinned by this package) has no `routeWebSocket`
      // API, so we cannot intercept the WS at the network layer.
      //
      // Instead, before any page JS runs, we wrap `window.WebSocket` to track
      // every constructed instance on `window.__fxaTestWebSockets`. Later we
      // call `page.evaluate(() => sockets.forEach(ws => ws.close()))` from
      // the test to trigger the close path.
      //
      // The wrapper subclasses the native WebSocket so the static constants
      // (CONNECTING/OPEN/CLOSING/CLOSED) and prototype methods are inherited
      // for free — no need to copy read-only props.
      //
      // No teardown is needed: `page.addInitScript` is scoped to this `page`
      // instance only, and the page is closed at end-of-test by the
      // `syncOAuthBrowserPages` fixture, so the wrapper does not leak across
      // tests.
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
        // Calling `ws.close()` with no arguments triggers an abnormal close
        // on the server side because no graceful close handshake completes.
        // The pairing channel client surfaces this as a CONNECTION_CLOSED
        // error, which the supplicant integration handles by transitioning
        // to the Failed terminal state and routing to /pair/failure.
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
