/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Helper functions for pairing E2E tests.
 *
 * Extracted from pairingFlow.spec.ts for reuse and maintainability.
 */

import crypto from 'crypto';
import { MarionetteClient } from './marionette';
import {
  PAIRING_CLIENT_ID,
  PAIRING_SCOPE,
  SELECTORS,
  TIMEOUTS,
} from './pairing-constants';

// ─────────────────────────────────────────────────────────────────────────────
// Wait utilities (condition-based replacements for sleep)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Poll `client.getUrl()` until the URL contains the given substring.
 */
export async function waitForUrlContaining(
  client: MarionetteClient,
  substring: string,
  timeoutMs = TIMEOUTS.AUTHORITY_COMPLETE
): Promise<string> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const url = await client.getUrl();
    if (url.includes(substring)) return url;
    await sleep(TIMEOUTS.POLL_INTERVAL);
  }
  const finalUrl = await client.getUrl();
  throw new Error(
    `URL did not contain "${substring}" after ${timeoutMs}ms. Current URL: ${finalUrl}`
  );
}

/**
 * Poll `client.getUrl()` until the URL differs from `previousUrl`.
 */
export async function waitForUrlChange(
  client: MarionetteClient,
  previousUrl: string,
  timeoutMs = TIMEOUTS.AUTHORITY_COMPLETE
): Promise<string> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const url = await client.getUrl();
    if (url !== previousUrl) return url;
    await sleep(TIMEOUTS.POLL_INTERVAL);
  }
  throw new Error(
    `URL did not change from "${previousUrl}" after ${timeoutMs}ms`
  );
}

/**
 * Poll `getSignedInUser()` until Firefox reports `signedIn: true`.
 */
export async function waitForSignedInState(
  client: MarionetteClient,
  timeoutMs = TIMEOUTS.SIGNED_IN_CHECK
): Promise<{ signedIn: boolean; email?: string; uid?: string }> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const user = await getSignedInUser(client);
    if (user.signedIn) return user;
    await sleep(TIMEOUTS.POLL_INTERVAL);
  }
  throw new Error(
    `Firefox did not reach signed-in state after ${timeoutMs}ms`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Core helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sign in to FxA Sync via the content server web UI using Marionette.
 *
 * Uses Firefox's internal beginOAuthFlow() to generate PKCE + keys_jwk
 * and register the OAuth flow, then signs in through the content server UI.
 * After sign-in, Firefox processes the fxaccounts:oauth_login WebChannel
 * message and completes the key exchange automatically.
 */
export async function signInAuthorityViaMarionette(
  client: MarionetteClient,
  contentServerUrl: string,
  email: string,
  password: string
): Promise<void> {
  // Use Firefox's internal beginOAuthFlow() to generate PKCE + keys_jwk
  // and register the OAuth flow so Firefox can complete the key exchange
  // when the content server sends fxaccounts:oauth_login via WebChannel.
  // Requires Playwright's bundled Firefox (125+).
  await client.setContext('chrome');
  const oauthResult = await client.executeAsyncScript(
    `
    const [resolve] = arguments;
    (async () => {
      try {
        const { getFxAccountsSingleton } = ChromeUtils.importESModule(
          "resource://gre/modules/FxAccounts.sys.mjs"
        );
        const fxAccounts = getFxAccountsSingleton();
        const scopes = ["profile", "https://identity.mozilla.com/apps/oldsync"];
        const result = await fxAccounts._internal.beginOAuthFlow(scopes);
        resolve(JSON.stringify({ success: true, ...result }));
      } catch (e) {
        resolve(JSON.stringify({
          success: false,
          error: e.message,
          stack: (e.stack || "").substring(0, 500),
        }));
      }
    })();
    `,
    { sandbox: 'system', timeoutMs: TIMEOUTS.ASYNC_SCRIPT }
  );

  if (typeof oauthResult !== 'string') {
    throw new Error(
      `Expected string from beginOAuthFlow, got ${typeof oauthResult}`
    );
  }
  const oauthData = JSON.parse(oauthResult);
  if (!oauthData.success) {
    throw new Error(`beginOAuthFlow failed: ${oauthData.error}`);
  }

  // Build the sign-in URL from the OAuth params Firefox generated
  const params = new URLSearchParams({
    context: 'oauth_webchannel_v1',
    entrypoint: 'fxa_discoverability_native',
    action: 'email',
    service: 'sync',
    client_id: oauthData.client_id,
    scope: oauthData.scope || PAIRING_SCOPE,
    state: oauthData.state,
    code_challenge: oauthData.code_challenge,
    code_challenge_method: oauthData.code_challenge_method || 'S256',
    keys_jwk: oauthData.keys_jwk,
    access_type: 'offline',
    response_type: 'code',
  });
  const signinUrl = `${contentServerUrl}/?${params}`;

  try {
    await client.setContext('content');
    await client.navigate(signinUrl);

    // Wait for the email input to appear instead of a fixed sleep
    await findElementBySelectors(client, SELECTORS.EMAIL_INPUT);

    // Enter email — use script-based value setting for React compatibility.
    // Marionette's sendKeys doesn't always trigger React's synthetic onChange.
    await setInputValueByScript(client, SELECTORS.EMAIL_INPUT, email);

    // Click submit
    const submitBtn = await findElementBySelectors(
      client,
      SELECTORS.SUBMIT_BUTTON
    );
    await client.clickElement(submitBtn);

    // Wait for the password input to appear instead of a fixed sleep
    await findElementBySelectors(client, SELECTORS.PASSWORD_INPUT);

    // Enter password
    await setInputValueByScript(
      client,
      SELECTORS.PASSWORD_INPUT,
      password
    );

    // Click sign-in submit
    const signInBtn = await findElementBySelectors(
      client,
      SELECTORS.SUBMIT_BUTTON
    );
    await client.clickElement(signInBtn);

    // Wait for URL to change away from the sign-in page
    await waitForUrlChange(client, signinUrl);

    // Dismiss any unexpected dialogs (e.g. "save password?")
    try {
      await client.dismissAlert();
    } catch {
      /* no alert */
    }

    // Handle intermediary pages (e.g. inline_recovery_key_setup)
    const afterPwUrl = await client.getUrl();
    if (afterPwUrl.includes('inline_recovery_key_setup')) {
      await client.executeScript(`
        const links = Array.from(document.querySelectorAll('a, button'));
        for (const el of links) {
          if (/later|skip|not now|do it later/i.test(el.textContent)) { el.click(); break; }
        }
      `);
      await waitForUrlChange(client, afterPwUrl);
    }

    // Wait for Firefox to reach signed-in state via WebChannel
    await waitForSignedInState(client);
  } catch (err) {
    await client.setContext('content').catch(() => {});
    const { url, title } = await captureDiagnostics(client);
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(
      `signInAuthorityViaMarionette failed at URL: ${url} (title: "${title}"): ${message}`
    );
  }
}

/**
 * Check if Firefox is signed in via fxAccounts.getSignedInUser().
 */
export async function getSignedInUser(
  client: MarionetteClient
): Promise<{ signedIn: boolean; email?: string; uid?: string }> {
  await client.setContext('chrome');
  const result = await client.executeAsyncScript(
    `
    const [resolve] = arguments;
    (async () => {
      try {
        const { getFxAccountsSingleton } = ChromeUtils.importESModule(
          "resource://gre/modules/FxAccounts.sys.mjs"
        );
        const fxAccounts = getFxAccountsSingleton();
        const data = await fxAccounts.getSignedInUser();
        resolve(JSON.stringify({
          signedIn: !!data,
          email: data ? data.email : null,
          uid: data ? data.uid : null,
        }));
      } catch (e) {
        resolve(JSON.stringify({ signedIn: false, error: e.message }));
      }
    })();
    `,
    { sandbox: 'system', timeoutMs: TIMEOUTS.SIGNED_IN_CHECK }
  );

  if (typeof result !== 'string') {
    return { signedIn: false };
  }
  return JSON.parse(result);
}

/**
 * Start the pairing flow on the authority and return the QR URL.
 */
export async function startPairingFlow(
  client: MarionetteClient
): Promise<string> {
  await client.setContext('chrome');
  const result = await client.executeAsyncScript(
    `
    const [resolve] = arguments;
    (async () => {
      try {
        const { EventEmitter } = ChromeUtils.importESModule(
          "resource://gre/modules/EventEmitter.sys.mjs"
        );
        const { FxAccountsPairingFlow } = ChromeUtils.importESModule(
          "resource://gre/modules/FxAccountsPairing.sys.mjs"
        );

        const emitter = new EventEmitter();
        const uri = await FxAccountsPairingFlow.start({ emitter });
        resolve(JSON.stringify({ success: true, uri }));
      } catch (e) {
        resolve(JSON.stringify({
          success: false,
          error: e.message,
          stack: (e.stack || '').substring(0, 500),
        }));
      }
    })();
    `,
    { sandbox: 'system', timeoutMs: TIMEOUTS.ASYNC_SCRIPT }
  );

  if (typeof result !== 'string') {
    throw new Error('Unexpected non-string result from pairing flow');
  }
  const data = JSON.parse(result);
  if (data.success) {
    return data.uri;
  }
  throw new Error(`Pairing flow failed: ${data.error}`);
}

/**
 * Build the supplicant URL from the QR URL.
 *
 * The QR URL is /pair#channel_id=...&channel_key=...
 * The SupplicantRelier expects:
 *   - OAuth params (client_id, code_challenge, etc.) as QUERY params
 *   - channel_id/channel_key as HASH params (fragment)
 *
 * NOTE: Do NOT include redirect_uri — it triggers AuthorityRelier instead.
 */
export function buildSupplicantUrl(
  contentServerUrl: string,
  pairUrl: string
): string {
  // Parse and validate channel params from the QR URL fragment first
  const fragment = pairUrl.split('#')[1];
  if (!fragment) {
    throw new Error(`Pair URL has no fragment: ${pairUrl}`);
  }
  const channelParams = new URLSearchParams(fragment);
  const channelId = channelParams.get('channel_id');
  const channelKey = channelParams.get('channel_key');
  if (!channelId || !channelKey) {
    throw new Error(
      `Pair URL fragment missing channel_id or channel_key: ${fragment}`
    );
  }

  // Generate PKCE code_challenge
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');

  // Generate keys_jwk -- base64url-encoded EC P-256 public key as JWK.
  // The authority uses this to encrypt scoped keys via JWE.
  const { publicKey } = crypto.generateKeyPairSync('ec', {
    namedCurve: 'P-256',
  });
  const keysJwk = Buffer.from(
    JSON.stringify(publicKey.export({ format: 'jwk' }))
  ).toString('base64url');

  const queryParams = new URLSearchParams({
    client_id: PAIRING_CLIENT_ID,
    scope: PAIRING_SCOPE,
    state: crypto.randomUUID().replace(/-/g, ''),
    access_type: 'offline',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    keys_jwk: keysJwk,
  });

  const hashParams = new URLSearchParams({
    channel_id: channelId,
    channel_key: channelKey,
  });

  return `${contentServerUrl}/pair/supp?${queryParams}#${hashParams}`;
}

/**
 * Extract channel_id from a pairing QR URL.
 * URL format: http://localhost:3030/pair#channel_id=...&channel_key=...
 */
export function extractChannelId(pairUrl: string): string {
  const hash = pairUrl.split('#')[1];
  if (!hash) throw new Error('No fragment in pair URL');

  const params = new URLSearchParams(hash);
  const channelId = params.get('channel_id');
  if (!channelId) throw new Error('No channel_id in pair URL');

  return channelId;
}

/**
 * Find an element by trying multiple CSS selectors with retry.
 *
 * On failure, captures current URL and page title for diagnostics.
 */
export async function findElementBySelectors(
  client: MarionetteClient,
  selectors: readonly string[],
  timeoutMs = TIMEOUTS.ELEMENT_FIND
): Promise<string> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    for (const sel of selectors) {
      try {
        const el = await client.findElement('css selector', sel);
        if (el) return el;
      } catch {
        // try next selector
      }
    }
    await sleep(TIMEOUTS.POLL_INTERVAL);
  }

  const { url, title } = await captureDiagnostics(client);
  throw new Error(
    `Element not found with selectors [${selectors.join(', ')}] after ${timeoutMs}ms. ` +
      `URL: ${url}, title: "${title}"`
  );
}

/**
 * Set input value via script with React-compatible event dispatch.
 *
 * Marionette's sendKeys doesn't always trigger React's synthetic onChange
 * (React uses a native input event setter override). This function uses
 * the React-friendly approach of overriding the native value setter and
 * dispatching an 'input' event with bubbles: true.
 *
 * On failure, captures current URL and page title for diagnostics.
 */
export async function setInputValueByScript(
  client: MarionetteClient,
  selectors: readonly string[],
  value: string,
  timeoutMs = TIMEOUTS.ELEMENT_FIND
): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    for (const sel of selectors) {
      try {
        const result = await client.executeScript(
          `
          const sel = arguments[0];
          const val = arguments[1];
          const el = document.querySelector(sel);
          if (!el) return 'not_found';
          // Use React-compatible value setter
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype, 'value'
          ).set;
          nativeInputValueSetter.call(el, val);
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
          return 'ok';
          `,
          { args: [sel, value] }
        );
        if (result === 'ok') return;
      } catch {
        // try next selector
      }
    }
    await sleep(TIMEOUTS.POLL_INTERVAL);
  }

  const { url, title } = await captureDiagnostics(client);
  throw new Error(
    `Input not found with selectors [${selectors.join(', ')}] after ${timeoutMs}ms. ` +
      `URL: ${url}, title: "${title}"`
  );
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Capture current URL and page title for diagnostic error messages.
 * Returns best-effort values; never throws.
 */
async function captureDiagnostics(
  client: MarionetteClient
): Promise<{ url: string; title: string }> {
  try {
    const url = await client.getUrl();
    const title = await client.getTitle();
    return { url, title };
  } catch {
    return { url: 'unknown', title: 'unknown' };
  }
}
