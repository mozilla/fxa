/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { randomBytes } from 'crypto';
import { Injectable, Inject, LoggerService } from '@nestjs/common';
import { LOGGER_PROVIDER } from '@fxa/shared/log';
import { Redis } from 'ioredis';

import {
  ChallengeType,
  CreateRegistrationChallengeInput,
  CreateUpgradeChallengeInput,
  PASSKEY_CHALLENGE_REDIS_PREFIX,
  StoredChallenge,
} from './passkey.challenge';
import { PasskeyConfig } from './passkey.config';
import {
  PasskeyChallengeExpiredError,
  PasskeyChallengeNotFoundError,
} from './passkey.errors';

/**
 * Default challenge TTL: 5 minutes in milliseconds.
 * Once config changes land, this can be removed and we rely on default from convict
 */
const DEFAULT_CHALLENGE_TIMEOUT_MS = 1000 * 60 * 5;

/**
 * NestJS injection token for the Redis client used exclusively for passkey challenges.
 * Wire up a provider using this token in the consuming NestJS module.
 *
 * @example
 * // In a NestJS module:
 * {
 *   provide: PASSKEY_CHALLENGE_REDIS,
 *   useFactory: (config: ConfigService) => new Redis({
 *     ...config.get('redis'),
 *     ...config.get('redis.passkey'),
 *   }),
 *   inject: [ConfigService],
 * }
 */
export const PASSKEY_CHALLENGE_REDIS = 'PasskeyChallengeRedis';

/**
 * Manages the lifecycle of WebAuthn challenges stored in Redis.
 *
 * Challenges are:
 * - Generated with 32 bytes of cryptographic randomness (base64url-encoded)
 * - Stored in Redis with TTL-based automatic expiration
 * - Single-use: atomically read and deleted during validation (GETDEL)
 * - Typed to prevent cross-ceremony attacks (registration / authentication / upgrade)
 *
 * Redis key format: `passkey:challenge:{type}:{challengeBase64url}`
 *
 * @see libs/accounts/passkey/CHALLENGE_DESIGN.md
 */
@Injectable()
export class PasskeyChallengeManager {
  constructor(
    @Inject(PASSKEY_CHALLENGE_REDIS) private readonly redis: Redis,
    private readonly config: PasskeyConfig,
    @Inject(LOGGER_PROVIDER) private readonly log?: LoggerService
  ) {}

  /**
   * Generates a registration challenge for the WebAuthn attestation ceremony.
   *
   * Used by `POST /mfa/passkeys/registerStart`. Requires MFA JWT; uid is always known.
   *
   * @param input - Must include the hex-encoded uid of the authenticated user.
   * @returns Base64url-encoded 32-byte challenge string.
   */
  async generateRegistrationChallenge(
    input: CreateRegistrationChallengeInput
  ): Promise<string> {
    return this.generateChallenge('registration', input.uid);
  }

  /**
   * Generates an authentication challenge for the WebAuthn assertion ceremony.
   *
   * Used by `POST /passkeys/authenticationStart`. This endpoint is unauthenticated —
   * discoverable credentials identify the user during the ceremony. No uid is available
   * at challenge-generation time.
   *
   * @returns Base64url-encoded 32-byte challenge string.
   */
  async generateAuthenticationChallenge(): Promise<string> {
    return this.generateChallenge('authentication');
  }

  /**
   * Generates an upgrade challenge for the WebAuthn PRF key-wrapping ceremony.
   *
   * Used by `POST /mfa/passkeys/upgradeStart`. Requires MFA JWT; uid is always known.
   * The upgrade ceremony wraps the Sync account key (kB) with the passkey PRF output.
   *
   * @param input - Must include the hex-encoded uid of the authenticated user.
   * @returns Base64url-encoded 32-byte challenge string.
   */
  async generateUpgradeChallenge(
    input: CreateUpgradeChallengeInput
  ): Promise<string> {
    return this.generateChallenge('upgrade', input.uid);
  }

  /**
   * Validates and atomically consumes a challenge from Redis.
   *
   * Uses GETDEL to read and delete the challenge in a single atomic
   * operation, enforcing single-use semantics. Throws domain errors on failure so
   * callers do not need to inspect return values.
   *
   * @param challenge - The base64url-encoded challenge from the WebAuthn ceremony.
   * @param type - The expected challenge type (prevents cross-ceremony attacks).
   * @returns The stored challenge metadata (uid, type, timestamps).
   * @throws PasskeyChallengeNotFoundError - Key does not exist (expired or already consumed).
   * @throws PasskeyChallengeExpiredError - Key found but application-level expiresAt passed.
   */
  async validateChallenge(
    challenge: string,
    type: ChallengeType
  ): Promise<StoredChallenge> {
    const key = this.buildKey(type, challenge);
    const raw = await this.redis.getdel(key);

    if (raw === null) {
      this.log?.warn('passkey.challenge.notFound', { type });
      throw new PasskeyChallengeNotFoundError({ challengeId: challenge });
    }

    const stored: StoredChallenge = JSON.parse(raw);

    if (Date.now() > stored.expiresAt) {
      this.log?.warn('passkey.challenge.expired', { type });
      throw new PasskeyChallengeExpiredError({ challengeId: challenge });
    }

    this.log?.debug?.('passkey.challenge.validated', { type });

    return stored;
  }

  /**
   * Explicitly deletes a challenge from Redis.
   *
   * Intended for error-path cleanup (e.g., when a ceremony fails after the challenge
   * has already been consumed). GETDEL in validateChallenge handles the normal case.
   * This method succeeds silently even if the key does not exist.
   *
   * @param challenge - The base64url-encoded challenge to delete.
   * @param type - The challenge type (used to reconstruct the Redis key).
   */
  async deleteChallenge(challenge: string, type: ChallengeType): Promise<void> {
    const key = this.buildKey(type, challenge);
    await this.redis.del(key);
    this.log?.debug?.('passkey.challenge.deleted', { type });
  }

  private async generateChallenge(
    type: ChallengeType,
    uid?: string
  ): Promise<string> {
    const challenge = randomBytes(32).toString('base64url');
    const now = Date.now();
    const timeout =
      this.config.challengeTimeout ?? DEFAULT_CHALLENGE_TIMEOUT_MS;
    const ttlSeconds = Math.ceil(timeout / 1000);

    const stored: StoredChallenge = {
      challenge,
      type,
      ...(uid !== undefined ? { uid } : {}),
      createdAt: now,
      expiresAt: now + timeout,
    };

    const key = this.buildKey(type, challenge);
    await this.redis.set(key, JSON.stringify(stored), 'EX', ttlSeconds);

    this.log?.debug?.('passkey.challenge.generated', { type, uid });

    return challenge;
  }

  private buildKey(type: ChallengeType, challenge: string): string {
    return `${PASSKEY_CHALLENGE_REDIS_PREFIX}:${type}:${challenge}`;
  }
}
