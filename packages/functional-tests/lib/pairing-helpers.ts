/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Helper functions for pairing E2E tests.
 *
 * Extracted from pairingFlow.spec.ts for reuse and maintainability.
 *
 * WARNING: All inline JavaScript strings passed to executeScript /
 * executeAsyncScript MUST use ASCII-only characters. Marionette's
 * length-prefixed JSON protocol can miscount bytes for multi-byte
 * characters (e.g. em dashes), causing parse failures.
 */

import { writeFileSync } from 'fs';
import crypto from 'crypto';
import jsQR from 'jsqr';
import UPNG from 'upng-js';
import { Browser, expect, Page } from '@playwright/test';
import { ConfigPage } from '../pages/config';
import { BaseTarget } from './targets/base';
import { MarionetteClient } from './marionette';
import {
  PAIRING_CLIENT_ID,
  PAIRING_REDIRECT_URI,
  PAIRING_SCOPE,
  PAIRING_VERSION_PREF,
  SELECTORS,
  TIMEOUTS,
} from './pairing-constants';
import { getTotpCode } from './totp';

/**
 * Check whether React pairing routes are enabled (showReactApp.pairRoutes).
 * When enabled, the Backbone /pair/* routes are deregistered and only React
 * (fxa-settings) serves them.
 *
 * Reuses the shared ConfigPage helper, which opens a real Playwright page and
 * reads the fxa-config meta tag. This matters for stage and production,
 * which are behind Fastly's Next-Gen WAF: a plain fetch() receives the
 * JavaScript "Client Challenge" interstitial instead of the real HTML. A
 * browser page executes the challenge and then renders the real page with
 * the meta tag.
 *
 * Callers should invoke this from `test.beforeAll` so it runs once per
 * worker; pair-route rollout is stable for the lifetime of a test run.
 */
export async function isPairRoutesReact(
  browser: Browser,
  target: BaseTarget
): Promise<boolean> {
  // Mirror playwright.config.ts's `use.extraHTTPHeaders` so requests made from
  // this helper also carry the WAF bypass token in CI. Without this, the WAF
  // serves its JS interstitial and the fxa-config meta tag never renders.
  const extraHTTPHeaders: Record<string, string> = {};
  target.ciHeader?.forEach((value, key) => {
    extraHTTPHeaders[key] = value;
  });
  const context = await browser.newContext({ extraHTTPHeaders });
  const page = await context.newPage();
  try {
    const configPage = new ConfigPage(page, target);
    const config = await configPage.getConfig();
    return config?.showReactApp?.pairRoutes === true;
  } finally {
    await context.close();
  }
}

/**
 * Generic polling helper with exponential backoff.
 *
 * Starts at POLL_INTERVAL (500ms), grows by 1.5x each iteration,
 * caps at POLL_INTERVAL_MAX (2s). Includes the last error in the
 * timeout message for easier debugging.
 */
async function pollUntil<T>(
  check: () => Promise<T | undefined>,
  timeoutMs: number,
  // A thunk lets the caller include state it only knows after the last poll.
  label: string | (() => string)
): Promise<T> {
  const start = Date.now();
  let interval: number = TIMEOUTS.POLL_INTERVAL;
  let lastError: Error | undefined;

  while (Date.now() - start < timeoutMs) {
    try {
      const result = await check();
      if (result !== undefined) return result;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
    await sleep(interval);
    interval = Math.min(interval * 1.5, TIMEOUTS.POLL_INTERVAL_MAX);
  }

  const suffix = lastError ? ` Last error: ${lastError.message}` : '';
  const text = typeof label === 'function' ? label() : label;
  throw new Error(`${text} after ${timeoutMs}ms.${suffix}`);
}

/**
 * Poll `client.getUrl()` until the URL contains the given substring.
 */
export async function waitForUrlContaining(
  client: MarionetteClient,
  substring: string,
  timeoutMs: number = TIMEOUTS.AUTHORITY_COMPLETE
): Promise<string> {
  let lastUrl = '';
  return pollUntil(
    async () => {
      lastUrl = await client.getUrl();
      return lastUrl.includes(substring) ? lastUrl : undefined;
    },
    timeoutMs,
    // The URL it stalled on is the first thing you need when this fails.
    () => `URL did not contain "${substring}" (last seen: ${lastUrl})`
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
  return pollUntil(
    async () => {
      const url = await client.getUrl();
      return url !== previousUrl ? url : undefined;
    },
    timeoutMs,
    `URL did not change from "${previousUrl}"`
  );
}

/**
 * Poll `getSignedInUser()` until Firefox reports `signedIn: true`.
 */
export async function waitForSignedInState(
  client: MarionetteClient,
  timeoutMs = TIMEOUTS.SIGNED_IN_CHECK
): Promise<{ signedIn: boolean; email?: string; uid?: string }> {
  return pollUntil(
    async () => {
      const user = await getSignedInUser(client);
      return user.signedIn ? user : undefined;
    },
    timeoutMs,
    'Firefox did not reach signed-in state'
  );
}

/**
 * Sign in to FxA Sync via the content server web UI using Marionette.
 *
 * Drives /pair, which asks Firefox for the OAuth params over the web channel
 * and redirects to the sign-in form carrying them, then fills that form. After
 * sign-in, Firefox processes the fxaccounts:oauth_login WebChannel message and
 * completes the key exchange automatically.
 *
 * Every step runs in content, so Marionette is only the remoting protocol here.
 * Playwright cannot replace it while the authority must be a custom Firefox
 * build: Playwright drives its own Juggler-patched builds only.
 */
export async function signInAuthorityViaMarionette(
  client: MarionetteClient,
  contentServerUrl: string,
  email: string,
  password: string,
  totpSecret?: string,
  useReact = false
): Promise<void> {
  // Navigating to /pair is enough to start a Sync sign-in: the page sends
  // fxaccounts:oauth_flow_begin over the web channel, Firefox answers with the
  // OAuth params, and the page redirects to the sign-in form already carrying
  // them. Building that URL here from a chrome-context beginOAuthFlow() call
  // duplicated what the page does, and was the only part of this flow that
  // needed chrome privileges.
  const signinUrl = `${contentServerUrl}/pair${useReact ? '?showReactApp=true' : ''}`;

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
    await setInputValueByScript(client, SELECTORS.PASSWORD_INPUT, password);

    // Click sign-in submit
    const signInBtn = await findElementBySelectors(
      client,
      SELECTORS.SUBMIT_BUTTON
    );
    // Capture the current URL (password page) so we wait for THIS to change,
    // not the original signinUrl which already changed after email submit.
    const passwordPageUrl = await client.getUrl();
    await client.clickElement(signInBtn);

    // After password submit, the URL goes through intermediate states:
    //   /?context=... → /signin?context=... → /signin_totp_code?context=...
    // When TOTP is enabled, wait specifically for the TOTP page.
    if (totpSecret) {
      await waitForUrlContaining(client, 'signin_totp_code');
      const totpInput = await findElementBySelectors(
        client,
        SELECTORS.TOTP_INPUT
      );
      const code = await getTotpCode(totpSecret);
      await client.sendKeys(totpInput, code);
      const totpSubmitBtn = await findElementBySelectors(
        client,
        SELECTORS.SUBMIT_BUTTON
      );
      await client.clickElement(totpSubmitBtn);
      const totpUrl = await client.getUrl();
      await waitForUrlChange(client, totpUrl);
    } else {
      await waitForUrlChange(client, passwordPageUrl);
    }

    // Dismiss any unexpected dialogs (e.g. "save password?")
    try {
      await client.dismissAlert();
    } catch {
      /* no alert */
    }

    // Handle intermediary pages (e.g. inline_recovery_key_setup).
    // The "Do it later" button calls hardNavigate('/pair', {}, true) which
    // navigates after a 200ms setTimeout. Use the data-glean-id selector
    // for reliability, then fall back to direct navigation if the click
    // doesn't trigger the React handler.
    const postTotpUrl = await client.getUrl();
    if (postTotpUrl.includes('inline_recovery_key_setup')) {
      await client.executeScript(`
        var btn = document.querySelector('[data-glean-id="inline_recovery_key_setup_create_do_it_later"]');
        if (btn) {
          btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        } else {
          window.location.href = '/pair' + window.location.search;
        }
      `);
      await waitForUrlChange(client, postTotpUrl);
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
  pairUrl: string,
  useReact = false
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

  const reactSuffix = useReact ? '&showReactApp=true' : '';
  return `${contentServerUrl}/pair/supp?${queryParams}${reactSuffix}#${hashParams}`;
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
 * Build the supplicant navigation URL for the v2 pairing flow.
 *
 * v2 differs from v1: the supplicant's OAuth params (state, scope,
 * code_challenge, keys_jwk) are NOT carried in the URL. They are produced by the
 * `fxaccounts:pair_oauth_start` web-channel command and sent to the authority
 * over the pairing channel as `pair:supp:request`. So the only thing the URL
 * carries is the channel fragment, exactly what a native camera scan of the v2
 * QR opens: `/pair#channel_id=<id>&channel_key=<key>&v=2`. FxA forwards a v=2
 * URL to `/pair/supplicant/approve_signin` (see FXA-13865).
 *
 * This validates the fragment and rebases it on the test's content server, so a
 * QR minted against one origin can be opened against localhost.
 */
export function buildSupplicantUrlV2(
  contentServerUrl: string,
  pairUrl: string
): string {
  const fragment = pairUrl.split('#')[1];
  if (!fragment) {
    throw new Error(`v2 pair URL has no fragment: ${pairUrl}`);
  }
  const params = new URLSearchParams(fragment);
  const channelId = params.get('channel_id');
  const channelKey = params.get('channel_key');
  if (!channelId || !channelKey) {
    throw new Error(
      `v2 pair URL fragment missing channel_id or channel_key: ${fragment}`
    );
  }
  if (params.get('v') !== '2') {
    throw new Error(`v2 pair URL fragment missing v=2 marker: ${fragment}`);
  }

  const hashParams = new URLSearchParams({
    channel_id: channelId,
    channel_key: channelKey,
    v: '2',
  });
  return `${contentServerUrl}/pair#${hashParams}`;
}

/**
 * Drive a signed-in Marionette authority through the v2 entrypoint to the
 * scan_qr page and return the encoded pairing URL from the rendered QR.
 *
 * v2 has no chrome-side pairing flow (contrast v1 `startPairingFlow`, which calls
 * `FxAccountsPairingFlow.start()`). The authority mints the channel in web
 * content on `/pair/authority/scan_qr` (FXA-13868) and encodes it into the QR.
 * The test screenshots that QR and decodes it, so it reads the same value a
 * user's phone would, not one the page reports about itself.
 *
 * CONTRACT: scan_qr must render the code inside `data-testid="pairing-qr"`, and
 * that element must include the quiet zone around the code. Decoding fails
 * without the quiet zone.
 *
 * Requires an eligible entrypoint (Sync context + a pairing entrypoint), so the
 * caller passes the same query string the real Firefox menu entrypoint sends.
 */
export async function startPairingFlowV2(
  client: MarionetteClient,
  contentServerUrl: string,
  eligibleEntrypointQs: string
): Promise<string> {
  await client.setContext('content');
  await client.navigate(
    `${contentServerUrl}/connect_another_device?${eligibleEntrypointQs}&v=2`
  );
  await waitForUrlContaining(client, '/pair/authority/scan_qr');

  // Decode the QR the page actually renders, rather than reading the value
  // out of a test-only attribute. A side channel would still agree with the
  // page when the rendered code encodes something else, which is the one
  // thing this card can get wrong.
  //
  // Shoot the wrapper, not the svg inside it: the wrapper carries the quiet
  // zone the QR spec requires, and jsQR cannot find the finder patterns
  // without it.
  return pollUntil(
    async () => {
      const el = await client
        .findElement('css selector', '[data-testid="pairing-qr"]')
        .catch(() => undefined);
      if (!el) return undefined;
      const png = Buffer.from(await client.screenshotElement(el), 'base64');
      const img = UPNG.decode(png);
      const decoded = jsQR(
        new Uint8ClampedArray(UPNG.toRGBA8(img)[0]),
        img.width,
        img.height
      );
      return decoded?.data.includes('channel_id=') ? decoded.data : undefined;
    },
    TIMEOUTS.ASYNC_SCRIPT,
    'scan_qr did not render a decodable v2 pairing QR'
  );
}

/**
 * Extract channel_id from a v2 pairing QR URL, asserting the v=2 marker is
 * present. Use this over {@link extractChannelId} when the test must prove the
 * QR is a v2 QR and not a v1 one.
 */
export function extractChannelIdV2(pairUrl: string): string {
  const hash = pairUrl.split('#')[1];
  if (!hash) throw new Error('No fragment in v2 pair URL');

  const params = new URLSearchParams(hash);
  if (params.get('v') !== '2') {
    throw new Error(`v2 pair URL missing v=2 marker: ${hash}`);
  }
  const channelId = params.get('channel_id');
  if (!channelId) throw new Error('No channel_id in v2 pair URL');

  return channelId;
}

/**
 * Build the authority OAuth URL that navigates the authority to the
 * pairing approval page.
 *
 * Centralises construction that was previously duplicated in both test
 * cases and adds optional React query params.
 */
export function buildAuthorityOAuthUrl(
  contentServerUrl: string,
  params: {
    email: string;
    uid: string;
    channelId: string;
  },
  useReact = false
): string {
  const oauthParams = new URLSearchParams({
    client_id: PAIRING_CLIENT_ID,
    scope: PAIRING_SCOPE,
    email: params.email,
    uid: params.uid,
    channel_id: params.channelId,
    redirect_uri: PAIRING_REDIRECT_URI,
  });
  const reactSuffix = useReact ? '&showReactApp=true' : '';
  return `${contentServerUrl}/oauth?${oauthParams}${reactSuffix}`;
}

/**
 * Find an element by trying multiple CSS selectors with retry.
 *
 * On failure, captures current URL and page title for diagnostics.
 */
export async function findElementBySelectors(
  client: MarionetteClient,
  selectors: readonly string[],
  timeoutMs: number = TIMEOUTS.ELEMENT_FIND
): Promise<string> {
  try {
    return await pollUntil(
      async () => {
        for (const sel of selectors) {
          try {
            const el = await client.findElement('css selector', sel);
            if (el) return el;
          } catch {
            /* retry */
          }
        }
        return undefined;
      },
      timeoutMs,
      `Element not found with selectors [${selectors.join(', ')}]`
    );
  } catch (err) {
    return await rethrowWithDiagnostics(client, err);
  }
}

/**
 * Set an input field's value via injected script, with polling and retry.
 *
 * Why not just `sendKeys`?  Marionette's sendKeys doesn't reliably trigger
 * React's synthetic onChange.  React overrides the native `value` property
 * setter on HTMLInputElement, so a plain `el.value = x` assignment doesn't
 * notify React that the value changed.
 *
 * How it works:
 *  1. Polls with `pollUntil` because the input may not exist yet (page loading).
 *  2. Tries each CSS selector in turn (Backbone and React pages use different IDs).
 *  3. Injects JS into the browser via `executeScript` that:
 *     - Strategy 1 (React): calls the native HTMLInputElement.prototype.value
 *       setter via `.call(el, val)`, then dispatches `input` + `change` events.
 *     - Strategy 2 (fallback): direct `el.value` assignment + blur event.
 *     - Verifies the value stuck; returns 'mismatch' if not.
 *  4. Retries on mismatch or exception until timeout.
 *
 * On failure, captures current URL and page title for diagnostics.
 */
export async function setInputValueByScript(
  client: MarionetteClient,
  selectors: readonly string[],
  value: string,
  timeoutMs = TIMEOUTS.ELEMENT_FIND
): Promise<void> {
  try {
    await pollUntil(
      async () => {
        for (const sel of selectors) {
          try {
            const result = await client.executeScript(
              `
              var sel = arguments[0];
              var val = arguments[1];
              var el = document.querySelector(sel);
              if (!el) return 'not_found';
              // Strategy 1: React-compatible prototype setter
              var desc = Object.getOwnPropertyDescriptor(
                window.HTMLInputElement.prototype, 'value'
              );
              if (desc && desc.set) {
                desc.set.call(el, val);
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
              } else {
                // Strategy 2: direct assignment + blur fallback
                el.value = val;
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
                el.dispatchEvent(new Event('blur', { bubbles: true }));
              }
              // Verify the value was set
              if (el.value !== val) return 'mismatch:' + el.value;
              return 'ok';
              `,
              { args: [sel, value] }
            );
            if (result === 'ok') return 'ok';
            if (typeof result === 'string' && result.startsWith('mismatch:')) {
              // value mismatch -- retry
            }
          } catch {
            /* retry */
          }
        }
        return undefined;
      },
      timeoutMs,
      `Input not found with selectors [${selectors.join(', ')}]`
    );
  } catch (err) {
    await rethrowWithDiagnostics(client, err);
  }
}

/**
 * Programmatically enable TOTP on an account using the auth client API.
 * Returns the hex-encoded secret for later code generation.
 */
export async function enableTotpOnAccount(
  authClient: {
    createTotpToken: (
      sessionToken: string,
      options: object
    ) => Promise<{ secret: string }>;
    verifyTotpSetupCode: (
      sessionToken: string,
      code: string
    ) => Promise<{ success: boolean }>;
    completeTotpSetup: (
      sessionToken: string,
      options?: object
    ) => Promise<{ success: boolean }>;
  },
  sessionToken: string
): Promise<string> {
  const { secret } = await authClient.createTotpToken(sessionToken, {});
  const code = await getTotpCode(secret);
  await authClient.verifyTotpSetupCode(sessionToken, code);
  await authClient.completeTotpSetup(sessionToken);
  return secret;
}

/**
 * Enter a TOTP code on the /pair/auth/totp page via Marionette.
 * Waits for the page to navigate away from the TOTP page after submission.
 */
export async function enterTotpCodeViaMarionette(
  client: MarionetteClient,
  secret: string
): Promise<void> {
  const totpInput = await findElementBySelectors(client, SELECTORS.TOTP_INPUT);
  const code = await getTotpCode(secret);
  await client.sendKeys(totpInput, code);
  const preSubmitUrl = await client.getUrl();
  const submitBtn = await findElementBySelectors(
    client,
    SELECTORS.SUBMIT_BUTTON
  );
  await client.clickElement(submitBtn);
  await waitForUrlChange(client, preSubmitUrl);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Verify the /pair index choice screen renders correctly after sign-in.
 *
 * The authority should already be on /pair after signInAuthorityViaMarionette.
 * This step validates the choice screen UI: header, radio buttons, and that
 * the Continue button enables after selecting a radio option.
 *
 * Does NOT click Continue -- the actual pairing channel is created via
 * startPairingFlow() which calls FxAccountsPairingFlow.start() directly.
 */
export async function verifyPairChoiceScreen(
  client: MarionetteClient,
  contentServerUrl: string,
  useReact = false
): Promise<void> {
  await client.setContext('content');

  // Ensure we are on /pair
  const url = await client.getUrl();
  if (!url.includes('/pair')) {
    const reactSuffix = useReact ? '?showReactApp=true' : '';
    await client.navigate(`${contentServerUrl}/pair${reactSuffix}`);
  }

  // Verify the choice screen header
  await findElementBySelectors(client, SELECTORS.PAIR_CHOICE_HEADER);

  // Verify both radio buttons are present
  await findElementBySelectors(client, SELECTORS.PAIR_RADIO_HAS_MOBILE);
  await findElementBySelectors(client, SELECTORS.PAIR_RADIO_NEEDS_MOBILE);

  // Verify Continue button exists and is disabled
  await findElementBySelectors(client, SELECTORS.PAIR_CONTINUE_BUTTON);
  await client.executeScript(`
    var btn = document.querySelector('#set-needs-mobile');
    return btn ? btn.disabled : null;
  `);

  // Click "I already have Firefox for mobile" via its label.
  // The radio input is visually hidden with CSS; clicking it directly
  // fails because the label element obscures it.
  const hasMobileLabel = await findElementBySelectors(client, [
    'label[for="has-mobile"]',
  ]);
  await client.clickElement(hasMobileLabel);

  // Verify Continue button is now enabled
  const isEnabledAfter = await client.executeScript(`
    var btn = document.querySelector('#set-needs-mobile');
    return btn ? !btn.disabled : null;
  `);
  if (isEnabledAfter !== true) {
    throw new Error(
      'Continue button did not enable after selecting "has mobile" radio'
    );
  }
}

/**
 * Capture current URL and page title for diagnostic error messages.
 * Returns best-effort values; never throws.
 */
export async function captureDiagnostics(
  client: MarionetteClient
): Promise<{ url: string; title: string }> {
  let url = 'unknown';
  let title = 'unknown';
  try {
    url = await client.getUrl();
  } catch {
    /* best-effort */
  }
  try {
    title = await client.getTitle();
  } catch {
    /* best-effort */
  }
  return { url, title };
}

/**
 * Re-throw an error with URL and page title diagnostics appended.
 * Used in catch blocks where Marionette element lookups fail.
 */
async function rethrowWithDiagnostics(
  client: MarionetteClient,
  err: unknown
): Promise<never> {
  const { url, title } = await captureDiagnostics(client);
  const message = err instanceof Error ? err.message : String(err);
  throw new Error(`${message} URL: ${url}, title: "${title}"`);
}

/**
 * Complete the supplicant approval flow (shared between both pairing tests).
 *
 * Finds the confirm button, clicks it, waits for the supplicant to navigate
 * away from /pair/supp/allow to /oauth/success, then waits for the authority
 * to reach /pair/auth/complete.
 */
export async function completeSupplicantApproval(
  page: Page,
  client: MarionetteClient
): Promise<void> {
  // Find confirm button: id (both stacks) > data-testid (React) > role.
  const confirmButton = page
    .locator('#supp-approve-btn')
    .or(page.locator('[data-testid="pair-supp-approve-btn"]'))
    .or(page.getByRole('button', { name: /Confirm|Approve/i }));
  await expect(confirmButton.first()).toBeVisible({
    timeout: TIMEOUTS.AUTHORITY_COMPLETE,
  });
  await confirmButton.first().click();

  // Wait for the supplicant to land on /oauth/success directly. After Confirm
  // the supplicant goes through /pair/supp/wait_for_auth → /oauth/success, so
  // polling for "not /pair/supp/allow" can catch the intermediate state and
  // fail the success assertion. `waitForURL` on the final target avoids that
  // race and also proves the flow did not divert to /pair/failure.
  await page.waitForURL(/oauth\/success/, {
    timeout: TIMEOUTS.AUTHORITY_COMPLETE,
  });
  expect(page.url()).not.toContain('pair/failure');

  // Wait for authority to reach pair/auth/complete
  await client.setContext('content');
  const finalAuthUrl = await waitForUrlContaining(
    client,
    'pair/auth/complete',
    TIMEOUTS.AUTHORITY_COMPLETE
  );
  expect(finalAuthUrl).not.toContain('pair/failure');
}

/**
 * Set the pairing version pref in the running browser.
 *
 * `FxAccountsWebChannel` reads this through `defineLazyPreferenceGetter`, which
 * observes changes, so flipping it at runtime takes effect on the next command
 * and there is no need for a second browser with different prefs.
 */
export async function setPairingVersion(
  client: MarionetteClient,
  version: number
): Promise<void> {
  await client.setContext('chrome');
  await client.executeScript(
    `Services.prefs.setIntPref(arguments[0], arguments[1]);`,
    { sandbox: 'system', args: [PAIRING_VERSION_PREF, version] }
  );
}

/**
 * Read `config.pairing.version` as the content server serves it.
 *
 * The value comes from convict (`PAIRING_VERSION`) and is baked into the page
 * at server boot, so a test cannot change it. Tests that need version 2 read
 * it to decide whether to run. Uses a real page for the same WAF reason as
 * `isPairRoutesReact`; defaults to 1 when the config omits the value.
 */
export async function getServedPairingVersion(
  browser: Browser,
  target: BaseTarget
): Promise<number> {
  const extraHTTPHeaders: Record<string, string> = {};
  target.ciHeader?.forEach((value, key) => {
    extraHTTPHeaders[key] = value;
  });
  const context = await browser.newContext({ extraHTTPHeaders });
  const page = await context.newPage();
  try {
    const configPage = new ConfigPage(page, target);
    const config = await configPage.getConfig();
    return config?.pairing?.version ?? 1;
  } finally {
    await context.close();
  }
}

/**
 * Attach the authority's URL, a full-page screenshot and the page's own
 * `[pair2]` console trace when a test fails.
 *
 * The authority runs in a Marionette-driven Firefox, so Playwright's own
 * failure artifacts capture nothing from it — without this a failure only says
 * which URL it did not reach, not what the page was doing.
 */
export async function attachAuthorityDiagnostics(
  client: MarionetteClient,
  testInfo: {
    status?: string;
    expectedStatus?: string;
    attach: Function;
    outputPath: (name: string) => string;
  }
): Promise<void> {
  if (testInfo.status === testInfo.expectedStatus) {
    return;
  }
  try {
    await client.setContext('content');
    const url = await client.getUrl();
    const urlPath = testInfo.outputPath('authority-url.txt');
    writeFileSync(urlPath, url);
    await testInfo.attach('authority-url.txt', {
      path: urlPath,
      contentType: 'text/plain',
    });

    // The containers log their channel traffic with a `[pair2]` prefix; that
    // trace is what says whether pair:supp:request ever arrived.
    const logs = await client
      // `wrappedJSObject`: Marionette's sandbox gets Xray vision into the page,
      // which hides properties the page's own JS defined.
      .executeScript(
        'return ((window.wrappedJSObject && window.wrappedJSObject.__pair2Log) || []).join("\\n");'
      )
      .then((r) => (r ? String(r) : '(buffer empty)'))
      .catch((err) => `(could not read buffer: ${err?.message ?? err})`);
    if (logs) {
      const logPath = testInfo.outputPath('authority-pair2-log.txt');
      writeFileSync(logPath, String(logs));
      await testInfo.attach('authority-pair2-log.txt', {
        path: logPath,
        contentType: 'text/plain',
      });
    }

    const body = await client.findElement('css selector', 'body');
    const shotPath = testInfo.outputPath('authority-page.png');
    writeFileSync(
      shotPath,
      Buffer.from(await client.screenshotElement(body), 'base64')
    );
    await testInfo.attach('authority-page.png', {
      path: shotPath,
      contentType: 'image/png',
    });
  } catch {
    // Diagnostics must never mask the real failure.
  }
}
