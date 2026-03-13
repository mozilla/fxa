/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { LOGGER_PROVIDER } from '@fxa/shared/log';
import { StatsD, StatsDService } from '@fxa/shared/metrics/statsd';
import type { NewPasskey } from '@fxa/shared/db/mysql/account';
import type {
  AuthenticatorTransportFuture,
  PublicKeyCredentialCreationOptionsJSON,
  RegistrationResponseJSON,
} from '@simplewebauthn/server';
import { PasskeyConfig } from './passkey.config';
import { PasskeyManager } from './passkey.manager';
import { PasskeyChallengeManager } from './passkey.challenge.manager';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse as adapterVerifyRegistrationResponse,
} from './webauthn-adapter';
import {
  PasskeyChallengeExpiredError,
  PasskeyRegistrationFailedError,
} from './passkey.errors';
import { AppError } from '@fxa/accounts/errors';

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
@Injectable()
export class PasskeyService {
  constructor(
    private readonly passkeyManager: PasskeyManager,
    private readonly challengeManager: PasskeyChallengeManager,
    private readonly config: PasskeyConfig,
    @Inject(StatsDService) private readonly metrics: StatsD,
    @Inject(LOGGER_PROVIDER) private readonly log?: LoggerService
  ) {}

  /**
   * Generate a WebAuthn registration challenge for the attestation ceremony.
   *
   * Validates the user has not exceeded the passkey limit, then generates
   * a challenge and returns WebAuthn PublicKeyCredentialCreationOptions.
   *
   * @param userId - User ID (16-byte Buffer)
   * @param userName - User's display name (e.g. email) for WebAuthn options
   * @returns WebAuthn registration options to pass to the browser
   */
  async generateRegistrationChallenge(
    userId: Buffer,
    userName: string
  ): Promise<PublicKeyCredentialCreationOptionsJSON> {
    const uidHex = userId.toString('hex');

    await this.passkeyManager.checkPasskeyCount(userId);

    const challenge = await this.challengeManager.generateRegistrationChallenge(
      {
        uid: uidHex,
      }
    );

    const options = await generateRegistrationOptions(this.config, {
      uid: userId,
      email: userName,
      challenge,
    });

    return options;
  }

  /**
   * Verify a WebAuthn registration (attestation) response and store the new passkey.
   *
   * Validates the challenge, verifies the attestation, generates a passkey name,
   * and stores the credential in the database.
   *
   * @param uid - User ID (16-byte Buffer)
   * @param response - Raw registration response from the browser
   * @param challenge - Challenge that was issued for this registration
   */
  async verifyRegistrationResponse(
    uid: Buffer,
    response: RegistrationResponseJSON,
    challenge: string
  ): Promise<void> {
    const uidHex = uid.toString('hex');

    const storedChallenge = await this.challengeManager.validateChallenge(
      challenge,
      'registration'
    );
    if (!storedChallenge) {
      // technically, this could be because the challenge expired, was already consumed, or never existed.
      // However, we can't distinguish these cases, and in all cases the appropriate response is to reject the registration attempt.
      throw AppError.passkeyNotFound();
    }

    let result;
    try {
      result = await adapterVerifyRegistrationResponse(this.config, {
        response,
        challenge,
      });
    } catch (err: unknown) {
      throw AppError.passkeyRegistrationFailed();
    }

    if (!result.verified) {
      throw AppError.passkeyRegistrationFailed();
    }

    const {
      credentialId,
      publicKey,
      signCount,
      transports,
      aaguid,
      backupEligible,
      backupState,
    } = result.data;

    const name = this.generatePasskeyName(aaguid, transports ?? []);

    const passkey: NewPasskey = {
      uid,
      credentialId,
      publicKey,
      signCount,
      transports: JSON.stringify(transports ?? []),
      aaguid,
      name,
      createdAt: Date.now(),
      lastUsedAt: null,
      backupEligible: backupEligible ? 1 : 0,
      backupState: backupState ? 1 : 0,
    };

    await this.passkeyManager.registerPasskey(passkey);

    this.metrics.increment('passkey.registration.success');
    this.log?.log('passkey.registered', { uid: uidHex });
  }

  /**
   * Generate an auto-name for a newly registered passkey.
   *
   * Strategy:
   * 1. Non-zero AAGUID: TODO — FIDO MDS lookup (return device name if found)
   * 2. Transport-based fallback
   * 3. Generic fallback: "Passkey"
   */
  private generatePasskeyName(
    aaguid: Buffer,
    transports: AuthenticatorTransportFuture[]
  ): string {
    const allZeros = aaguid.every((b) => b === 0);

    if (!allZeros) {
      // TODO: FIDO MDS lookup — return device name if found
    }

    if (transports.length === 1) {
      switch (transports[0]) {
        case 'internal':
          return 'Platform Passkey';
        case 'usb':
          return 'Security Key';
        case 'nfc':
          return 'NFC Security Key';
        case 'hybrid':
          return 'Passkey';
      }
    }

    return 'Passkey';
  }

  // TODO: Add methods for passkey operations such as:
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
