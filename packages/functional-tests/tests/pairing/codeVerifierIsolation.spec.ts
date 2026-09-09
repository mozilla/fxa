/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Asserts the property the pairing security review depends on: the PKCE
 * code_verifier Firefox generates never reaches web content.
 *
 * This runs against a real Firefox over Marionette, so it exercises the actual
 * FxAccountsOAuth and WebChannel boundary rather than a mock. Two claims:
 *
 *   1. The return value of beginOAuthFlow(), which the WebChannel forwards to
 *      the page verbatim, carries the challenge but not the verifier.
 *   2. Script running as the page, which is an XSS payload's privilege level,
 *      cannot obtain the verifier by sending WebChannel messages.
 *
 * The verifier is read in chrome context and every comparison happens here in
 * Node. It is never interpolated into content-context script, which would put
 * the secret into the page and invert what the test proves.
 */

import { createHash } from 'crypto';
import { test, expect } from '../../lib/fixtures/pairing';
import { TIMEOUTS } from '../../lib/pairing-constants';
import { MarionetteClient } from '../../lib/marionette';

const SCOPES = ['profile', 'https://identity.mozilla.com/apps/oldsync'];

// Firefox builds the verifier from 32 random bytes in base64url, so 43 chars.
const VERIFIER_PATTERN = /^[A-Za-z0-9-_]{43}$/;

// How long the probe collects WebChannel replies before it resolves.
const PROBE_WINDOW_MS = 3000;

// The commands an injected script could reach for. fxa_status is included
// because it is the one command that does hand real credentials to the page,
// so it is the most plausible place for a verifier to be added by mistake.
const PROBE_COMMANDS = [
  'fxaccounts:oauth_flow_begin',
  'fxaccounts:oauth_flow_is_active',
  'fxaccounts:fxa_status',
  'fxaccounts:pair_supplicant_metadata',
  'fxaccounts:pair_heartbeat',
];

type OAuthFlow = {
  /** What the WebChannel forwards to the page verbatim. */
  params: Record<string, unknown>;
  /**
   * Read in chrome rather than derived from `params` here: JSON.stringify drops
   * keys whose value is undefined, so the chrome-side list is the stricter one.
   */
  paramKeys: string[];
  storedVerifier: string;
};

type FlowResult =
  | ({ success: true } & OAuthFlow)
  | { success: false; error: string };

/**
 * Start a real OAuth flow in the parent process and return both the params
 * Firefox would hand to content and the verifier it kept for itself.
 */
async function beginRealOAuthFlow(
  client: MarionetteClient
): Promise<OAuthFlow> {
  await client.setContext('chrome');
  const raw = await client.executeAsyncScript(
    `
    const [resolve] = arguments;
    (async () => {
      try {
        const { getFxAccountsSingleton } = ChromeUtils.importESModule(
          "resource://gre/modules/FxAccounts.sys.mjs"
        );
        const fxAccounts = getFxAccountsSingleton();
        const params = await fxAccounts._internal.beginOAuthFlow(
          ${JSON.stringify(SCOPES)}
        );
        const flow = fxAccounts._internal.oauth.getFlow(params.state);
        resolve(JSON.stringify({
          success: true,
          params,
          paramKeys: Object.keys(params),
          storedVerifier: flow.verifier,
        }));
      } catch (e) {
        resolve(JSON.stringify({ success: false, error: e.message }));
      }
    })();
    `,
    { sandbox: 'system', timeoutMs: TIMEOUTS.ASYNC_SCRIPT }
  );

  if (typeof raw !== 'string') {
    throw new Error(`Expected a string from beginOAuthFlow, got ${typeof raw}`);
  }
  const result = JSON.parse(raw) as FlowResult;
  if (!result.success) {
    throw new Error(`beginOAuthFlow failed: ${result.error}`);
  }
  return result;
}

function pkceChallengeFor(verifier: string): string {
  return createHash('sha256').update(verifier).digest('base64url');
}

/** The probe resolves with a JSON array of WebChannel envelope strings. */
function parseProbeReplies(raw: unknown): string[] {
  if (typeof raw !== 'string') {
    throw new Error(`Expected a string from the probe, got ${typeof raw}`);
  }
  return JSON.parse(raw) as string[];
}

/**
 * Read the verifier Firefox stored for one specific flow.
 *
 * Every beginOAuthFlow() call mints a fresh flow with a fresh verifier, so a
 * reply can only be checked against the verifier belonging to its own state.
 * Comparing against some earlier flow's verifier can never match and would make
 * the assertion unfalsifiable.
 */
async function readStoredVerifier(
  client: MarionetteClient,
  state: string
): Promise<string> {
  await client.setContext('chrome');
  const raw = await client.executeScript(
    `
    const { getFxAccountsSingleton } = ChromeUtils.importESModule(
      "resource://gre/modules/FxAccounts.sys.mjs"
    );
    const flow = getFxAccountsSingleton()._internal.oauth.getFlow(arguments[0]);
    return flow ? flow.verifier : null;
    `,
    { sandbox: 'system', args: [state] }
  );
  if (typeof raw !== 'string') {
    throw new Error(`No stored flow found for state ${state}`);
  }
  return raw;
}

test.describe('PKCE code_verifier isolation', () => {
  // One test, so one Firefox launch: the fixture is test-scoped, and the two
  // boundaries below check the same object. A WebChannel reply carries what
  // beginOAuthFlow() returned, so asserting both here costs nothing extra.
  test('Firefox keeps the code_verifier out of both the params it hands to content and every WebChannel reply', async ({
    marionetteAuthority,
    target,
  }) => {
    const client = marionetteAuthority.client;

    const {
      params,
      paramKeys,
      storedVerifier: directVerifier,
    } = await beginRealOAuthFlow(client);

    // Positive controls. Without these the test would also pass if Firefox
    // stopped using PKCE altogether, or handed back an empty verifier.
    expect(directVerifier).toMatch(VERIFIER_PATTERN);
    expect(params.code_challenge_method).toBe('S256');
    expect(params.code_challenge).toBe(pkceChallengeFor(directVerifier));

    // Absent by key and by value from what beginOAuthFlow() hands back.
    expect(paramKeys).not.toContain('code_verifier');
    expect(paramKeys).not.toContain('verifier');
    expect(JSON.stringify(params)).not.toContain(directVerifier);

    // Load a page on the FxA origin so the WebChannel is in scope, then act
    // as injected script would: send each command and collect every reply.
    await client.setContext('content');
    await client.navigate(target.contentServerUrl);

    const raw = await client.executeAsyncScript(
      `
        const [resolve] = arguments;
        const commands = ${JSON.stringify(PROBE_COMMANDS)};
        const scopes = ${JSON.stringify(SCOPES)};
        const seen = [];
        function record(event) {
          seen.push(
            typeof event.detail === 'string'
              ? event.detail
              : JSON.stringify(event.detail)
          );
        }
        window.addEventListener('WebChannelMessageToContent', record, true);
        commands.forEach(function (command, i) {
          window.dispatchEvent(
            new CustomEvent('WebChannelMessageToChrome', {
              detail: JSON.stringify({
                id: 'account_updates',
                message: {
                  command: command,
                  data: { scopes: scopes },
                  messageId: 'verifier-probe-' + i,
                },
              }),
            })
          );
        });
        setTimeout(function () {
          window.removeEventListener('WebChannelMessageToContent', record, true);
          resolve(JSON.stringify(seen));
        }, ${PROBE_WINDOW_MS});
        `,
      { timeoutMs: TIMEOUTS.ASYNC_SCRIPT }
    );

    const envelopes = parseProbeReplies(raw);
    const replies = envelopes.map((r) => JSON.parse(r).message);

    // Positive control, and the source of the secret to compare against. A
    // reply count alone is too weak: the page sends its own fxa_status, so a
    // count could be satisfied without oauth_flow_begin ever being reached.
    const flowBegin = replies.find(
      (m) =>
        m.command === 'fxaccounts:oauth_flow_begin' &&
        m.messageId === 'verifier-probe-0'
    );
    expect(flowBegin).toBeDefined();
    expect(flowBegin.data.code_challenge_method).toBe('S256');

    // The verifier for the flow this very reply created.
    const storedVerifier = await readStoredVerifier(
      client,
      flowBegin.data.state
    );
    expect(storedVerifier).toMatch(VERIFIER_PATTERN);
    expect(flowBegin.data.code_challenge).toBe(
      pkceChallengeFor(storedVerifier)
    );

    // The property under test, by key and by value, across every reply the
    // page could observe. Scan the whole envelope, not just `message`: a field
    // beside `message` is just as visible to page script.
    expect(Object.keys(flowBegin.data)).not.toContain('code_verifier');
    for (const envelope of envelopes) {
      expect(envelope).not.toContain(storedVerifier);
    }
  });
});
