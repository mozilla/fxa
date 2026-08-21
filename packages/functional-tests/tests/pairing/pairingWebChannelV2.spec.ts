/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Web channel contract test for the v2 pairing commands.
 *
 * The v2 pairing design moves the authority's channel-server conversation out
 * of browser chrome and into FxA web code. Chrome keeps only the two secrets it
 * must not hand over — the PKCE verifier and the scoped keys — and exposes them
 * through two web channel commands:
 *
 *   fxaccounts:pair_oauth_start   supplicant side; wraps oauth.beginOAuthFlow()
 *   fxaccounts:pair_oauth_finish  authority side; wraps authorizeOAuthCode()
 *
 * These specs drive the commands the way `fxa-settings/src/lib/channels/
 * firefox.ts` does — a `WebChannelMessageToChrome` event dispatched from a real
 * page on the content-server origin — so they cover the message plumbing, the
 * origin allowlist and the pref gate. The chrome helpers themselves are unit
 * tested in mozilla-central (services/fxaccounts/tests/xpcshell/test_web_channel.js);
 * what cannot be covered there is that a page on the real origin can reach them.
 *
 * Prerequisites:
 *   - FxA stack running (auth :9000, content :3030)
 *   - FIREFOX_BINARY pointing at a Firefox that implements the v2 commands.
 *     Stock and Playwright-bundled Firefox do NOT — the commands are unlanded.
 *     Build one from a mozilla-central checkout carrying the patch:
 *       MOZCONFIG=$PWD/mozconfig-desktop-artifact ./mach build
 *       FIREFOX_BINARY=<objdir>/dist/Nightly.app/Contents/MacOS/firefox
 *
 * Set PAIRING_V2_ENABLED=1 to run; skipped by default, including in CI.
 */

import { test, expect } from '../../lib/fixtures/pairing';
import { MarionetteClient } from '../../lib/marionette';
import { PAIRING_CLIENT_ID, TIMEOUTS } from '../../lib/pairing-constants';
import {
  signInAuthorityViaMarionette,
  getSignedInUser,
  setPairingVersion,
} from '../../lib/pairing-helpers';

const OLDSYNC_SCOPE = 'https://identity.mozilla.com/apps/oldsync';

/** Shape returned by the in-page web channel driver below. */
type WebChannelReply = {
  /** `data` from the chrome response, absent when chrome returned an error. */
  data?: Record<string, unknown>;
  /** Populated when chrome rejected the command via `_sendError`. */
  error?: string;
  /** Set when no response arrived before the driver's own deadline. */
  timedOut?: boolean;
};

/**
 * Send one web channel command from page content and wait for chrome's reply.
 *
 * This mirrors `Firefox.send` / `handleFirefoxEvent` in fxa-settings rather
 * than calling chrome directly, so a break in the event plumbing, the channel
 * id or the origin allowlist fails the test. The page must already be on an
 * origin the FxA web channel is registered for.
 */
async function sendWebChannelCommand(
  client: MarionetteClient,
  command: string,
  data: Record<string, unknown>,
  messageId: string
): Promise<WebChannelReply> {
  await client.setContext('content');
  const raw = await client.executeAsyncScript(
    `
    const [command, data, messageId, timeoutMs, resolve] = arguments;
    const CHANNEL_ID = 'account_updates';
    let done = false;

    const finish = (result) => {
      if (done) return;
      done = true;
      window.removeEventListener('WebChannelMessageToContent', onMessage);
      resolve(JSON.stringify(result));
    };

    function onMessage(event) {
      let detail = event.detail;
      if (typeof detail === 'string') {
        try {
          detail = JSON.parse(detail);
        } catch (e) {
          return;
        }
      }
      if (!detail || detail.id !== CHANNEL_ID) return;
      const message = detail.message;
      // Correlate on messageId so a stray broadcast for another command, for
      // example a profile:change, cannot satisfy this wait.
      if (!message || message.messageId !== messageId) return;
      if (message.data && message.data.error) {
        finish({ error: String(message.data.error.message || message.data.error) });
        return;
      }
      finish({ data: message.data });
    }

    window.addEventListener('WebChannelMessageToContent', onMessage);
    setTimeout(() => finish({ timedOut: true }), timeoutMs);

    window.dispatchEvent(new CustomEvent('WebChannelMessageToChrome', {
      detail: JSON.stringify({
        id: CHANNEL_ID,
        message: { command, data, messageId },
      }),
    }));
    `,
    {
      // The driver resolves on its own deadline; give Marionette headroom past
      // it so a timed-out command reports `timedOut` instead of a script abort.
      args: [command, data, messageId, TIMEOUTS.ASYNC_SCRIPT],
      timeoutMs: TIMEOUTS.ASYNC_SCRIPT + 5_000,
    }
  );

  if (typeof raw !== 'string') {
    throw new Error(`Web channel driver returned a non-string for ${command}`);
  }
  return JSON.parse(raw) as WebChannelReply;
}

/** Fail with the chrome-side reason rather than a bare undefined-property error. */
function expectData(reply: WebChannelReply, command: string) {
  expect(
    reply.error ?? (reply.timedOut ? 'timed out' : undefined),
    `${command} should succeed`
  ).toBeUndefined();
  expect(reply.data, `${command} should return data`).toBeDefined();
  return reply.data as Record<string, unknown>;
}

// A real Firefox launch plus an OAuth sign-in and two auth-server round trips.
test.setTimeout(120_000);

test.describe('severity-2', () => {
  test.describe.serial('pairing v2 web channels', () => {
    // Gate before any fixture resolves — `marionetteAuthority` launches a real
    // Firefox, so it must not be built only to be thrown away on a skip.
    test.beforeEach(async ({}, testInfo) => {
      if (!process.env.PAIRING_V2_ENABLED) {
        testInfo.skip(
          true,
          'Set PAIRING_V2_ENABLED=1 to run the v2 pairing web channel tests'
        );
      }
      if (!process.env.FIREFOX_BINARY) {
        testInfo.skip(
          true,
          'FIREFOX_BINARY must point at a Firefox implementing fxaccounts:pair_oauth_start'
        );
      }
    });

    test.beforeEach(async ({ marionetteAuthority }) => {
      // Each test states the version it needs; reset so an earlier test that
      // lowered the pref cannot leak into the next one.
      await setPairingVersion(marionetteAuthority.client, 2);
    });

    test('fxa_status reports pairingVersion 2', async ({
      target,
      marionetteAuthority,
    }) => {
      const client = marionetteAuthority.client;
      await client.setContext('content');
      await client.navigate(target.contentServerUrl);

      const reply = await sendWebChannelCommand(
        client,
        'fxaccounts:fxa_status',
        { context: 'oauth_webchannel_v1', service: 'sync', isPairing: true },
        'status-reports-version'
      );

      const capabilities = expectData(reply, 'fxa_status')
        .capabilities as Record<string, unknown>;
      // FxA gates the v2 flow on this field, so the negotiation only works if
      // the browser actually reports it. See ConnectAnotherDevice/index.tsx.
      expect(capabilities.pairing).toBe(true);
      expect(capabilities.pairingVersion).toBe(2);
    });

    test('pair_oauth_start returns the OAuth parameters the authority needs', async ({
      target,
      marionetteAuthority,
    }) => {
      const client = marionetteAuthority.client;
      await client.setContext('content');
      await client.navigate(target.contentServerUrl);

      const reply = await sendWebChannelCommand(
        client,
        'fxaccounts:pair_oauth_start',
        {},
        'start-returns-params'
      );

      const params = expectData(reply, 'pair_oauth_start');
      // These four are exactly what the 'pair:supp:request' channel message
      // requires, and what firefox.ts asserts on before relaying them.
      expect(Object.keys(params).sort()).toEqual(
        expect.arrayContaining(['code_challenge', 'keys_jwk', 'scope', 'state'])
      );
      expect(typeof params.state).toBe('string');
      expect(typeof params.code_challenge).toBe('string');
      expect(typeof params.keys_jwk).toBe('string');
      // Defaulted by the chrome helper when the caller sends no scopes.
      expect(params.scope).toContain(OLDSYNC_SCOPE);
      expect(params.scope).toContain('profile');
      // The verifier is the one secret that must never cross the channel.
      expect(params).not.toHaveProperty('code_verifier');
    });

    test('pair_oauth_finish grants a code for the supplicant parameters', async ({
      target,
      testAccountTracker,
      marionetteAuthority,
    }) => {
      const client = marionetteAuthority.client;

      const credentials =
        await test.step('Create and sign in account', async () => {
          const creds = await testAccountTracker.signUp();
          await signInAuthorityViaMarionette(
            client,
            target.contentServerUrl,
            creds.email,
            creds.password
          );
          const user = await getSignedInUser(client);
          // authorizeOAuthCode runs under withVerifiedAccountState, so an
          // unverified session would fail here for the wrong reason.
          expect(user.signedIn).toBe(true);
          return creds;
        });
      expect(credentials.email).toBeTruthy();

      await client.setContext('content');
      await client.navigate(target.contentServerUrl);

      const startParams = await test.step('Supplicant half', async () => {
        const reply = await sendWebChannelCommand(
          client,
          'fxaccounts:pair_oauth_start',
          {},
          'finish-start-half'
        );
        return expectData(reply, 'pair_oauth_start');
      });

      const reply = await sendWebChannelCommand(
        client,
        'fxaccounts:pair_oauth_finish',
        {
          client_id: PAIRING_CLIENT_ID,
          state: startParams.state,
          scope: startParams.scope,
          code_challenge: startParams.code_challenge,
          // Exercises #createKeysJWE, which wraps the scoped keys for the
          // supplicant so the auth server never sees them.
          keys_jwk: startParams.keys_jwk,
        },
        'finish-grants-code'
      );

      const granted = expectData(reply, 'pair_oauth_finish');
      // 'pair:auth:authorize' carries exactly these two fields.
      expect(typeof granted.code).toBe('string');
      expect((granted.code as string).length).toBeGreaterThan(0);
      // State must round-trip untouched or the supplicant rejects the grant.
      expect(granted.state).toBe(startParams.state);
    });

    test('pair_oauth_start is rejected when the pairing version is 1', async ({
      target,
      marionetteAuthority,
    }) => {
      const client = marionetteAuthority.client;
      await setPairingVersion(client, 1);

      await client.setContext('content');
      await client.navigate(target.contentServerUrl);

      const reply = await sendWebChannelCommand(
        client,
        'fxaccounts:pair_oauth_start',
        {},
        'start-gated-by-version'
      );

      // _ensurePairingEnabled throws below version 2. Without this gate an old
      // FxA would reach a half-built flow on a browser that cannot finish it.
      expect(reply.timedOut, 'the gate should reply, not hang').toBeFalsy();
      expect(reply.error).toContain('fxaccounts:pair_oauth_start');
      expect(reply.data).toBeUndefined();
    });
  });
});
