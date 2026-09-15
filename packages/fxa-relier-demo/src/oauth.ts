/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  compactDecrypt,
  createRemoteJWKSet,
  decodeJwt,
  decodeProtectedHeader,
  importJWK,
  jwtVerify,
} from 'jose';
import { base64url, buildAuthorizeUrl } from './authorize';
import { Endpoints, FALLBACK_ENDPOINTS, ISSUER, redirectUri } from './config';
import type { AuthorizeRequest } from './scenarios';

const PENDING_KEY = 'relier-demo:pending';

type Pending = {
  request: AuthorizeRequest;
  state: string;
  verifier: string;
  privateJwk?: JsonWebKey;
  startedAt: number;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  refresh_token?: string;
  id_token?: string;
  keys_jwe?: string;
  auth_at?: number;
};

export type FlowResult = {
  request: AuthorizeRequest;
  callback: Record<string, string>;
  error?: string;
  token?: TokenResponse;
  idToken?: {
    header: Record<string, unknown>;
    payload: Record<string, unknown>;
    verified: boolean;
    problem?: string;
  };
  introspection?: Record<string, unknown>;
  userinfo?: Record<string, unknown> | null;
  userinfoStatus?: number;
  scopedKeys?: Record<string, unknown>;
};

let endpointsPromise: Promise<Endpoints> | undefined;

/** True once discovery has failed; the UI uses it to say "is the stack running?" */
export let discoveryFailed = false;

export function endpoints(): Promise<Endpoints> {
  endpointsPromise ??= fetch(`${ISSUER}/.well-known/openid-configuration`)
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((d) => ({ ...FALLBACK_ENDPOINTS, ...d }))
    .catch(() => {
      discoveryFailed = true;
      return FALLBACK_ENDPOINTS;
    });
  return endpointsPromise;
}

function randomString(bytes = 32): string {
  return base64url(crypto.getRandomValues(new Uint8Array(bytes)));
}

export async function previewUrl(req: AuthorizeRequest): Promise<string> {
  const ep = await endpoints();
  return buildAuthorizeUrl(ep.authorization_endpoint, redirectUri(), req, {
    state: '<state>',
    code_challenge: '<code_challenge>',
    keys_jwk: req.keys ? '<keys_jwk>' : undefined,
  });
}

export async function startFlow(req: AuthorizeRequest): Promise<void> {
  const ep = await endpoints();
  const state = randomString(16);
  const verifier = randomString(32);
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(verifier)
  );
  const pending: Pending = {
    request: req,
    state,
    verifier,
    startedAt: Date.now(),
  };

  let keys_jwk: string | undefined;
  if (req.keys) {
    const pair = await crypto.subtle.generateKey(
      { name: 'ECDH', namedCurve: 'P-256' },
      true,
      ['deriveBits']
    );
    const pub = await crypto.subtle.exportKey('jwk', pair.publicKey);
    pending.privateJwk = await crypto.subtle.exportKey('jwk', pair.privateKey);
    keys_jwk = base64url(
      new TextEncoder().encode(
        JSON.stringify({ kty: pub.kty, crv: pub.crv, x: pub.x, y: pub.y })
      )
    );
  }

  sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending));
  location.assign(
    buildAuthorizeUrl(ep.authorization_endpoint, redirectUri(), req, {
      state,
      code_challenge: base64url(digest),
      keys_jwk,
    })
  );
}

export async function completeFlow(
  search: URLSearchParams
): Promise<FlowResult> {
  const callback = Object.fromEntries(search.entries());
  const raw = sessionStorage.getItem(PENDING_KEY);
  if (!raw)
    return {
      request: emptyRequest(),
      callback,
      error: 'No pending flow in this tab. Start again.',
    };
  const pending: Pending = JSON.parse(raw);
  sessionStorage.removeItem(PENDING_KEY);

  const result: FlowResult = { request: pending.request, callback };
  if (callback.error) {
    result.error = `${callback.error}${callback.error_description ? `: ${callback.error_description}` : ''}`;
    return result;
  }
  if (callback.state !== pending.state) {
    result.error =
      'state mismatch: the callback does not belong to the flow this tab started';
    return result;
  }

  const ep = await endpoints();
  const tokenRes = await fetch(ep.token_endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: callback.code,
      client_id: pending.request.client_id,
      code_verifier: pending.verifier,
    }),
  });
  const tokenBody = await tokenRes.json();
  if (!tokenRes.ok) {
    result.error = `token endpoint ${tokenRes.status}: ${tokenBody.message ?? JSON.stringify(tokenBody)}`;
    return result;
  }
  result.token = tokenBody as TokenResponse;

  const [idToken, introspection, userinfo, scopedKeys] = await Promise.all([
    result.token.id_token
      ? verifyIdToken(ep, result.token.id_token, pending.request.client_id)
      : undefined,
    postJson(ep.introspection_endpoint, { token: result.token.access_token }),
    fetch(ep.userinfo_endpoint, {
      headers: { Authorization: `Bearer ${result.token.access_token}` },
    }).then(async (r) => ({
      status: r.status,
      body: r.ok ? await r.json() : null,
    })),
    result.token.keys_jwe && pending.privateJwk
      ? unwrapKeys(result.token.keys_jwe, pending.privateJwk)
      : undefined,
  ]);
  result.idToken = idToken;
  result.introspection = introspection;
  result.userinfo = userinfo.body;
  result.userinfoStatus = userinfo.status;
  result.scopedKeys = scopedKeys;
  return result;
}

export async function signOut(token: TokenResponse): Promise<void> {
  const ep = await endpoints();
  await postJson(ep.revocation_endpoint, {
    token: token.refresh_token ?? token.access_token,
  });
}

async function verifyIdToken(
  ep: Endpoints,
  jwt: string,
  clientId: string
): Promise<FlowResult['idToken']> {
  const header = decodeProtectedHeader(jwt) as Record<string, unknown>;
  try {
    const { payload } = await jwtVerify(
      jwt,
      createRemoteJWKSet(new URL(ep.jwks_uri)),
      {
        issuer: ep.issuer,
        audience: clientId,
      }
    );
    return {
      header,
      payload: payload as Record<string, unknown>,
      verified: true,
    };
  } catch (e) {
    return {
      header,
      payload: decodeJwt(jwt) as Record<string, unknown>,
      verified: false,
      problem: String(e),
    };
  }
}

async function unwrapKeys(
  jwe: string,
  privateJwk: JsonWebKey
): Promise<Record<string, unknown>> {
  const key = await importJWK(privateJwk as never, 'ECDH-ES');
  const { plaintext } = await compactDecrypt(jwe, key);
  return JSON.parse(new TextDecoder().decode(plaintext));
}

async function postJson(
  url: string,
  body: unknown
): Promise<Record<string, unknown>> {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return r.json().catch(() => ({ status: r.status }));
}

function emptyRequest(): AuthorizeRequest {
  return { client_id: '', scopes: [], keys: false, params: {} };
}
