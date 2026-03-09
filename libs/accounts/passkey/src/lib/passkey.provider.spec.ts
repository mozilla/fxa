/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { LOGGER_PROVIDER } from '@fxa/shared/log';
import { PasskeyConfig } from './passkey.config';
import { PasskeyConfigProvider, RawPasskeyConfig } from './passkey.provider';

const VALID_RAW_CONFIG: RawPasskeyConfig = {
  enabled: true,
  rpId: 'accounts.firefox.com',
  allowedOrigins: ['https://accounts.firefox.com'],
  challengeTimeout: 60000,
  maxPasskeysPerUser: 10,
  userVerification: 'required',
  residentKey: 'required',
  authenticatorAttachment: '',
};

function buildModule(rawPasskeys: unknown) {
  const mockConfigService = {
    get: jest.fn().mockReturnValue(rawPasskeys),
  };
  const mockLogger = {
    error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
  };

  return Test.createTestingModule({
    providers: [
      PasskeyConfigProvider,
      { provide: ConfigService, useValue: mockConfigService },
      { provide: LOGGER_PROVIDER, useValue: mockLogger },
    ],
  })
    .compile()
    .then((module: TestingModule) => ({
      config: module.get(PasskeyConfig),
      logger: mockLogger,
    }));
}

describe('PasskeyConfigProvider', () => {
  describe('when passkeys.enabled is false', () => {
    it('returns null without validation', async () => {
      const { config } = await buildModule({ enabled: false });
      expect(config).toBeNull();
    });
  });

  describe('when config is valid', () => {
    it('returns a PasskeyConfig instance', async () => {
      const { config } = await buildModule(VALID_RAW_CONFIG);
      expect(config).toBeInstanceOf(PasskeyConfig);
    });

    it('copies all fields correctly', async () => {
      const { config } = await buildModule(VALID_RAW_CONFIG);
      expect(config!.rpId).toBe('accounts.firefox.com');
      expect(config!.allowedOrigins).toEqual(['https://accounts.firefox.com']);
      expect(config!.challengeTimeout).toBe(60000);
      expect(config!.maxPasskeysPerUser).toBe(10);
      expect(config!.userVerification).toBe('required');
      expect(config!.residentKey).toBe('required');
    });

    it('maps authenticatorAttachment null to undefined', async () => {
      const { config } = await buildModule(VALID_RAW_CONFIG);
      expect(config!.authenticatorAttachment).toBeUndefined();
    });

    it('does not log an error', async () => {
      const { logger } = await buildModule(VALID_RAW_CONFIG);
      expect(logger.error).not.toHaveBeenCalled();
    });
  });

  describe('when config is invalid', () => {
    it('returns null', async () => {
      const { config } = await buildModule({
        ...VALID_RAW_CONFIG,
        rpId: '',
        allowedOrigins: ['not-a-valid-origin'],
      });
      expect(config).toBeNull();
    });

    it('logs an error with the validation message', async () => {
      const { logger } = await buildModule({
        ...VALID_RAW_CONFIG,
        allowedOrigins: ['not-a-valid-origin'],
      });
      expect(logger.error).toHaveBeenCalledWith(
        'passkey.config.invalid',
        expect.objectContaining({
          message: expect.stringContaining(
            'Passkeys disabled due to malformed config'
          ),
        })
      );
    });

    it('rejects allowedOrigins with trailing path', async () => {
      const { config, logger } = await buildModule({
        ...VALID_RAW_CONFIG,
        allowedOrigins: ['https://accounts.firefox.com/path'],
      });
      expect(config).toBeNull();
      expect(logger.error).toHaveBeenCalled();
    });

    it('rejects empty allowedOrigins array', async () => {
      const { config, logger } = await buildModule({
        ...VALID_RAW_CONFIG,
        allowedOrigins: [],
      });
      expect(config).toBeNull();
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
