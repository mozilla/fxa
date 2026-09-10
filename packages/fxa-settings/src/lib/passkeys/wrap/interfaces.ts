/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type AuthClient from 'fxa-auth-client/browser';
import type {
  AuthServerError,
  PasskeyWrapEnvelope,
} from 'fxa-auth-client/browser';

/**
 * Why a wrap could not be stored. The server answers 401, 403 and 404 for more
 * than one condition each, so callers branch on these rather than on status.
 *
 * Deliberately not `AuthUiErrors` entries: these are outcomes, not copy, and
 * nothing here renders. TODO: FXA-13151 maps them to user-facing strings at
 * the surface that shows them.
 */
export type PasskeyWrapCreationFailureReason =
  /** No PRF output, or the wrong width: this passkey cannot hold a wrap. */
  | 'prf_unsupported'
  /** `kB` is missing, wrong-width or spent, or the PRF output is spent. */
  | 'key_unusable'
  /** A retry arrived with a different `kB` than the sealed envelope holds. */
  | 'key_changed'
  /** The envelope this platform sealed could not be opened again. */
  | 'platform_crypto'
  /**
   * The proof names no usable account, is bound to another credential, or
   * was spent, expired, or its session is gone (errno 223, 110).
   */
  | 'proof_invalid'
  /** No such passkey on the account (errno 224). */
  | 'passkey_not_found'
  /** A different wrap is already stored for this passkey (errno 235). */
  | 'wrap_conflict'
  /** Customs refused the request (errno 114, 125). */
  | 'throttled'
  /** Passwordless Sync is switched off server-side (errno 202). */
  | 'feature_disabled'
  /** A call was already running; this one did nothing. */
  | 'in_flight'
  | 'unexpected';

export type CreatePasskeyWrapArgs = {
  /** WebAuthn credential id, base64url, as stored in `passkeys`. */
  credentialId: string;
  /**
   * MFA JWT scoped `mfa:passkey` and bound to `credentialId`. Its `sub` names
   * the account the envelope is sealed for.
   */
  mfaToken: string;
  /**
   * PRF output from the ceremony that produced `mfaToken`. Omit only when
   * retrying a call that already sealed; a first attempt requires it, and
   * undefined means the authenticator returned none.
   */
  prfOut?: Uint8Array;
  /** The 32 bytes the wrap seals. Same rule as `prfOut` on a retry. */
  kB?: Uint8Array;
};

/** The auth-client error fields callers may safely inspect or report. */
export type PasskeyWrapCreationCause = Pick<
  AuthServerError,
  'errno' | 'code' | 'retryAfter'
>;

export type CreatePasskeyWrapResult =
  /** `created` is false when this envelope was already stored. */
  | { ok: true; created: boolean }
  | {
      ok: false;
      failure: PasskeyWrapCreationFailureReason;
      cause?: PasskeyWrapCreationCause;
    };

/** Pick<> so tests can pass minimal mocks without `as any`. */
export type PasskeyWrapAuthClient = Pick<AuthClient, 'createPasskeyWrap'>;

export type PasskeyWrapFlow = {
  createWrap: (args: CreatePasskeyWrapArgs) => Promise<CreatePasskeyWrapResult>;
  /** True while a `createWrap` call through this instance is running. */
  readonly inFlight: boolean;
};

/** The envelope built by an attempt that has not yet been stored. */
export type SealedAttempt = {
  /** Identifies the `kB` sealed, so a retry cannot substitute another. */
  keyId: string;
  envelope: PasskeyWrapEnvelope;
};

/**
 * State every flow instance shares, keyed by account and credential, so a
 * remount or a second consumer finds what an earlier instance sealed instead
 * of sealing again.
 */
export type PasskeyWrapStore = {
  held: Map<string, SealedAttempt>;
  inFlight: Set<string>;
};

export type UsePasskeyWrapCreationResult = {
  createWrap: PasskeyWrapFlow['createWrap'];
  isLoading: boolean;
  failure?: PasskeyWrapCreationFailureReason;
};
