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
import { Browser, expect, Page, TestInfo } from '@playwright/test';
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
 * Poll `client.getUrl()` until it contains any one of the given substrings.
 *
 * Use this where the authority passes through a transient screen: a card it only shows while
 * waiting can be gone before the next poll, so asserting on that one route alone is a race.
 */
export async function waitForUrlContainingAny(
  client: MarionetteClient,
  substrings: string[],
  timeoutMs: number = TIMEOUTS.AUTHORITY_COMPLETE
): Promise<string> {
  let lastUrl = '';
  return pollUntil(
    async () => {
      lastUrl = await client.getUrl();
      return substrings.some((s) => lastUrl.includes(s)) ? lastUrl : undefined;
    },
    timeoutMs,
    () =>
      `URL did not contain any of ${substrings.join(', ')} (last seen: ${lastUrl})`
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
  target: {
    authClient: {
      mfaRequestOtp: (
        sessionToken: string,
        action: string
      ) => Promise<{ status: string }>;
      mfaOtpVerify: (
        sessionToken: string,
        code: string,
        action: string
      ) => Promise<{ accessToken: string }>;
      createTotpTokenWithJwt: (
        jwt: string,
        options: object
      ) => Promise<{ secret: string }>;
      verifyTotpSetupCodeWithJwt: (
        jwt: string,
        code: string,
        options?: object
      ) => Promise<{ success: boolean }>;
      completeTotpSetupWithJwt: (
        jwt: string,
        options?: object
      ) => Promise<{ success: boolean }>;
    };
    emailClient: {
      getVerifyAccountChangeCode: (email: string) => Promise<string>;
    };
  },
  sessionToken: string,
  email: string
): Promise<string> {
  const { authClient, emailClient } = target;
  await authClient.mfaRequestOtp(sessionToken, '2fa');
  const otp = await emailClient.getVerifyAccountChangeCode(email);
  const { accessToken } = await authClient.mfaOtpVerify(sessionToken, otp, '2fa');

  const { secret } = await authClient.createTotpTokenWithJwt(accessToken, {});
  const code = await getTotpCode(secret);
  await authClient.verifyTotpSetupCodeWithJwt(accessToken, code);
  await authClient.completeTotpSetupWithJwt(accessToken);
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
    const config = await new ConfigPage(page, target).getConfig();
    return config?.pairing?.version ?? 1;
  } finally {
    await context.close();
  }
}

/**
 * Pref the supplicant shim records the captured oauth_login payload in, so a
 * later Marionette call can read it back out of chrome.
 */
const CAPTURED_OAUTH_LOGIN_PREF = 'fxa.functional-tests.captured-oauth-login';

/**
 * A Fenix user agent, so a borrowed desktop Firefox reports the mobile client it
 * is standing in for.
 */
const FENIX_USER_AGENT =
  'Mozilla/5.0 (Android 13; Mobile; rv:140.0) Gecko/140.0 Firefox/140.0';

/**
 * Present the supplicant browser as Fenix.
 *
 * A scanned QR carries no query, so the supplicant derives its client id from
 * the User-Agent. Left as desktop it reports the Firefox Desktop id, which the
 * server's `pairing.clients` allowlist excludes, and the authority rejects the
 * request on arrival.
 *
 * Declaring it through the UA rather than a `client_id` query param is
 * deliberate: `onConnect` navigates with a plain `navigate()`, which drops the
 * query, and losing `client_id` mid-flow makes `useClientInfoState` recompute
 * and `useIntegration` rebuild the integration — taking the live channel and the
 * authority's metadata with it. The UA survives the navigation, so the flow
 * behaves like the real mobile supplicant it stands for.
 */
export async function setSupplicantUserAgent(
  client: MarionetteClient,
  userAgent = FENIX_USER_AGENT
): Promise<void> {
  await client.setContext('chrome');
  await client.executeScript(
    `Services.prefs.setStringPref("general.useragent.override", arguments[0]);`,
    { sandbox: 'system', args: [userAgent] }
  );
}

/**
 * Make a desktop Firefox usable as a v2 pairing supplicant.
 *
 * Desktop chrome implements the pairing *authority* only: its `oauth_login`
 * handler reads `uid`/`sessionToken` off the existing account and completes the
 * flow with them, so on an account-less supplicant it throws
 * "null has no properties" and the browser never signs in. Everything else the
 * supplicant needs is real, so replace just that one handler: capture the code
 * and state the authority granted, and let the page finish.
 *
 * Leaves `pair_oauth_start`, the channel, and the authority's
 * `pair_oauth_finish` untouched, so the handshake under test is the real one.
 */
export async function mockSupplicantOAuthLogin(
  client: MarionetteClient
): Promise<void> {
  await client.setContext('chrome');
  await client.executeScript(
    `
    const pref = arguments[0];
    const { FxAccountsWebChannelHelpers } = ChromeUtils.importESModule(
      "resource://gre/modules/FxAccountsWebChannel.sys.mjs"
    );
    Services.prefs.setStringPref(pref, "");
    FxAccountsWebChannelHelpers.prototype.oauthLogin = async function (data) {
      Services.prefs.setStringPref(pref, JSON.stringify(data || {}));
    };
    `,
    { sandbox: 'system', args: [CAPTURED_OAUTH_LOGIN_PREF] }
  );
}

/** What the supplicant's chrome received on `oauth_login`. */
export type CapturedOAuthLogin = {
  code?: string;
  state?: string;
  action?: string;
};

/**
 * Read back what the supplicant's chrome received on `oauth_login`, polling
 * because the page sends it without waiting for a reply.
 */
export async function readCapturedOAuthLogin(
  client: MarionetteClient,
  timeoutMs = 30_000
): Promise<CapturedOAuthLogin | undefined> {
  await client.setContext('chrome');

  const deadline = Date.now() + timeoutMs;
  do {
    // The shim leaves the pref empty until the message arrives. Anything other
    // than a non-empty string means the read itself failed, so keep polling
    // rather than parsing it: `String(null)` would be a truthy "null".
    let raw: unknown;
    try {
      raw = await client.executeScript(
        `return Services.prefs.getStringPref(arguments[0], "");`,
        { sandbox: 'system', args: [CAPTURED_OAUTH_LOGIN_PREF] }
      );
    } catch {
      // Transient Marionette error, e.g. mid-navigation. Poll again.
      raw = undefined;
    }
    if (typeof raw === 'string' && raw) {
      return JSON.parse(raw) as CapturedOAuthLogin;
    }
    await sleep(1_000);
  } while (Date.now() < deadline);
  return undefined;
}

/**
 * Mask the pairing channel key.
 *
 * `channel_key` is the shared secret for the channel: whoever has it plus the
 * channel id can join as a supplicant. CI keeps failure artifacts far longer
 * than the channel lives, so it must not travel into one.
 */
export function redactChannelKey(text: string): string {
  return text.replace(/(channel_key=)[^&\s]+/g, '$1<redacted>');
}

/**
 * Attach the browser's URL and a screenshot of its page body when a test fails.
 */
export async function attachAuthorityDiagnostics(
  client: MarionetteClient,
  testInfo: TestInfo,
  // Names the attachments, so a test driving both halves over Marionette does
  // not have the second browser overwrite the first one's files.
  role: 'authority' | 'supplicant' = 'authority'
): Promise<void> {
  // A skipped test has no failure to explain, and its browsers are still blank.
  if (testInfo.status === 'skipped') {
    return;
  }
  if (testInfo.status === testInfo.expectedStatus) {
    return;
  }

  const save = async (name: string, body: string | Buffer, type: string) => {
    const file = testInfo.outputPath(name);
    writeFileSync(file, body);
    await testInfo.attach(name, { path: file, contentType: type });
  };

  try {
    await client.setContext('content');
    await save(
      `${role}-url.txt`,
      redactChannelKey(await client.getUrl()),
      'text/plain'
    );

    const body = await client.findElement('css selector', 'body');
    const png = Buffer.from(await client.screenshotElement(body), 'base64');
    await save(`${role}-page.png`, png, 'image/png');
  } catch {
    // Diagnostics must never mask the real failure.
  }
}
