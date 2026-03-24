/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';
import Redis from 'ioredis';
import { LOGGER_PROVIDER } from '@fxa/shared/log';
import { StatsDService } from '@fxa/shared/metrics/statsd';

import { PasskeyChallengeManager } from './passkey.challenge.manager';
import { PasskeyConfig } from './passkey.config';
import { PASSKEY_CHALLENGE_REDIS } from './passkey.provider';

const mockLogger = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

const mockStatsd = { increment: jest.fn() };

let redis: Redis.Redis;
let manager: PasskeyChallengeManager;
let config: PasskeyConfig;

const buildTestModule = async (
  redis: Redis.Redis,
  config: PasskeyConfig,
  logger: typeof mockLogger
) => {
  return await Test.createTestingModule({
    providers: [
      PasskeyChallengeManager,
      { provide: PASSKEY_CHALLENGE_REDIS, useValue: redis },
      { provide: PasskeyConfig, useValue: config },
      { provide: LOGGER_PROVIDER, useValue: logger },
      { provide: StatsDService, useValue: mockStatsd },
    ],
  }).compile();
};

async function clearChallengeKeys() {
  const keys = await redis.keys('passkey:challenge:*');
  if (keys.length > 0) {
    await redis.del(keys);
  }
}

beforeAll(async () => {
  redis = new Redis({ host: 'localhost' });

  config = new PasskeyConfig();
  config.rpId = 'localhost';
  config.allowedOrigins = ['http://localhost'];
  config.challengeTimeout = 1000 * 60 * 5; // 5 minutes

  const moduleRef = await buildTestModule(redis, config, mockLogger);

  manager = moduleRef.get(PasskeyChallengeManager);
});

beforeEach(async () => {
  await clearChallengeKeys();
});

afterAll(async () => {
  await clearChallengeKeys();
  await redis.quit();
});

describe('PasskeyChallengeManager (integration)', () => {
  describe('generateRegistrationChallenge', () => {
    it('stores challenge with uid and type=registration', async () => {
      const challenge = await manager.generateRegistrationChallenge('deadbeef');

      const stored = await manager.consumeRegistrationChallenge(
        challenge,
        'deadbeef'
      );

      expect(stored?.challenge).toBe(challenge);
      expect(stored?.type).toBe('registration');
      expect(stored?.uid).toBe('deadbeef');
    });
  });

  describe('generateAuthenticationChallenge', () => {
    it('stores challenge with no uid and type=authentication', async () => {
      const challenge = await manager.generateAuthenticationChallenge();

      const stored = await manager.consumeAuthenticationChallenge(challenge);

      expect(stored?.challenge).toBe(challenge);
      expect(stored?.type).toBe('authentication');
      expect(stored?.uid).toBeUndefined();
    });
  });

  describe('generateUpgradeChallenge', () => {
    it('stores challenge with uid and type=upgrade', async () => {
      const challenge = await manager.generateUpgradeChallenge('cafebabe');

      const stored = await manager.consumeUpgradeChallenge(
        challenge,
        'cafebabe'
      );

      expect(stored?.challenge).toBe(challenge);
      expect(stored?.type).toBe('upgrade');
      expect(stored?.uid).toBe('cafebabe');
    });
  });

  describe('consumeChallenge', () => {
    it('returns null on second consume (single-use enforcement)', async () => {
      const challenge = await manager.generateRegistrationChallenge('deadbeef');

      await manager.consumeRegistrationChallenge(challenge, 'deadbeef');

      const secondAttempt = await manager.consumeRegistrationChallenge(
        challenge,
        'deadbeef'
      );
      expect(secondAttempt).toBeNull();
    });

    it('returns null for an unknown challenge', async () => {
      const result = await manager.consumeRegistrationChallenge(
        'nonexistent-challenge',
        'deadbeef'
      );
      expect(result).toBeNull();
    });
  });

  describe('TTL expiry', () => {
    it('challenge is gone from Redis after the TTL elapses', async () => {
      const shortConfig = new PasskeyConfig();
      shortConfig.rpId = 'localhost';
      shortConfig.allowedOrigins = ['http://localhost'];
      shortConfig.challengeTimeout = 1000;

      const moduleRef = await buildTestModule(redis, shortConfig, mockLogger);

      const shortManager = moduleRef.get(PasskeyChallengeManager);
      const challenge =
        await shortManager.generateRegistrationChallenge('deadbeef');

      // Wait longer than the TTL to ensure the challenge expires
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const result = await shortManager.consumeRegistrationChallenge(
        challenge,
        'deadbeef'
      );
      expect(result).toBeNull();
    }, 5_000);
  });

  describe('deleteChallenge', () => {
    it('removes the key from Redis', async () => {
      const challenge = await manager.generateRegistrationChallenge('deadbeef');

      await manager.deleteChallenge('registration', challenge, 'deadbeef');

      const result = await manager.consumeRegistrationChallenge(
        challenge,
        'deadbeef'
      );

      expect(result).toBeNull();
    });

    it('does not throw when the key does not exist', async () => {
      const result = await manager.deleteChallenge(
        'registration',
        'nonexistent-challenge',
        'deadbeef'
      );
      expect(result).toBeUndefined();
    });
  });
});
