/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';
import Redis from 'ioredis';
import { LOGGER_PROVIDER } from '@fxa/shared/log';

import {
  PasskeyChallengeManager,
  PASSKEY_CHALLENGE_REDIS,
} from './passkey.challenge.manager';
import { PasskeyConfig } from './passkey.config';
import {
  PASSKEY_CHALLENGE_REDIS_PREFIX,
  StoredChallenge,
} from './passkey.challenge';
import { PasskeyChallengeNotFoundError } from './passkey.errors';

const mockLogger = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

let redis: Redis.Redis;
let manager: PasskeyChallengeManager;
let config: PasskeyConfig;

async function clearChallengeKeys() {
  const keys = await redis.keys(`${PASSKEY_CHALLENGE_REDIS_PREFIX}:*`);
  if (keys.length > 0) {
    await redis.del(keys);
  }
}

beforeAll(async () => {
  redis = new Redis({ host: 'localhost' });

  config = new PasskeyConfig();
  config.rpId = 'localhost';
  config.rpName = 'Test';
  config.allowedOrigins = ['http://localhost'];
  config.challengeTimeout = 1000 * 60 * 5; // 5 minutes

  await clearChallengeKeys();

  const moduleRef = await Test.createTestingModule({
    providers: [
      PasskeyChallengeManager,
      { provide: PASSKEY_CHALLENGE_REDIS, useValue: redis },
      { provide: PasskeyConfig, useValue: config },
      { provide: LOGGER_PROVIDER, useValue: mockLogger },
    ],
  }).compile();

  manager = moduleRef.get(PasskeyChallengeManager);
});

afterAll(async () => {
  await clearChallengeKeys();
  await redis.quit();
});

describe('PasskeyChallengeManager (integration)', () => {
  describe('generateRegistrationChallenge', () => {
    it('stores key in Redis with correct prefix and type', async () => {
      const challenge = await manager.generateRegistrationChallenge({
        uid: 'deadbeef',
      });

      const key = `${PASSKEY_CHALLENGE_REDIS_PREFIX}:registration:${challenge}`;
      const raw = await redis.get(key);
      expect(raw).not.toBeNull();
    });

    it('stored value contains uid, type, challenge, createdAt, expiresAt', async () => {
      const challenge = await manager.generateRegistrationChallenge({
        uid: 'deadbeef',
      });

      const key = `${PASSKEY_CHALLENGE_REDIS_PREFIX}:registration:${challenge}`;
      const raw = await redis.get(key);
      const stored: StoredChallenge = JSON.parse(raw ?? '{}');

      expect(stored.challenge).toBe(challenge);
      expect(stored.type).toBe('registration');
      expect(stored.uid).toBe('deadbeef');
      expect(typeof stored.createdAt).toBe('number');
      expect(typeof stored.expiresAt).toBe('number');
      expect(stored.expiresAt).toBeGreaterThanOrEqual(
        stored.createdAt + (config.challengeTimeout ?? 3_000) - 1000
      );
    });

    it('key has a positive TTL set', async () => {
      const challenge = await manager.generateRegistrationChallenge({
        uid: 'deadbeef',
      });

      const key = `${PASSKEY_CHALLENGE_REDIS_PREFIX}:registration:${challenge}`;
      const ttl = await redis.ttl(key);
      expect(ttl).toBeGreaterThan(0);
    });
  });

  describe('generateAuthenticationChallenge', () => {
    it('stores challenge with no uid and type=authentication', async () => {
      const challenge = await manager.generateAuthenticationChallenge();

      const key = `${PASSKEY_CHALLENGE_REDIS_PREFIX}:authentication:${challenge}`;
      const raw = await redis.get(key);
      const stored: StoredChallenge = JSON.parse(raw ?? '{}');

      expect(stored.type).toBe('authentication');
      expect(stored.uid).toBeUndefined();
    });
  });

  describe('generateUpgradeChallenge', () => {
    it('stores challenge with uid and type=upgrade', async () => {
      const challenge = await manager.generateUpgradeChallenge({
        uid: 'cafebabe',
      });

      const key = `${PASSKEY_CHALLENGE_REDIS_PREFIX}:upgrade:${challenge}`;
      const raw = await redis.get(key);
      const stored: StoredChallenge = JSON.parse(raw ?? '{}');

      expect(stored.type).toBe('upgrade');
      expect(stored.uid).toBe('cafebabe');
    });
  });

  describe('validateChallenge', () => {
    it('returns StoredChallenge and deletes the key (single-use)', async () => {
      const challenge = await manager.generateRegistrationChallenge({
        uid: 'deadbeef',
      });
      const key = `${PASSKEY_CHALLENGE_REDIS_PREFIX}:registration:${challenge}`;

      const result = await manager.validateChallenge(challenge, 'registration');

      expect(result.challenge).toBe(challenge);
      expect(result.type).toBe('registration');
      expect(result.uid).toBe('deadbeef');

      // Key must be gone after GETDEL
      const exists = await redis.exists(key);
      expect(exists).toBe(0);
    });

    it('throws PasskeyChallengeNotFoundError on second validate (single-use enforcement)', async () => {
      const challenge = await manager.generateRegistrationChallenge({
        uid: 'deadbeef',
      });

      await manager.validateChallenge(challenge, 'registration');

      await expect(
        manager.validateChallenge(challenge, 'registration')
      ).rejects.toBeInstanceOf(PasskeyChallengeNotFoundError);
    });

    it('throws PasskeyChallengeNotFoundError for an unknown challenge', async () => {
      await expect(
        manager.validateChallenge('nonexistent-challenge', 'registration')
      ).rejects.toBeInstanceOf(PasskeyChallengeNotFoundError);
    });
  });

  describe('TTL expiry', () => {
    it('challenge is gone from Redis after the TTL elapses', async () => {
      const shortConfig = new PasskeyConfig();
      shortConfig.rpId = 'localhost';
      shortConfig.rpName = 'Test';
      shortConfig.allowedOrigins = ['http://localhost'];
      shortConfig.challengeTimeout = 1000;

      const moduleRef = await Test.createTestingModule({
        providers: [
          PasskeyChallengeManager,
          { provide: PASSKEY_CHALLENGE_REDIS, useValue: redis },
          { provide: PasskeyConfig, useValue: shortConfig },
          { provide: LOGGER_PROVIDER, useValue: mockLogger },
        ],
      }).compile();

      const shortManager = moduleRef.get(PasskeyChallengeManager);
      const challenge = await shortManager.generateRegistrationChallenge({
        uid: 'deadbeef',
      });

      await new Promise((resolve) => setTimeout(resolve, 1100));

      await expect(
        shortManager.validateChallenge(challenge, 'registration')
      ).rejects.toBeInstanceOf(PasskeyChallengeNotFoundError);
    }, 10_000);
  });

  describe('deleteChallenge', () => {
    it('removes the key from Redis', async () => {
      const challenge = await manager.generateRegistrationChallenge({
        uid: 'deadbeef',
      });
      const key = `${PASSKEY_CHALLENGE_REDIS_PREFIX}:registration:${challenge}`;

      await manager.deleteChallenge(challenge, 'registration');

      const ttl = await redis.ttl(key);
      expect(ttl).toBe(-2); // -2 means key does not exist
    });

    it('does not throw when the key does not exist', async () => {
      await expect(
        manager.deleteChallenge('nonexistent-challenge', 'registration')
      ).resolves.toBeUndefined();
    });
  });
});
