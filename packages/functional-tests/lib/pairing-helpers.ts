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

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { expect, Page } from '@playwright/test';
import { MarionetteClient } from './marionette';
import {
  PAIRING_CLIENT_ID,
  PAIRING_REDIRECT_URI,
  PAIRING_SCOPE,
  SELECTORS,
  TIMEOUTS,
} from './pairing-constants';
import { getTotpCode } from './totp';

const DEBUG = !!process.env.PAIRING_DEBUG;
const debug = (msg: string) => DEBUG && console.log(`[PAIRING] ${msg}`);

/**
 * Fetch the content server's fxa-config and check whether React pairing
 * routes are enabled (showReactApp.pairRoutes). When enabled, the Backbone
 * /pair/* routes are deregistered and only React (fxa-settings) serves them.
 */
export async function isPairRoutesReact(
  contentServerUrl: string
): Promise<boolean> {
  try {
    const resp = await fetch(contentServerUrl);
    const html = await resp.text();
    const match = html.match(/name="fxa-config" content="([^"]+)"/);
    if (!match) return false;
    const config = JSON.parse(decodeURIComponent(match[1]));
    return config.showReactApp?.pairRoutes === true;
  } catch {
    return false;
  }
}

const SCREENSHOTS_ENABLED = !!process.env.PAIRING_SCREENSHOTS;
const SCREENSHOTS_DIR = path.resolve(__dirname, '..', 'artifacts', 'pairing-screenshots');

/**
 * Save a screenshot from the Playwright supplicant page.
 */
export async function screenshotSupplicant(
  page: Page,
  variant: string,
  phase: string
): Promise<void> {
  if (!SCREENSHOTS_ENABLED) return;
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  const filename = `${variant}-supplicant-${phase}.png`;
  // eslint-disable-next-line playwright/no-networkidle
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, filename), fullPage: true });
  debug(`Screenshot saved: ${filename}`);
}

/**
 * Save a screenshot from the Marionette authority browser.
 */
export async function screenshotAuthority(
  client: MarionetteClient,
  variant: string,
  phase: string
): Promise<void> {
  if (!SCREENSHOTS_ENABLED) return;
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  const filename = `${variant}-authority-${phase}.png`;
  try {
    await client.setContext('content');
    const base64 = await client.takeScreenshot();
    fs.writeFileSync(path.join(SCREENSHOTS_DIR, filename), Buffer.from(base64, 'base64'));
    debug(`Screenshot saved: ${filename}`);
  } catch {
    debug(`Screenshot failed: ${filename}`);
  }
}

/**
 * Query params appended to content-server URLs to force React rendering
 * when fullProdRollout is false and the generalizedReactApp experiment
 * controls the route.
 */
export const REACT_QUERY_PARAMS =
  'showReactApp=true&forceExperiment=generalizedReactApp&forceExperimentGroup=react';

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
  label: string
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
  throw new Error(`${label} after ${timeoutMs}ms.${suffix}`);
}

/**
 * Poll `client.getUrl()` until the URL contains the given substring.
 */
export async function waitForUrlContaining(
  client: MarionetteClient,
  substring: string,
  timeoutMs: number = TIMEOUTS.AUTHORITY_COMPLETE
): Promise<string> {
  return pollUntil(
    async () => {
      const url = await client.getUrl();
      return url.includes(substring) ? url : undefined;
    },
    timeoutMs,
    `URL did not contain "${substring}"`
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
 * Uses Firefox's internal beginOAuthFlow() to generate PKCE + keys_jwk
 * and register the OAuth flow, then signs in through the content server UI.
 * After sign-in, Firefox processes the fxaccounts:oauth_login WebChannel
 * message and completes the key exchange automatically.
 */
export async function signInAuthorityViaMarionette(
  client: MarionetteClient,
  contentServerUrl: string,
  email: string,
  password: string,
  totpSecret?: string,
  useReact = false
): Promise<void> {
  // Use Firefox's internal beginOAuthFlow() to generate PKCE + keys_jwk
  // and register the OAuth flow so Firefox can complete the key exchange
  // when the content server sends fxaccounts:oauth_login via WebChannel.
  // Requires Playwright's bundled Firefox (125+).
  debug('signInAuthority: starting beginOAuthFlow');
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
  debug(`beginOAuthFlow: success=${oauthData.success}${oauthData.error ? `, error=${oauthData.error}` : ''}`);
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
  const signinUrl = `${contentServerUrl}/?${params}${useReact ? `&${REACT_QUERY_PARAMS}` : ''}`;

  try {
    debug(`Navigating to sign-in URL`);
    await client.setContext('content');
    await client.navigate(signinUrl);

    // Remove webpack-dev-server overlay iframe that can intercept clicks
    await dismissWebpackOverlay(client);

    // Wait for the email input to appear instead of a fixed sleep
    await findElementBySelectors(client, SELECTORS.EMAIL_INPUT);

    // Enter email — use script-based value setting for React compatibility.
    // Marionette's sendKeys doesn't always trigger React's synthetic onChange.
    await setInputValueByScript(client, SELECTORS.EMAIL_INPUT, email);

    // Click submit
    debug('Submitting email');
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
    debug('Submitting password');
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
      debug('On inline_recovery_key_setup, dismissing via "Do it later"');
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
    debug('Waiting for Firefox signed-in state');
    await waitForSignedInState(client);
    debug('Firefox reports signed-in state');
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

  const reactSuffix = useReact ? `&${REACT_QUERY_PARAMS}` : '';
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
  const reactSuffix = useReact ? `&${REACT_QUERY_PARAMS}` : '';
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
          } catch { /* retry */ }
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
              debug(
                `setInputValueByScript: value mismatch for "${sel}" - got "${result.slice(9)}"`
              );
            }
          } catch { /* retry */ }
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
 * Remove the webpack-dev-server error overlay iframe that can intercept
 * Marionette element clicks even when blank.
 * Tries twice with a short gap since the overlay can inject late.
 */
export async function dismissWebpackOverlay(client: MarionetteClient): Promise<void> {
  for (let i = 0; i < 2; i++) {
    try {
      await client.executeScript(`
        var overlay = document.getElementById('webpack-dev-server-client-overlay');
        if (overlay) overlay.remove();
        var iframes = document.querySelectorAll('iframe[id*="webpack-dev-server"]');
        for (var j = 0; j < iframes.length; j++) iframes[j].remove();
      `);
    } catch {
      /* best-effort */
    }
    if (i === 0) await sleep(200);
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
  // Find confirm button: data-testid > ID > role
  const confirmButton = page
    .locator('[data-testid="pair-supp-approve-btn"]')
    .or(page.locator('#supp-approve-btn'))
    .or(page.getByRole('button', { name: /Confirm|Approve/i }));
  await expect(confirmButton.first()).toBeVisible({
    timeout: TIMEOUTS.AUTHORITY_COMPLETE,
  });
  await confirmButton.first().click();

  // Wait for supplicant URL to leave /pair/supp/allow
  await expect(async () => {
    expect(page.url()).not.toContain('pair/supp/allow');
  }).toPass({ timeout: TIMEOUTS.AUTHORITY_COMPLETE });

  const finalSuppUrl = page.url();
  expect(finalSuppUrl).not.toContain('pair/failure');
  expect(finalSuppUrl).toContain('oauth/success');

  // Wait for authority to reach pair/auth/complete
  await client.setContext('content');
  const finalAuthUrl = await waitForUrlContaining(
    client,
    'pair/auth/complete',
    TIMEOUTS.AUTHORITY_COMPLETE
  );
  expect(finalAuthUrl).not.toContain('pair/failure');
}
