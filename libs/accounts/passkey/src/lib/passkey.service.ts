/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Inject, Service, Token } from 'typedi';
import { ILogger, LOGGER_PROVIDER } from '@fxa/shared/log';
import { StatsD } from '@fxa/shared/metrics/statsd';
import { PasskeyManager } from './passkey.manager';

export const StatsDToken = new Token<StatsD>('StatsD');

/**
 * PasskeyService - High-level business logic for passkey (WebAuthn) operations.
 *
 * This service handles the orchestration of passkey authentication flows including:
 * - Passkey registration (attestation)
 * - Passkey authentication (assertion)
 * - Passkey management (list, rename, delete)
 * - Challenge generation and verification
 *
 * ## WebAuthn Library Integration
 *
 * This service will use a WebAuthn library (e.g., @simplewebauthn/server) for:
 * - Challenge generation and validation
 * - Cryptographic signature verification
 * - CBOR/COSE parsing (publicKey, credentialId, authenticator data)
 * - Extracting: signCount, transports, aaguid, backup flags (BE/BS)
 *
 * The library handles WebAuthn spec compliance and crypto operations.
 * This service translates between WebAuthn responses and our database model.
 *
 * ## Data Storage
 *
 * When storing passkey data from WebAuthn library responses:
 * - **AAGUID**: Store exactly as provided (including all-zeros for privacy-preserving authenticators)
 * - **transports**: Store as JSON array (use [] if not provided)
 * - **name**: Always generate a default if not provided (use "Passkey" as fallback)
 * - **backupEligible/backupState**: Extract from authenticator data flags (BE/BS bits)
 *
 */
@Service()
export class PasskeyService {
  constructor(
    private readonly passkeyManager: PasskeyManager,
    @Inject(StatsDToken) private readonly metrics: StatsD,
    @Inject(LOGGER_PROVIDER) private readonly log?: ILogger
  ) {}

  // TODO: Add methods for passkey operations such as:
  // - generateRegistrationChallenge
  // - verifyRegistrationResponse
  //     CRITICAL: Must ALWAYS generate a name (NOT NULL in database).
  //     Strategy: 1) AAGUID → FIDO MDS lookup (skip if all-zeros), 2) transport-based fallback,
  //     3) generic fallback ("Passkey"). See PASSKEY_FIELDS.md for details.
  //     CRITICAL: Must normalize transports - use [] (empty array) if undefined/null.
  //     Note: Store AAGUID as-is (no normalization needed, all-zeros is valid).
  // - generateAuthenticationChallenge
  // - verifyAuthenticationResponse (extract backup state, signCount, validate rollback)
  // - listPasskeysForUser
  // - renamePasskey
  // - deletePasskey
  //
  // TODO: Add signCount rollback detection in verifyAuthenticationResponse():
  //   - Fetch existing passkey with current signCount
  //   - Compare new signCount from authenticator response
  //   - If new < old AND old > 0: Log security warning (potential cloning attack)
  //   - Allow authenticators that always return 0 (batch attestation per spec)
  //   - Log event: 'passkey.signCount.rollback' with uid, credentialId, oldCount, newCount
}
