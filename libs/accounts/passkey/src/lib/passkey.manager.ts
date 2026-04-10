/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Inject, Injectable, LoggerService } from '@nestjs/common';
import {
  AccountDatabase,
  AccountDbProvider,
  Passkey,
} from '@fxa/shared/db/mysql/account';
import { LOGGER_PROVIDER } from '@fxa/shared/log';
import { StatsD, StatsDService } from '@fxa/shared/metrics/statsd';
import {
  countPasskeysByUid,
  deleteAllPasskeysForUser as repositoryDeleteAllPasskeysForUser,
  deletePasskey as repositoryDeletePasskey,
  findPasskeyByCredentialId as repositoryFindPasskeyByCredentialId,
  findPasskeysByUid,
  insertPasskey,
  isMysqlDupEntry,
  updatePasskeyCounterAndLastUsed,
  updatePasskeyName,
} from './passkey.repository';
import { PasskeyConfig, MAX_PASSKEY_NAME_LENGTH } from './passkey.config';
import { AppError } from '@fxa/accounts/errors';

/**
 * PasskeyManager - Application service for passkey operations.
 *
 * Orchestrates repository calls and enforces business rules:
 * - Maximum passkeys per user
 * - Credential uniqueness
 *
 * See passkey.repository.ts for the underlying pure SQL query functions.
 */
@Injectable()
export class PasskeyManager {
  private readonly maxPasskeysPerUser: number;

  constructor(
    @Inject(AccountDbProvider) private readonly db: AccountDatabase,
    @Inject(PasskeyConfig) config: PasskeyConfig,
    @Inject(StatsDService) private readonly metrics: StatsD,
    @Inject(LOGGER_PROVIDER) private readonly log: LoggerService
  ) {
    this.maxPasskeysPerUser = config.maxPasskeysPerUser;
  }

  /**
   * Register a new passkey for a user.
   *
   * Checks the per-user limit before inserting. Duplicate credential IDs are
   * caught from the database unique constraint and converted to
   * AppError.passkeyAlreadyRegistered().
   *
   * @throws {AppError} (passkeyLimitReached) if the user has reached the maximum passkey count
   * @throws {AppError} (passkeyAlreadyRegistered) if credentialId is already registered
   */
  async registerPasskey(passkey: Passkey): Promise<void> {
    const uidHex = passkey.uid.toString('hex');

    await this.checkPasskeyCount(passkey.uid);

    try {
      await insertPasskey(this.db, passkey);
      this.metrics.increment('registerPasskey.success');
    } catch (err: unknown) {
      if (isMysqlDupEntry(err)) {
        const credentialIdHex = passkey.credentialId.toString('hex');
        this.metrics.increment('registerPasskey.fail', { reason: 'duplicate' });
        this.log.error(
          'PasskeyManager.registerPasskey: duplicate credentialId',
          { uid: uidHex, credentialId: credentialIdHex }
        );
        throw AppError.passkeyAlreadyRegistered();
      }
      throw err;
    }
  }

  /**
   * Update passkey metadata after a successful authentication.
   *
   * Updates signCount, backupState, and lastUsedAt. Must only be called after
   * the WebAuthn assertion has been fully verified by the service layer,
   * including signCount validation (the primary guard against cloned or replayed
   * authenticators). Replays are blocked upstream by single-use challenge
   * validation and never reach this call.
   *
   * A false return indicates the credential was not found or a concurrent write
   * conflict — not a detected cloning attempt.
   *
   * @param uid - User ID (16-byte Buffer)
   * @param credentialId - WebAuthn credential ID
   * @param signCount - Verified new signature counter value from authenticator data
   * @param backupState - Current backup-state flag (BS) from authenticator data
   * @returns true if updated, false if not found or concurrent write conflict
   */
  async updatePasskeyAfterAuth(
    uid: Buffer,
    credentialId: Buffer,
    signCount: number,
    backupState: boolean
  ): Promise<boolean> {
    return updatePasskeyCounterAndLastUsed(
      this.db,
      uid,
      credentialId,
      signCount,
      backupState ? 1 : 0
    );
  }

  /**
   * Find a passkey by its credential ID.
   *
   * Used by the service layer for per-credential lookups during authentication.
   * This lookup is intentionally uid-agnostic to support the usernameless
   * (discoverable credential) flow where the uid is not yet known.
   *
   * SECURITY: The caller is responsible for verifying that the returned
   * passkey's uid matches the authenticated session uid before acting on
   * the result. Do not use the returned uid as proof of identity.
   *
   * @param credentialId - WebAuthn credential ID (Buffer)
   * @returns Passkey if found, undefined otherwise
   */
  async findPasskeyByCredentialId(
    credentialId: Buffer
  ): Promise<Passkey | undefined> {
    return repositoryFindPasskeyByCredentialId(this.db, credentialId);
  }

  /**
   * List all passkeys for a user, ordered by creation date newest-first.
   *
   * @param uid - User ID (16-byte Buffer)
   * @returns Array of passkeys ordered by createdAt descending
   */
  async listPasskeysForUser(uid: Buffer): Promise<Passkey[]> {
    return findPasskeysByUid(this.db, uid);
  }

  /**
   * Rename a passkey.
   *
   * Both uid and credentialId must match to prevent one user from renaming
   * another user's passkey.
   *
   * @returns true if the passkey was found and renamed, false if not found, wrong user, or name exceeds MAX_PASSKEY_NAME_LENGTH characters
   */
  async renamePasskey(
    uid: Buffer,
    credentialId: Buffer,
    newName: string
  ): Promise<boolean> {
    if (newName.length > MAX_PASSKEY_NAME_LENGTH) {
      return false;
    }
    const rowsUpdated = await updatePasskeyName(
      this.db,
      uid,
      credentialId,
      newName
    );
    return rowsUpdated > 0;
  }

  /**
   * Delete a passkey for a user.
   *
   * Both uid and credentialId must match to prevent one user from deleting
   * another user's passkeys.
   *
   * @returns true if the passkey was found and deleted, false otherwise
   */
  async deletePasskey(uid: Buffer, credentialId: Buffer): Promise<boolean> {
    return repositoryDeletePasskey(this.db, uid, credentialId);
  }

  /**
   * Delete all passkeys for a user.
   *
   * Used during account deletion to remove all passkey credentials.
   *
   * @param uid - User ID (16-byte Buffer)
   * @returns Number of passkeys deleted
   */
  async deleteAllPasskeysForUser(uid: Buffer): Promise<number> {
    return repositoryDeleteAllPasskeysForUser(this.db, uid);
  }

  /**
   * Count the number of passkeys registered for a user.
   *
   * @returns Current passkey count for the user
   */
  async countPasskeys(uid: Buffer): Promise<number> {
    return countPasskeysByUid(this.db, uid);
  }

  /**
   * Checks if the user has exceeded the passkey limit and throws if so.
   * @param uid - User ID (16-byte Buffer)
   */
  async checkPasskeyCount(uid: Buffer): Promise<void> {
    const uidHex = uid.toString('hex');
    const count = await this.countPasskeys(uid);

    if (count >= this.maxPasskeysPerUser) {
      this.metrics.increment('registerPasskey.fail', {
        reason: 'limit_reached',
      });
      this.log.error('PasskeyManager.passkeyLimitReached', {
        uid: uidHex,
        limit: this.maxPasskeysPerUser,
      });
      throw AppError.passkeyLimitReached(this.maxPasskeysPerUser);
    }
  }
}
