/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { AuthorizeRequest } from './scenarios';

export type PkceMaterial = {
  state: string;
  code_challenge: string;
  keys_jwk?: string;
};

/**
 * Pure URL construction so it can be unit-tested and previewed live.
 * Empty pass-through params are dropped so a blank login_hint field
 * doesn't send `login_hint=`.
 */
export function buildAuthorizeUrl(
  endpoint: string,
  redirectUri: string,
  req: AuthorizeRequest,
  pkce: PkceMaterial
): string {
  const url = new URL(endpoint);
  const p = url.searchParams;
  p.set('client_id', req.client_id);
  p.set('redirect_uri', redirectUri);
  p.set('response_type', 'code');
  p.set('scope', req.scopes.join(' '));
  p.set('state', pkce.state);
  p.set('code_challenge', pkce.code_challenge);
  p.set('code_challenge_method', 'S256');
  p.set('access_type', 'offline');
  if (pkce.keys_jwk) p.set('keys_jwk', pkce.keys_jwk);
  for (const [k, v] of Object.entries(req.params)) {
    if (v !== '') p.set(k, v);
  }
  // content-server forwards a literal "+" in scope; percent-encode spaces instead
  return url.toString().replace(/\+/g, '%20');
}

export function base64url(bytes: ArrayBuffer | Uint8Array): string {
  const bin = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
