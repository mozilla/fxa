/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Inject, Injectable, LoggerService } from '@nestjs/common';
import type {
  AuthenticationResponseJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/server';
import { LOGGER_PROVIDER } from '@fxa/shared/log';
import { StatsD, StatsDService } from '@fxa/shared/metrics/statsd';
import * as Sentry from '@sentry/nestjs';
import type { NewPasskey, Passkey } from '@fxa/shared/db/mysql/account';
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
  RegistrationVerificationResult,
  AuthenticationVerificationResult,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from './webauthn-adapter';
import { AppError } from '@fxa/accounts/errors';

export interface AuthenticationResult {
  uid: Buffer;
}

/**
 * Regex matching display-safe unicode characters (including non-BMP / emoji).
 * Rejects control characters, private-use-area, line/paragraph separators,
 * and other non-display-safe unicode.
 *
 * Mirrors the DISPLAY_SAFE_UNICODE_WITH_NON_BMP pattern used for device names
 * in auth-server
 */
const DISPLAY_SAFE_UNICODE_WITH_NON_BMP =
  /^(?:[^\u0000-\u001F\u007F\u0080-\u009F\u2028-\u2029\uE000-\uF8FF\uFFF9-\uFFFC\uFFFE-\uFFFF])*$/;

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
   * @param uid - User ID (16-byte Buffer)
   * @param email - User's display name (e.g. email) for WebAuthn options
   * @returns WebAuthn registration options to pass to the browser
   */
  async generateRegistrationChallenge(
    uid: Buffer,
    email: string
  ): Promise<PublicKeyCredentialCreationOptionsJSON> {
    const uidHex = uid.toString('hex');

    await this.passkeyManager.checkPasskeyCount(uid);

    const challenge =
      await this.challengeManager.generateRegistrationChallenge(uidHex);

    const options = await generateRegistrationOptions(this.config, {
      uid,
      email,
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
  async createPasskeyFromRegistrationResponse(
    uid: Buffer,
    response: RegistrationResponseJSON,
    challenge: string
  ): Promise<NewPasskey> {
    const uidHex = uid.toString('hex');

    const storedChallenge =
      await this.challengeManager.consumeRegistrationChallenge(
        challenge,
        uidHex
      );

    if (!storedChallenge) {
      this.metrics.increment('passkey.registration.failed', {
        reason: 'challengeNotFound',
      });
      // technically, this could be because the challenge expired, was already consumed, or never existed.
      // However, we can't distinguish these cases, and in all cases the appropriate response is to reject the registration attempt.
      throw AppError.passkeyChallengeNotFound();
    }

    let result: RegistrationVerificationResult;
    try {
      result = await adapterVerifyRegistrationResponse(this.config, {
        response,
        challenge: storedChallenge.challenge,
      });
    } catch (err: unknown) {
      Sentry.captureException(err);
      this.metrics.increment('passkey.registration.failed', {
        reason: 'verificationError',
      });
      throw AppError.passkeyRegistrationFailed();
    }

    if (!result.verified) {
      this.metrics.increment('passkey.registration.failed', {
        reason: 'notVerified',
      });
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

    const existingPasskeys = await this.passkeyManager.listPasskeysForUser(uid);

    const name = this.generatePasskeyName(aaguid, transports, existingPasskeys);

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

    return passkey;
  }

  /**
   * Returns all passkeys for a user, ordered by createdAt descending.
   *
   * @param uid - User ID (16-byte Buffer)
   * @returns Array of passkeys belonging to the user
   */
  async listPasskeysForUser(uid: Buffer): Promise<Passkey[]> {
    const passkeys = await this.passkeyManager.listPasskeysForUser(uid);
    this.metrics.increment('passkey.list.success');
    return passkeys;
  }

  /**
   * Updates the friendly name for a passkey, ensuring the passkey belongs to the user.
   * The name is trimmed before validation and storage.
   *
   * @param uid - User ID (16-byte Buffer)
   * @param credentialId - Credential ID of the passkey to rename
   * @param newName - New display name for the passkey
   * @throws {AppError} (passkeyInvalidName) - when name is empty, whitespace-only, or exceeds 255 chars
   * @throws {AppError} (passkeyNotFound) - when passkey does not exist or does not belong to the user
   */
  async renamePasskey(
    uid: Buffer,
    credentialId: Buffer,
    newName: string
  ): Promise<void> {
    const trimmed = newName.trim();
    if (
      !trimmed ||
      trimmed.length > 255 ||
      !DISPLAY_SAFE_UNICODE_WITH_NON_BMP.test(trimmed)
    ) {
      throw AppError.passkeyInvalidName();
    }
    let updated = false;
    try {
      updated = await this.passkeyManager.renamePasskey(
        uid,
        credentialId,
        trimmed
      );
    } catch (err) {
      Sentry.captureException(err);
      this.metrics.increment('passkey.rename.failed', {
        reason: 'dbError',
      });
      throw AppError.passkeyRenameFailed();
    }
    if (!updated) {
      this.metrics.increment('passkey.rename.failed', {
        reason: 'notFound',
      });
      throw AppError.passkeyNotFound();
    }

    this.metrics.increment('passkey.rename.success');
    this.log?.log('passkey.renamed', { uid: uid.toString('hex') });
  }

  /**
   * Deletes a passkey, ensuring the passkey belongs to the user.
   *
   * @param uid - User ID (16-byte Buffer)
   * @param credentialId - Credential ID of the passkey to delete
   * @throws {AppError} (passkeyNotFound) - when passkey does not exist or does not belong to the user
   * @throws {AppError} (passkeyDeleteFailed) - when a database error occurs during deletion
   */
  async deletePasskey(uid: Buffer, credentialId: Buffer): Promise<void> {
    let deleted = false;
    try {
      deleted = await this.passkeyManager.deletePasskey(uid, credentialId);
    } catch (err) {
      Sentry.captureException(err);
      this.metrics.increment('passkey.delete.failed', {
        reason: 'dbError',
      });
      throw AppError.passkeyDeleteFailed();
    }
    if (!deleted) {
      this.metrics.increment('passkey.delete.failed', {
        reason: 'notFound',
      });
      throw AppError.passkeyNotFound();
    }

    this.metrics.increment('passkey.delete.success');
    this.log?.log('passkey.deleted', { uid: uid.toString('hex') });
  }

  /**
   * Generate a unique auto-name for a newly registered passkey.
   *
   * Determines a base name from the authenticator metadata, then appends
   * a numeric suffix if the name already exists for this user
   * (e.g., "Passkey", "Passkey 2", "Passkey 3").
   */
  private generatePasskeyName(
    aaguid: Buffer,
    transports: AuthenticatorTransportFuture[],
    existingPasskeys: Passkey[]
  ): string {
    const baseName = this.getBasePasskeyName(aaguid, transports);
    return this.deduplicatePasskeyName(baseName, existingPasskeys);
  }

  /**
   * Determine the base passkey name from authenticator metadata.
   *
   * Strategy:
   * 1. Non-zero AAGUID: TODO — FIDO MDS lookup (return device name if found)
   * 2. Transport-based fallback
   * 3. Generic fallback: "Passkey"
   */
  private getBasePasskeyName(
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

  private deduplicatePasskeyName(
    baseName: string,
    existingPasskeys: Passkey[]
  ): string {
    const existingNames = existingPasskeys.map((p) => p.name).filter(Boolean);

    if (!existingNames.includes(baseName)) return baseName;

    // Find the highest existing suffix for this base name.
    // Always increment past it — never reuse a gap left by a rename.
    let maxSuffix = 1;
    const prefix = `${baseName} `;
    for (const name of existingNames) {
      if (name.startsWith(prefix)) {
        const num = parseInt(name.slice(prefix.length), 10);
        if (!isNaN(num) && num > maxSuffix) {
          maxSuffix = num;
        }
      }
    }

    return `${baseName} ${maxSuffix + 1}`;
  }

  /**
   * Generate WebAuthn authentication (assertion) options.
   *
   * @param uid - Optional user ID. When provided, restricts authentication to
   *   the user's registered credentials (known-user flow).
   * @returns WebAuthn authentication options
   */
  async generateAuthenticationChallenge(
    uid?: Buffer
  ): Promise<PublicKeyCredentialRequestOptionsJSON> {
    const challenge =
      await this.challengeManager.generateAuthenticationChallenge();

    let allowCredentials: Buffer[] = [];
    if (uid) {
      const passkeys = await this.passkeyManager.listPasskeysForUser(uid);
      allowCredentials = passkeys.map((p) => p.credentialId);
    }

    return await generateAuthenticationOptions(this.config, {
      challenge,
      allowCredentials,
    });
  }

  /**
   * Verify a WebAuthn authentication response.
   *
   * @param response - The raw authentication response from the browser.
   * @param challenge - The challenge that was issued for this authentication.
   * @param expectedUid - Optional expected user ID. When provided, verifies that
   * the authenticating passkey belongs to this user.
   * @returns Authentication result containing the uid of the authenticated user.
   * @throws {AppError} passkeyNotFound if the credential is not registered.
   * @throws {AppError} passkeyChallengeExpired if the challenge is invalid or expired.
   * @throws {AppError} passkeyAuthenticationFailed if assertion verification fails
   * or `expectedUid` does not match the passkey owner.
   */
  async verifyAuthenticationResponse(
    response: AuthenticationResponseJSON,
    challenge: string,
    expectedUid?: Buffer
  ): Promise<AuthenticationResult> {
    const credentialId = Buffer.from(response.id, 'base64url');

    const passkey =
      await this.passkeyManager.findPasskeyByCredentialId(credentialId);
    if (!passkey) {
      this.metrics.increment('passkey.authentication.failed', {
        reason: 'passkeyNotFound',
      });
      throw AppError.passkeyNotFound();
    }

    if (expectedUid && !passkey.uid.equals(expectedUid)) {
      this.metrics.increment('passkey.authentication.failed', {
        reason: 'uidMismatch',
      });
      throw AppError.passkeyAuthenticationFailed();
    }

    const storedChallenge =
      await this.challengeManager.consumeAuthenticationChallenge(challenge);
    if (!storedChallenge) {
      this.metrics.increment('passkey.authentication.failed', {
        reason: 'challengeNotFound',
      });
      this.log?.warn('passkey.challengeNotFound', {
        credentialId: credentialId.toString('hex'),
      });
      throw AppError.passkeyChallengeNotFound();
    }

    let result: AuthenticationVerificationResult;
    try {
      result = await verifyAuthenticationResponse(this.config, {
        response,
        challenge: storedChallenge.challenge,
        credentialId: passkey.credentialId,
        publicKey: passkey.publicKey,
        signCount: passkey.signCount,
      });
    } catch (err) {
      // simplewebauthn throws when signCount decrements
      if (err instanceof Error && /^Response counter value/.test(err.message)) {
        this.log?.warn('passkey.signCount.rollback', {
          uid: passkey.uid.toString('hex'),
          credentialId: credentialId.toString('hex'),
          oldCount: passkey.signCount,
          error: err.message,
        });
        this.metrics.increment('passkey.signCount.rollback');
      }
      this.metrics.increment('passkey.authentication.failed', {
        reason: 'verificationError',
      });
      throw AppError.passkeyAuthenticationFailed();
    }

    if (!result.verified) {
      this.metrics.increment('passkey.authentication.failed', {
        reason: 'notVerified',
      });
      throw AppError.passkeyAuthenticationFailed();
    }

    const { newSignCount, backupState } = result.data;

    const updated = await this.passkeyManager.updatePasskeyAfterAuth(
      passkey.uid,
      passkey.credentialId,
      newSignCount,
      backupState
    );
    if (!updated) {
      this.log?.error('passkey.updateAfterAuth.failed', {
        uid: passkey.uid.toString('hex'),
        credentialId: credentialId.toString('hex'),
        newSignCount,
      });
      this.metrics.increment('passkey.authentication.failed', {
        reason: 'updateFailed',
      });
      throw AppError.passkeyAuthenticationFailed();
    }

    this.metrics.increment('passkey.authentication.success');
    this.log?.log('passkey.authenticated', {
      uid: passkey.uid.toString('hex'),
    });

    return { uid: passkey.uid };
  }
}
