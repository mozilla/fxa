/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { PasskeyChallengeManager } from './passkey.challenge.manager';
import { PasskeyConfig } from './passkey.config';
import {
  PASSKEY_CHALLENGE_REDIS_PREFIX,
  StoredChallenge,
} from './passkey.challenge';
import {
  PasskeyChallengeNotFoundError,
  PasskeyChallengeExpiredError,
} from './passkey.errors';

const mockRedis = {
  set: jest.fn(),
  getdel: jest.fn(),
  del: jest.fn(),
};

jest.mock('crypto', () => ({
  randomBytes: jest.fn((size: number) => Buffer.alloc(size, 0xab)),
}));

// should be the same as the value returned by the mocked randomBytes above
// however, if we change the size in implementation then this will fall out of sync
const MOCK_CHALLENGE = Buffer.alloc(32, 0xab).toString('base64url');

function makeConfig(overrides: Partial<PasskeyConfig> = {}): PasskeyConfig {
  // configs will be built using convict in a coming PR, update this when
  // https://mozilla-hub.atlassian.net/browse/FXA-13057 lands
  const config = new PasskeyConfig();
  config.rpId = 'accounts.firefox.com';
  config.rpName = 'Mozilla Accounts';
  config.allowedOrigins = ['https://accounts.firefox.com'];
  config.challengeTimeout = 1000 * 60 * 5; // 5 minutes
  Object.assign(config, overrides);
  return config;
}

describe('PasskeyChallengeManager', () => {
  let manager: PasskeyChallengeManager;
  let config: PasskeyConfig;

  beforeEach(() => {
    jest.clearAllMocks();
    config = makeConfig();
    manager = new PasskeyChallengeManager(mockRedis as any, config);
  });

  describe('generateRegistrationChallenge', () => {
    it('returns a base64url-encoded challenge string', async () => {
      mockRedis.set.mockResolvedValue('OK');
      const result = await manager.generateRegistrationChallenge({
        uid: 'deadbeef',
      });

      expect(result).toBe(MOCK_CHALLENGE);
    });

    it('stores the challenge in Redis with the correct key format', async () => {
      mockRedis.set.mockResolvedValue('OK');
      await manager.generateRegistrationChallenge({ uid: 'deadbeef' });

      const expectedKey = `${PASSKEY_CHALLENGE_REDIS_PREFIX}:registration:${MOCK_CHALLENGE}`;
      expect(mockRedis.set).toHaveBeenCalledWith(
        expectedKey,
        expect.any(String),
        'EX',
        expect.any(Number)
      );
    });

    it('stores the challenge with the correct TTL in seconds', async () => {
      mockRedis.set.mockResolvedValue('OK');
      await manager.generateRegistrationChallenge({ uid: 'deadbeef' });

      const [, , , ttl] = mockRedis.set.mock.calls[0];
      // TODO, once convit config changes land, this will be simplier and not require the fallback logic
      // update this and other tests that reference the config
      expect(ttl).toBe((config.challengeTimeout ?? 3_000) / 1000);
    });

    it('stores a payload with uid, type=registration, createdAt, and expiresAt', async () => {
      const fakeNow = 1_700_000_000_000;
      const dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(fakeNow);

      mockRedis.set.mockResolvedValue('OK');
      await manager.generateRegistrationChallenge({ uid: 'deadbeef' });

      dateNowSpy.mockRestore();

      const [, rawJson] = mockRedis.set.mock.calls[0];
      const stored: StoredChallenge = JSON.parse(rawJson);

      expect(stored.challenge).toBe(MOCK_CHALLENGE);
      expect(stored.type).toBe('registration');
      expect(stored.uid).toBe('deadbeef');
      expect(stored.createdAt).toBe(fakeNow);
      expect(stored.expiresAt).toBe(
        fakeNow + (config.challengeTimeout ?? 3_000)
      );
    });

    it('throws if redis.set rejects', async () => {
      mockRedis.set.mockRejectedValue(new Error('Redis connection lost'));
      await expect(
        manager.generateRegistrationChallenge({ uid: 'deadbeef' })
      ).rejects.toThrow('Redis connection lost');
    });
  });

  describe('generateAuthenticationChallenge', () => {
    it('returns a base64url-encoded challenge string', async () => {
      mockRedis.set.mockResolvedValue('OK');
      const result = await manager.generateAuthenticationChallenge();

      expect(result).toBe(MOCK_CHALLENGE);
    });

    it('stores the challenge with type=authentication and no uid', async () => {
      mockRedis.set.mockResolvedValue('OK');
      await manager.generateAuthenticationChallenge();

      const [key, rawJson, , ttl] = mockRedis.set.mock.calls[0];
      const stored: StoredChallenge = JSON.parse(rawJson);

      expect(key).toBe(
        `${PASSKEY_CHALLENGE_REDIS_PREFIX}:authentication:${MOCK_CHALLENGE}`
      );
      expect(stored.type).toBe('authentication');
      expect(stored.uid).toBeUndefined();
      expect(ttl).toBe((config.challengeTimeout ?? 3_000) / 1000);
    });
  });

  describe('generateUpgradeChallenge', () => {
    it('returns a base64url-encoded challenge string', async () => {
      mockRedis.set.mockResolvedValue('OK');
      const result = await manager.generateUpgradeChallenge({
        uid: 'cafebabe',
      });
      expect(result).toBe(MOCK_CHALLENGE);
    });

    it('stores the challenge with type=upgrade and uid', async () => {
      mockRedis.set.mockResolvedValue('OK');
      await manager.generateUpgradeChallenge({ uid: 'cafebabe' });

      const [key, rawJson] = mockRedis.set.mock.calls[0];
      const stored: StoredChallenge = JSON.parse(rawJson);

      expect(key).toBe(
        `${PASSKEY_CHALLENGE_REDIS_PREFIX}:upgrade:${MOCK_CHALLENGE}`
      );
      expect(stored.type).toBe('upgrade');
      expect(stored.uid).toBe('cafebabe');
    });
  });

  describe('validateChallenge', () => {
    const FAKE_NOW = 1_700_000_000_000;
    let dateNowSpy: jest.SpyInstance;

    beforeEach(() => {
      dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(FAKE_NOW);
    });

    afterEach(() => {
      dateNowSpy.mockRestore();
    });

    function makeStored(
      overrides: Partial<StoredChallenge> = {}
    ): StoredChallenge {
      return {
        challenge: MOCK_CHALLENGE,
        type: 'registration',
        uid: 'deadbeef',
        createdAt: FAKE_NOW - 1000,
        expiresAt: FAKE_NOW + 299_000,
        ...overrides,
      };
    }

    it('returns StoredChallenge for a valid, non-expired challenge', async () => {
      const stored = makeStored();
      mockRedis.getdel.mockResolvedValue(JSON.stringify(stored));

      const result = await manager.validateChallenge(
        MOCK_CHALLENGE,
        'registration'
      );

      expect(result).toEqual(stored);
    });

    it('throws PasskeyChallengeNotFoundError when GETDEL returns null', async () => {
      mockRedis.getdel.mockResolvedValue(null);

      await expect(
        manager.validateChallenge(MOCK_CHALLENGE, 'registration')
      ).rejects.toBeInstanceOf(PasskeyChallengeNotFoundError);
    });

    it('throws PasskeyChallengeExpiredError when expiresAt is in the past', async () => {
      const expired = makeStored({ expiresAt: FAKE_NOW - 1 });
      mockRedis.getdel.mockResolvedValue(JSON.stringify(expired));

      await expect(
        manager.validateChallenge(MOCK_CHALLENGE, 'registration')
      ).rejects.toBeInstanceOf(PasskeyChallengeExpiredError);
    });

    it('uses GETDEL for atomic read-and-delete (single call, not GET + DEL)', async () => {
      const stored = makeStored();
      mockRedis.getdel.mockResolvedValue(JSON.stringify(stored));

      await manager.validateChallenge(MOCK_CHALLENGE, 'registration');

      expect(mockRedis.getdel).toHaveBeenCalledTimes(1);
      expect(mockRedis.del).not.toHaveBeenCalled();
    });

    it('calls GETDEL with the correct Redis key', async () => {
      const stored = makeStored({ type: 'authentication', uid: undefined });
      mockRedis.getdel.mockResolvedValue(JSON.stringify(stored));

      await manager.validateChallenge(MOCK_CHALLENGE, 'authentication');

      expect(mockRedis.getdel).toHaveBeenCalledWith(
        `${PASSKEY_CHALLENGE_REDIS_PREFIX}:authentication:${MOCK_CHALLENGE}`
      );
    });
  });

  describe('deleteChallenge', () => {
    it('calls redis.del with the correct key', async () => {
      mockRedis.del.mockResolvedValue(1);
      await manager.deleteChallenge(MOCK_CHALLENGE, 'registration');

      expect(mockRedis.del).toHaveBeenCalledWith(
        `${PASSKEY_CHALLENGE_REDIS_PREFIX}:registration:${MOCK_CHALLENGE}`
      );
    });

    it('does not throw when the key does not exist (del returns 0)', async () => {
      mockRedis.del.mockResolvedValue(0);
      await expect(
        manager.deleteChallenge(MOCK_CHALLENGE, 'authentication')
      ).resolves.toBeUndefined();
    });
  });

  describe('challengeTimeout fallback', () => {
    // this test will eventually go away when config updates land
    it('uses 300 seconds when challengeTimeout is not configured', async () => {
      mockRedis.set.mockResolvedValue('OK');
      const cfgNoTimeout = makeConfig({ challengeTimeout: undefined });
      const mgr = new PasskeyChallengeManager(mockRedis as any, cfgNoTimeout);

      await mgr.generateAuthenticationChallenge();

      const [, , , ttl] = mockRedis.set.mock.calls[0];
      expect(ttl).toBe(300);
    });
  });
});
