/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LOGGER_PROVIDER } from '@fxa/shared/log';
import Redis from 'ioredis';
import { PasskeyConfig } from './passkey.config';
import { validateSync } from 'class-validator';
import type {
  AuthenticatorAttachment,
  ResidentKeyRequirement,
  UserVerificationRequirement,
} from '@simplewebauthn/server';

/**
 * Raw passkey configuration.
 *
 * Mirrors the passkeys section of the for general configurations.
 * An empty string for `authenticatorAttachment` is normalized to `undefined`
 * by {@link buildPasskeyConfig} because Convict cannot represent `undefined`
 * in JSON config files.
 */
export type RawPasskeyConfig = {
  enabled: boolean;
  rpId: string;
  allowedOrigins: string[];
  challengeTimeout: number;
  maxPasskeysPerUser: number;
  userVerification: UserVerificationRequirement;
  residentKey: ResidentKeyRequirement;
  /** Empty string is treated as "no preference" and normalized to `undefined`. */
  authenticatorAttachment: AuthenticatorAttachment | '';
};

/**
 * Builds and validates a {@link PasskeyConfig} from raw Convict values.
 *
 * Normalizes `authenticatorAttachment`: an empty string (the Convict
 * no-preference sentinel) is converted to `undefined` so that the
 * WebAuthn library omits the field from registration options entirely.
 *
 * @param raw - Raw config values read from Convict.
 * @returns A fully validated {@link PasskeyConfig} instance.
 * @throws {Error} If any field fails class-validator constraints, with a
 *   human-readable list of all validation errors.
 */
export function buildPasskeyConfig(raw: RawPasskeyConfig): PasskeyConfig {
  const passkeyConfig = new PasskeyConfig({
    ...raw,
    authenticatorAttachment: raw.authenticatorAttachment || undefined,
  });

  const errors = validateSync(passkeyConfig, {
    skipMissingProperties: false,
  });
  if (errors.length > 0) {
    const message = errors.map((e) => e.toString()).join('\n');
    throw new Error(`Malformed passkey config:\n${message}`);
  }
  return passkeyConfig;
}

/** NestJS injection token for the passkey-specific Redis client. */
export const PASSKEY_CHALLENGE_REDIS = 'PasskeyChallengeRedis';

/**
 * NestJS provider that creates a dedicated Redis client for passkey challenge
 * storage. The client is configured by merging the base `redis` config with
 * the `redis.passkey` override, allowing a separate DB index or host.
 */
export const PasskeyChallengeRedisProvider = {
  provide: PASSKEY_CHALLENGE_REDIS,
  useFactory: (config: ConfigService) => {
    const baseRedisConfig = config.get('redis');
    const passkeyRedisConfig = config.get('redis.passkey');
    return new Redis({
      ...baseRedisConfig,
      ...passkeyRedisConfig,
    });
  },
  inject: [ConfigService],
};

/**
 * NestJS provider that reads, validates, and exposes the {@link PasskeyConfig}
 * for injection throughout the passkey module.
 *
 * Returns `null` (and logs an error) when the `passkeys` config key is absent,
 * allowing dependent services to treat passkeys as disabled rather than
 * throwing at startup.
 */
export const PasskeyConfigProvider = {
  provide: PasskeyConfig,
  useFactory: (config: ConfigService, log: LoggerService) => {
    const rawConfig = config.get('passkeys');
    if (!rawConfig) {
      log.error('passkey.config.missing', {
        message: 'Passkeys disabled due to missing config',
      });
      return null;
    }
    return buildPasskeyConfig(rawConfig as RawPasskeyConfig);
  },
  inject: [ConfigService, LOGGER_PROVIDER],
};
