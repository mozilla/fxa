/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LOGGER_PROVIDER } from '@fxa/shared/log';
import { PasskeyConfig } from './passkey.config';
import { validateSync } from 'class-validator';
import type {
  AuthenticatorAttachment,
  ResidentKeyRequirement,
  UserVerificationRequirement,
} from '@simplewebauthn/server';

export type RawPasskeyConfig = {
  enabled: boolean;
  rpId: string;
  rpName: string;
  allowedOrigins: string[];
  challengeTimeout: number;
  maxPasskeysPerUser: number;
  userVerification: UserVerificationRequirement;
  residentKey: ResidentKeyRequirement;
  authenticatorAttachment: AuthenticatorAttachment | null;
};

export function buildPasskeyConfig(
  raw: RawPasskeyConfig,
  log: Pick<LoggerService, 'error'>
): PasskeyConfig {
  if (raw.enabled === false) {
    return { enabled: false } as PasskeyConfig;
  }

  const mapped = {
    ...raw,
    rpName: raw.rpName || raw.rpId,
    authenticatorAttachment:
      raw.authenticatorAttachment === null
        ? undefined
        : raw.authenticatorAttachment,
  };

  const passkeyConfig = Object.assign(new PasskeyConfig(), mapped);
  const errors = validateSync(passkeyConfig, {
    skipMissingProperties: false,
  });
  if (errors.length > 0) {
    const message = errors.map((e) => e.toString()).join('\n');
    log.error('passkey.config.invalid', {
      message: `Passkeys disabled due to malformed config:\n${message}`,
    });
    return { enabled: false } as PasskeyConfig;
  }
  return passkeyConfig;
}

export const PasskeyConfigProvider = {
  provide: PasskeyConfig,
  useFactory: (config: ConfigService, log: LoggerService) => {
    const rawConfig = config.get('passkeys');
    if (!rawConfig) {
      log.error('passkey.config.missing', {
        message: 'Passkeys disabled due to missing config',
      });
      return { enabled: false } as PasskeyConfig;
    }
    return buildPasskeyConfig(rawConfig as RawPasskeyConfig, log);
  },
  inject: [ConfigService, LOGGER_PROVIDER],
};
