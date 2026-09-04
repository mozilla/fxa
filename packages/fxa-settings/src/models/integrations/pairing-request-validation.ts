/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { OAUTH_NATIVE_CLIENT_IDS } from '@fxa/accounts/oauth';
import config from '../../lib/config';
import { scopeStrToArray } from './oauth-web-integration';

/**
 * A PKCE S256 challenge is a base64url SHA-256 digest, so 43 characters. The
 * upper bound matches what v1 accepted (Vat.codeChallenge, min 43 max 128) and
 * `OAuthIntegrationData.codeChallenge`, so a v1 supplicant pairing with a v2
 * authority is not tightened here. auth-server pins the exact length on the
 * /authorization call the browser makes, which is the real gate.
 */
const CODE_CHALLENGE_MIN_LENGTH = 43;
const CODE_CHALLENGE_MAX_LENGTH = 128;

/** auth-server caps `state` at 512 characters. */
const STATE_MAX_LENGTH = 512;

/** Unpadded base64url — same rule as `@Matches` on `OAuthIntegrationData.keysJwk`. */
const BASE64URL = /^[A-Za-z0-9-_]+$/;

/** Client ids are canonically 16 lowercase hex characters. */
const CLIENT_ID = /^[0-9a-f]{16}$/;

const ACCESS_TYPES = ['offline', 'online'];

/** OAuth params the authority is willing to hand to `firefox.pairOauthFinish`. */
export type ValidatedSupplicantRequest = {
  client_id: string;
  code_challenge: string;
  code_challenge_method: string;
  keys_jwk: string;
  /** Normalized: '+' separators and duplicates collapsed to single spaces. */
  scope: string;
  state: string;
  /** Validated, but not currently forwarded to `pairOauthFinish`. */
  access_type?: string;
};

export type SupplicantRequestFailure = { field: string; reason: string };

export type SupplicantRequestValidation =
  | { ok: true; request: ValidatedSupplicantRequest }
  | { ok: false; failures: SupplicantRequestFailure[] };

const asString = (value: unknown): string | undefined =>
  typeof value === 'string' ? value : undefined;

/**
 * Vets a `pair:supp:request` payload before the authority will mint an OAuth
 * code for it.
 *
 * v1 had no equivalent on the authority: `fxaccounts:pair_authorize` was a bare
 * `{channel_id}` and Firefox's own pairing flow owned both the channel socket
 * and the code minting. v1's rules for these fields lived on the *supplicant*,
 * over its own URL (content-server `reliers/pairing/supplicant.js`). In v2 FxA
 * brokers the channel and forwards the remote peer's params to the authority's
 * Firefox, which mints a real code and wraps the account's Sync keys against the
 * supplied `keys_jwk` — so the authority is a trust boundary that did not exist
 * before, and this is the only place it can refuse.
 *
 * Takes `unknown` and never throws: the payload is remote-controlled, so a
 * non-string field is an expected input rather than a programming error. Failure
 * reasons never echo a submitted value, since `keys_jwk` and `code_challenge`
 * do not belong in logs or Sentry.
 */
export function validateSupplicantRequest(
  payload: unknown
): SupplicantRequestValidation {
  const failures: SupplicantRequestFailure[] = [];
  const fail = (field: string, reason: string) =>
    failures.push({ field, reason });

  const data = (
    typeof payload === 'object' && payload !== null ? payload : {}
  ) as Record<string, unknown>;

  // Firefox mints the code *for this client*, so a substituted client id yields
  // a token carrying the victim's wrapped Sync keys. auth-server cannot catch
  // that — any registered client passes its schema — which makes this the one
  // rule here that is load bearing rather than defence in depth.
  //
  // OAUTH_NATIVE_CLIENT_IDS is the floor: it is compiled in and cannot be
  // emptied by config. `pairing.clients` narrows further when it is populated
  // (it carries the real mobile-client list in production, see
  // fxa-content-server server/lib/configuration.js), but an unhydrated or empty
  // list must not widen the floor.
  const clientId = asString(data.client_id);
  if (!clientId) {
    fail('client_id', 'missing');
  } else if (!CLIENT_ID.test(clientId)) {
    fail('client_id', 'not 16 lowercase hex characters');
  } else if (!OAUTH_NATIVE_CLIENT_IDS.has(clientId)) {
    fail('client_id', 'not a native pairing client');
  } else if (
    (config.pairing?.clients?.length ?? 0) > 0 &&
    !config.pairing.clients.includes(clientId)
  ) {
    fail('client_id', 'not in the configured pairing allowlist');
  }

  const codeChallenge = asString(data.code_challenge);
  if (!codeChallenge) {
    fail('code_challenge', 'missing');
  } else if (
    codeChallenge.length < CODE_CHALLENGE_MIN_LENGTH ||
    codeChallenge.length > CODE_CHALLENGE_MAX_LENGTH ||
    !BASE64URL.test(codeChallenge)
  ) {
    fail(
      'code_challenge',
      `not a base64url string of ${CODE_CHALLENGE_MIN_LENGTH}-${CODE_CHALLENGE_MAX_LENGTH} characters`
    );
  }

  const codeChallengeMethod = asString(data.code_challenge_method);
  if (!codeChallengeMethod) {
    fail('code_challenge_method', 'missing');
  } else if (codeChallengeMethod !== 'S256') {
    fail('code_challenge_method', 'must be S256');
  }

  // Presence matters beyond format: Firefox only wraps the scoped keys into
  // `keys_jwe` when it is handed a `keys_jwk`, so without one the supplicant
  // gets a code granting oldsync with no Sync key behind it — a failure that
  // surfaces long after pairing looked like it worked.
  const keysJwk = asString(data.keys_jwk);
  if (!keysJwk) {
    fail('keys_jwk', 'missing');
  } else if (!BASE64URL.test(keysJwk)) {
    fail('keys_jwk', 'not an unpadded base64url string');
  }

  // Format only, matching v1 (`Vat.string().required().min(1)`). Normalized on
  // the way out so a '+'-separated scope never reaches auth-server, rather than
  // trusting the remote peer to have normalized it.
  const rawScope = asString(data.scope);
  let scope: string | undefined;
  if (!rawScope) {
    fail('scope', 'missing');
  } else {
    const requested = [...scopeStrToArray(rawScope)];
    if (requested.length === 0) {
      fail('scope', 'empty');
    } else {
      scope = requested.join(' ');
    }
  }

  // Opaque to the authority — it is the supplicant's CSRF token and gets
  // forwarded verbatim, so only its bounds are ours to check.
  const state = asString(data.state);
  if (!state) {
    fail('state', 'missing');
  } else if (state.length > STATE_MAX_LENGTH) {
    fail('state', `longer than ${STATE_MAX_LENGTH} characters`);
  }

  const accessType = asString(data.access_type);
  if (
    data.access_type !== undefined &&
    !ACCESS_TYPES.includes(accessType ?? '')
  ) {
    fail('access_type', `must be one of ${ACCESS_TYPES.join(', ')}`);
  }

  if (failures.length > 0) {
    return { ok: false, failures };
  }

  return {
    ok: true,
    request: {
      client_id: clientId!,
      code_challenge: codeChallenge!,
      code_challenge_method: codeChallengeMethod!,
      keys_jwk: keysJwk!,
      scope: scope!,
      state: state!,
      ...(accessType ? { access_type: accessType } : {}),
    },
  };
}
