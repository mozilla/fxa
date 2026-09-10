/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Sentry from '@sentry/browser';
import { ERRNO } from '@fxa/accounts/errors';
import type { AuthServerError } from 'fxa-auth-client/browser';
import { base64urlToBytes } from '../../base64url';
import { JwtTokenCache, sessionToken as getSessionToken } from '../../cache';
import { isInvalidJwtError } from '../../mfa-guard-utils';
import { createWrapEnvelope, openWrapEnvelope } from '../../passkey-crypto';
import { KB_BYTES, PRF_OUT_BYTES } from '../../passkey-crypto/constants';
import type {
  CreatePasskeyWrapArgs,
  CreatePasskeyWrapResult,
  PasskeyWrapAuthClient,
  PasskeyWrapCreationCause,
  PasskeyWrapCreationFailureReason,
  PasskeyWrapFlow,
  PasskeyWrapStore,
} from './interfaces';

/** Failures that no retry of the same envelope can clear. */
const TERMINAL_FAILURES: ReadonlySet<PasskeyWrapCreationFailureReason> =
  new Set([
    'passkey_not_found',
    'wrap_conflict',
    'feature_disabled',
    'key_changed',
  ]);

/** A store of its own, for flows that must not see the page's held envelopes. */
export function createPasskeyWrapStore(): PasskeyWrapStore {
  return { held: new Map(), inFlight: new Set() };
}

/** The store every flow shares unless handed another. */
export const passkeyWrapStore = createPasskeyWrapStore();

const heldKey = (uid: string, credentialId: string) => `${uid}:${credentialId}`;

function refused(
  reason: PasskeyWrapCreationFailureReason,
  cause?: PasskeyWrapCreationCause
): CreatePasskeyWrapResult {
  return { ok: false, failure: reason, ...(cause ? { cause } : {}) };
}

function causeOf(err: unknown): PasskeyWrapCreationCause | undefined {
  if (err == null || typeof err !== 'object') {
    return undefined;
  }
  const { errno, code, retryAfter } = err as AuthServerError;
  if (errno === undefined && code === undefined && retryAfter === undefined) {
    return undefined;
  }
  return { errno, code, retryAfter };
}

function toFailureReason(err: unknown): PasskeyWrapCreationFailureReason {
  // Delegated so this cannot drift from the definition the MfaGuard hosts use.
  if (isInvalidJwtError(err)) {
    return 'proof_invalid';
  }
  switch (causeOf(err)?.errno) {
    case ERRNO.PASSKEY_NOT_FOUND:
      return 'passkey_not_found';
    case ERRNO.PASSKEY_WRAP_CONFLICT:
      return 'wrap_conflict';
    case ERRNO.THROTTLED:
    case ERRNO.REQUEST_BLOCKED:
      return 'throttled';
    case ERRNO.FEATURE_NOT_ENABLED:
      return 'feature_disabled';
    default:
      return 'unexpected';
  }
}

/** A zeroed buffer is spent, not key material. */
function isZeroed(bytes: Uint8Array): boolean {
  return bytes.every((byte) => byte === 0);
}

/** `fill` throws on a detached buffer, which must not mask the result. */
function zeroize(...buffers: (Uint8Array | undefined)[]) {
  for (const buffer of buffers) {
    try {
      buffer?.fill(0);
    } catch {
      // Detached by a structured-clone transfer; nothing left to clear.
    }
  }
}

/**
 * Identifies the `kB` an envelope sealed, so a retry cannot substitute another.
 * Eight bytes of SHA-256 over credential and key: enough to tell 256-bit keys
 * apart, not enough to invert.
 */
async function keyIdFor(credentialId: string, kB: Uint8Array): Promise<string> {
  const label = new TextEncoder().encode(`${credentialId}:`);
  const input = new Uint8Array(label.length + kB.length);
  input.set(label);
  input.set(kB, label.length);
  try {
    const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', input));
    return Array.from(digest.subarray(0, 8), (byte) =>
      byte.toString(16).padStart(2, '0')
    ).join('');
  } finally {
    zeroize(input);
  }
}

function constantTimeEquals(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

/** The proof claims read before the server has seen the token. */
type ProofClaims = {
  /** Lowercase hex account id, as the envelope context expects. */
  uid: string;
  /** `passkeys.credentialId`, base64url. Absent on a proof bound to none. */
  cid?: string;
};

/**
 * Reads the account and credential the proof was minted for. The server files
 * the wrap under `sub`, so the sealing context must come from the same claim:
 * an envelope sealed against any other uid is stored and never opens, and the
 * local round trip cannot tell. The signature is the server's to verify — a
 * forged `sub` only yields a wrap its forger cannot open.
 */
function claimsFromMfaToken(mfaToken: string): ProofClaims | undefined {
  const payload = mfaToken.split('.')[1];
  if (!payload) {
    return undefined;
  }
  try {
    const claims: unknown = JSON.parse(
      new TextDecoder().decode(base64urlToBytes(payload))
    );
    if (claims === null || typeof claims !== 'object') {
      return undefined;
    }
    const { sub, cid } = claims as { sub?: unknown; cid?: unknown };
    if (typeof sub !== 'string' || !/^[0-9a-f]{32}$/.test(sub)) {
      return undefined;
    }
    return { uid: sub, cid: typeof cid === 'string' ? cid : undefined };
  } catch {
    return undefined;
  }
}

/** Compares decoded bytes, as the server does, so padding cannot differ. */
function isBoundTo(cid: string | undefined, credentialId: string): boolean {
  if (!cid) {
    return false;
  }
  try {
    return constantTimeEquals(
      base64urlToBytes(cid),
      base64urlToBytes(credentialId)
    );
  } catch {
    return false;
  }
}

/**
 * Drops a rejected proof from the JWT cache, matching on the token: callers
 * that mint a proof inline may hold an unrelated, still valid `passkey` token
 * for the same session. `MfaOtpRequestCache` is left alone; `passkey` is not
 * an OTP scope.
 */
function evictRejectedProof(mfaToken: string) {
  const sessionToken = getSessionToken();
  if (!sessionToken) {
    return;
  }
  // `getToken` rather than `hasToken`, which answers false for an expired
  // entry — the usual reason the server rejected it.
  try {
    if (JwtTokenCache.getToken(sessionToken, 'passkey') === mfaToken) {
      JwtTokenCache.removeToken(sessionToken, 'passkey');
    }
  } catch {
    // Nothing cached, or storage refused the write; neither may escape.
  }
}

/**
 * Builds and stores the envelope that lets one passkey unlock `kB`. Every
 * input but the account id comes from the caller, so the same flow serves the
 * sign-in opt-in and, later, registration and Settings enrolment.
 *
 * **Ownership.** `kB` and `prfOut` are zeroed in place once sealed and left
 * untouched on every path that rejects first. A caller holding `kB` as a hex
 * string still owns that copy; Web Crypto's internal copies are out of reach.
 *
 * **Retrying.** The store accepts only byte-identical repeats, so sealing
 * again after a lost response wedges the credential on errno 235. A sealed but
 * unstored envelope is therefore held and re-sent; a retry may omit `kB` and
 * `prfOut`, and a `kB` that differs from the sealed one is refused.
 *
 * **Sharing.** Held envelopes and the in-flight guard live in a store all
 * instances share, keyed by account and credential, so a remount or a second
 * consumer re-sends rather than re-seals. The store lasts the page session;
 * envelopes are ciphertext.
 */
export function createPasskeyWrapFlow(
  authClient: PasskeyWrapAuthClient,
  store: PasskeyWrapStore = passkeyWrapStore
): PasskeyWrapFlow {
  // Per instance, unlike `store.inFlight`: it answers whether *this* caller's
  // call is still running, whichever credential it is for.
  let busy = false;

  const report = (label: string, tags: Record<string, string>) =>
    Sentry.captureException(new Error(label), { tags });

  const run = async ({
    credentialId,
    mfaToken,
    prfOut,
    kB,
  }: CreatePasskeyWrapArgs): Promise<CreatePasskeyWrapResult> => {
    const claims = claimsFromMfaToken(mfaToken);
    if (!claims) {
      evictRejectedProof(mfaToken);
      return refused('proof_invalid');
    }
    const { uid } = claims;

    // The server refuses this too, but only after sealing: the PRF output
    // belongs to the passkey the proof names, so the envelope could never
    // open, yet a retry with the right proof would store it. A caller bug, so
    // the proof stays cached.
    if (!isBoundTo(claims.cid, credentialId)) {
      report('passkey-wrap-proof error', { stage: 'proof' });
      return refused('proof_invalid');
    }

    const key = heldKey(uid, credentialId);

    // Two envelopes sealed for one credential leave the loser on a permanent
    // errno 235, so a call for it raised while one runs does nothing.
    if (store.inFlight.has(key)) {
      return refused('in_flight');
    }
    // Claimed before the first `await` below: a second call raised in the same
    // tick must not slip past the check above. Released by the `finally`.
    store.inFlight.add(key);

    const fail = (
      reason: PasskeyWrapCreationFailureReason,
      cause?: PasskeyWrapCreationCause
    ): CreatePasskeyWrapResult => {
      if (TERMINAL_FAILURES.has(reason)) {
        store.held.delete(key);
      }
      return refused(reason, cause);
    };

    try {
      const reusable = store.held.get(key);

      // A zeroed `kB` is the ordinary retry: the first attempt spent it in
      // place. Live material is compared so a *different* key is refused
      // rather than stored under a stale envelope.
      if (reusable && kB && !isZeroed(kB)) {
        // Malformed input is the caller's to fix; the held envelope is still
        // good, so only a genuine key mismatch drops it.
        if (kB.length !== KB_BYTES) {
          return fail('key_unusable');
        }
        if ((await keyIdFor(credentialId, kB)) !== reusable.keyId) {
          return fail('key_changed');
        }
      }

      if (!reusable) {
        // Width answers "can this authenticator hold a wrap"; all-zero answers
        // "already spent". They route to different copy.
        if (prfOut?.length !== PRF_OUT_BYTES) {
          return fail('prf_unsupported');
        }
        if (kB?.length !== KB_BYTES || isZeroed(kB) || isZeroed(prfOut)) {
          return fail('key_unusable');
        }
      }

      let envelope = reusable?.envelope;

      // The reuse path read `kB` to compare it; a caller that re-derived its
      // key before retrying would otherwise keep both copies live.
      if (envelope) {
        zeroize(kB, prfOut);
      }

      if (!envelope) {
        // Narrowed by the guards above; the seal branch always has both.
        const kBToSeal = kB as Uint8Array;
        const prfToSeal = prfOut as Uint8Array;
        const keyId = await keyIdFor(credentialId, kBToSeal);

        try {
          envelope = await createWrapEnvelope({
            kB: kBToSeal,
            prfOut: prfToSeal,
            uid,
            credentialId,
          });
        } catch (err) {
          // Left intact: nothing was sealed, so a retry is still possible.
          report('passkey-wrap-seal error', {
            stage: 'seal',
            errno: String(causeOf(err)?.errno ?? 'none'),
          });
          return fail('unexpected', causeOf(err));
        }

        // Sealing never runs the open half: `skR` unwrap, raw P-521 scalar
        // import, HPKE decap. A platform whose EC export diverges (see
        // `key-wrap.ts`) seals a well-formed envelope that never opens, per
        // keypair, so only a check on every wrap catches it.
        let recovered: Uint8Array | undefined;
        try {
          recovered = await openWrapEnvelope({
            envelope,
            prfOut: prfToSeal,
            uid,
            credentialId,
          });
          if (!constantTimeEquals(recovered, kBToSeal)) {
            throw new Error('recovered kB did not match');
          }
        } catch {
          report('passkey-wrap-verify error', { stage: 'verify' });
          return fail('platform_crypto');
        } finally {
          zeroize(recovered, kBToSeal, prfToSeal);
        }

        store.held.set(key, { keyId, envelope });
      }

      const { created } = await authClient.createPasskeyWrap(
        mfaToken,
        credentialId,
        envelope
      );

      if (typeof created !== 'boolean') {
        // The route pins `created` as required; treating an absent one as
        // stored would drop the envelope and wedge the retry on errno 235.
        report('passkey-wrap-response error', { stage: 'store' });
        return fail('unexpected');
      }

      store.held.delete(key);
      return { ok: true, created };
    } catch (err) {
      const reason = toFailureReason(err);
      if (reason === 'proof_invalid') {
        evictRejectedProof(mfaToken);
      }
      if (reason === 'unexpected') {
        // errno tag only. Upstream messages may carry identifiers.
        report('passkey-wrap-store error', {
          stage: 'store',
          errno: String(causeOf(err)?.errno ?? 'none'),
        });
      }
      return fail(reason, causeOf(err));
    } finally {
      store.inFlight.delete(key);
    }
  };

  const createWrap = async (
    args: CreatePasskeyWrapArgs
  ): Promise<CreatePasskeyWrapResult> => {
    // Held for every path, including proof rejections that never reach the
    // store: the hook reads `inFlight` to keep a same-tick second call from
    // clobbering the state of the one still settling.
    if (busy) {
      return refused('in_flight');
    }
    busy = true;
    try {
      return await run(args);
    } finally {
      busy = false;
    }
  };

  return {
    createWrap,
    get inFlight() {
      return busy;
    },
  };
}
