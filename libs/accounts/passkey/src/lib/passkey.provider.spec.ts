/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { LOGGER_PROVIDER } from '@fxa/shared/log';
import { PasskeyConfig } from './passkey.config';
import {
  PASSKEY_CHALLENGE_REDIS,
  PasskeyChallengeRedisProvider,
  PasskeyConfigProvider,
  RawPasskeyConfig,
} from './passkey.provider';
import Redis from 'ioredis';

const VALID_RAW_CONFIG: RawPasskeyConfig = {
  enabled: true,
  rpId: 'accounts.firefox.com',
  allowedOrigins: ['https://accounts.firefox.com'],
  maxPasskeysPerUser: 10,
  challengeTimeout: 30_000,
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

jest.mock('ioredis');
const MockRedis = Redis as jest.MockedClass<typeof Redis>;

describe('PasskeyChallengeRedisProvider', () => {
  const BASE_REDIS = { host: 'localhost', port: 6379 };
  const PASSKEY_REDIS_OVERRIDE = { db: 2 };

  async function buildRedisModule(baseRedis: unknown, passkeyRedis: unknown) {
    const mockConfigService = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'redis') return baseRedis;
        if (key === 'redis.passkey') return passkeyRedis;
        return null;
      }),
    };
    const m = await Test.createTestingModule({
      providers: [
        PasskeyChallengeRedisProvider,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();
    return m.get(PASSKEY_CHALLENGE_REDIS);
  }

  it('constructs Redis with base config merged with passkey overrides', async () => {
    await buildRedisModule(BASE_REDIS, PASSKEY_REDIS_OVERRIDE);
    expect(MockRedis).toHaveBeenCalledWith({
      ...BASE_REDIS,
      ...PASSKEY_REDIS_OVERRIDE,
    });
  });

  it('constructs Redis with only base config when no passkey override present', async () => {
    await buildRedisModule(BASE_REDIS, null);
    expect(MockRedis).toHaveBeenCalledWith({ ...BASE_REDIS });
  });
});

describe('PasskeyConfigProvider', () => {
  describe('when config is valid', () => {
    it('returns a PasskeyConfig instance', async () => {
      const { config } = await buildModule(VALID_RAW_CONFIG);
      expect(config).toBeInstanceOf(PasskeyConfig);
    });

    it('copies all fields correctly', async () => {
      const { config } = await buildModule(VALID_RAW_CONFIG);
      expect(config!.rpId).toBe('accounts.firefox.com');
      expect(config!.allowedOrigins).toEqual(['https://accounts.firefox.com']);
      expect(config!.challengeTimeout).toBe(30_000);
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
    it('throws', async () => {
      await expect(() =>
        buildModule({
          ...VALID_RAW_CONFIG,
          rpId: '',
        })
      ).rejects.toThrow('property rpId has failed the following constraints');
    });

    it('rejects allowedOrigins with trailing path', async () => {
      await expect(() =>
        buildModule({
          ...VALID_RAW_CONFIG,
          allowedOrigins: 'not-a-valid-origin',
        })
      ).rejects.toThrow(
        'property allowedOrigins has failed the following constraints'
      );
    });

    it('rejects allowedOrigins with trailing path', async () => {
      await expect(() =>
        buildModule({
          ...VALID_RAW_CONFIG,
          allowedOrigins: ['https://accounts.firefox.com/path'],
        })
      ).rejects.toThrow(
        'property allowedOrigins has failed the following constraints'
      );
    });

    it('rejects empty allowedOrigins array', async () => {
      await expect(() =>
        buildModule({
          ...VALID_RAW_CONFIG,
          allowedOrigins: [],
        })
      ).rejects.toThrow(
        'property allowedOrigins has failed the following constraints'
      );
    });
  });
});
