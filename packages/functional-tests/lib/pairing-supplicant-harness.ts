/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Supplicant harness for the v2 pairing E2E (FXA-13870).
 *
 * In production the supplicant is Firefox mobile: its chrome runs
 * `pair_oauth_start` (real PKCE + ephemeral ECDH) and later decrypts the
 * `keys_jwe`. The test supplicant is a Playwright page with no chrome, so this
 * harness plays that chrome role with REAL crypto:
 *   - generates the PKCE pair and an ECDH P-256 keypair,
 *   - stubs the page's `pair_oauth_start` / `fxa_status` web-channel responses
 *     with those values and captures the `oauth_login` the container emits,
 *   - redeems the resulting code at the auth server and decrypts the returned
 *     `keys_jwe` with the private key, proving real Sync scoped keys arrived.
 *
 * The authority side stays a real custom Firefox running the real
 * `pair_oauth_finish`, so the crypto is genuinely exercised end to end.
 */

import crypto from 'crypto';
import { compactDecrypt, importJWK } from 'jose';
import type { Page } from '@playwright/test';
import { PAIRING_CLIENT_ID, PAIRING_SCOPE } from './pairing-constants';

export type SupplicantCrypto = {
  state: string;
  scope: string;
  clientId: string;
  codeVerifier: string;
  codeChallenge: string;
  keysJwk: string; // base64url(JSON(public JWK)), as chrome expects
  privateJwk: crypto.JsonWebKey;
};

/** Generate the real PKCE + ECDH material a supplicant's chrome would mint. */
export function generateSupplicantCrypto(): SupplicantCrypto {
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');

  const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
    namedCurve: 'P-256',
  });
  const publicJwk = publicKey.export({ format: 'jwk' });
  const privateJwk = privateKey.export({ format: 'jwk' });
  const keysJwk = Buffer.from(JSON.stringify(publicJwk)).toString('base64url');

  return {
    state: crypto.randomUUID().replace(/-/g, ''),
    scope: PAIRING_SCOPE,
    clientId: PAIRING_CLIENT_ID,
    codeVerifier,
    codeChallenge,
    keysJwk,
    privateJwk,
  };
}

/**
 * Install a page init script that answers the supplicant container's web-channel
 * commands and records the final `oauth_login`. Must run before navigation.
 */
export async function installSupplicantWebChannelStub(
  page: Page,
  c: SupplicantCrypto
): Promise<void> {
  await page.addInitScript(
    ({ state, scope, codeChallenge, keysJwk, clientId }) => {
      const CHANNEL_ID = 'account_updates';
      window.addEventListener('WebChannelMessageToChrome', (event: any) => {
        const detail =
          typeof event.detail === 'string'
            ? JSON.parse(event.detail)
            : event.detail;
        const message = detail?.message;
        if (!message) return;
        const { command, messageId } = message;

        const reply = (data: unknown) =>
          window.dispatchEvent(
            new CustomEvent('WebChannelMessageToContent', {
              detail: { id: CHANNEL_ID, message: { command, messageId, data } },
            })
          );

        if (command === 'fxaccounts:fxa_status') {
          reply({
            capabilities: { engines: [], pairing: true, pairingVersion: 2 },
            clientId,
            signedInUser: null,
          });
        } else if (command === 'fxaccounts:pair_oauth_start') {
          reply({
            state,
            scope,
            code_challenge: codeChallenge,
            keys_jwk: keysJwk,
          });
        } else if (command === 'fxaccounts:oauth_login') {
          // Capture for the token exchange; nothing to reply.
          (window as any).__pairingOAuthLogin = message.data;
        }
      });
    },
    {
      state: c.state,
      scope: c.scope,
      codeChallenge: c.codeChallenge,
      keysJwk: c.keysJwk,
      clientId: c.clientId,
    }
  );
}

/** Read the `{code,state,...}` the supplicant container passed to oauth_login. */
export async function readCapturedOAuthLogin(
  page: Page
): Promise<{ code: string; state: string } | null> {
  return page.evaluate(() => (window as any).__pairingOAuthLogin ?? null);
}

/**
 * Redeem the authorization code at the auth server and decrypt the returned
 * keys_jwe, returning the scoped keys the supplicant would receive.
 */
export async function redeemAndDecrypt(
  authServerUrl: string,
  c: SupplicantCrypto,
  code: string,
  wafToken?: string
): Promise<Record<string, { kid: string; k: string; kty: string }>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (wafToken) headers['fxa-ci'] = wafToken;

  // authServerUrl is the origin (e.g. http://localhost:9000); the API is under /v1.
  const resp = await fetch(`${authServerUrl}/v1/oauth/token`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      code_verifier: c.codeVerifier,
      client_id: c.clientId,
    }),
  });
  if (!resp.ok) {
    throw new Error(
      `token exchange failed: ${resp.status} ${await resp.text().catch(() => '')}`
    );
  }
  const body = (await resp.json()) as { keys_jwe?: string };
  if (!body.keys_jwe) {
    throw new Error('token response had no keys_jwe');
  }

  const key = await importJWK(c.privateJwk as any, 'ECDH-ES');
  const { plaintext } = await compactDecrypt(body.keys_jwe, key);
  return JSON.parse(new TextDecoder().decode(plaintext));
}
