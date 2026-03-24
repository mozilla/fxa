/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  PasskeyChallengeManager,
  StoredChallenge,
} from './passkey.challenge.manager';
import { PasskeyConfig } from './passkey.config';

const mockRedis = {
  set: jest.fn(),
  getdel: jest.fn(),
  del: jest.fn(),
};

const mockStatsd = { increment: jest.fn() };

jest.mock('crypto', () => ({
  randomBytes: jest.fn((size: number) => Buffer.alloc(size, 0xab)),
}));

// should be the same as the value returned by the mocked randomBytes above
// however, if we change the size in implementation then this will fall out of sync
const MOCK_CHALLENGE = Buffer.alloc(32, 0xab).toString('base64url');

// Matches the config default (passkeys.challengeTimeout = 300,000 ms)
const CHALLENGE_TIMEOUT_MS = 1000 * 60 * 5;

function makeConfig(overrides: Partial<PasskeyConfig> = {}): PasskeyConfig {
  const config = new PasskeyConfig();
  config.rpId = 'accounts.firefox.com';
  config.allowedOrigins = ['https://accounts.firefox.com'];
  config.challengeTimeout = CHALLENGE_TIMEOUT_MS;
  Object.assign(config, overrides);
  return config;
}

describe('PasskeyChallengeManager', () => {
  let manager: PasskeyChallengeManager;
  let config: PasskeyConfig;

  beforeEach(() => {
    jest.clearAllMocks();
    config = makeConfig();
    manager = new PasskeyChallengeManager(
      mockRedis as any,
      config,
      undefined,
      mockStatsd as any
    );
  });

  describe('generateRegistrationChallenge', () => {
    it('returns a base64url-encoded challenge string', async () => {
      mockRedis.set.mockResolvedValue('OK');
      const result = await manager.generateRegistrationChallenge('deadbeef');

      expect(result).toBe(MOCK_CHALLENGE);
    });

    it('calls redis.set with the correct key and TTL', async () => {
      mockRedis.set.mockResolvedValue('OK');
      await manager.generateRegistrationChallenge('deadbeef');

      expect(mockRedis.set).toHaveBeenCalledWith(
        `passkey:challenge:registration:${MOCK_CHALLENGE}:deadbeef`,
        expect.any(String),
        'EX',
        CHALLENGE_TIMEOUT_MS / 1000
      );
    });

    it('increments statsd counter for generated challenges', async () => {
      mockRedis.set.mockResolvedValue('OK');
      await manager.generateRegistrationChallenge('deadbeef');

      expect(mockStatsd.increment).toHaveBeenCalledWith(
        'passkey.challenge.generated',
        { type: 'registration' }
      );
    });

    it('stores a payload with uid, type=registration, createdAt, and expiresAt', async () => {
      const fakeNow = 1_700_000_000_000;
      const dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(fakeNow);

      mockRedis.set.mockResolvedValue('OK');
      await manager.generateRegistrationChallenge('deadbeef');

      dateNowSpy.mockRestore();

      const [, rawJson] = mockRedis.set.mock.calls[0];
      const stored: StoredChallenge = JSON.parse(rawJson);

      expect(stored.challenge).toBe(MOCK_CHALLENGE);
      expect(stored.type).toBe('registration');
      expect(stored.uid).toBe('deadbeef');
      expect(stored.createdAt).toBe(fakeNow);
      expect(stored.expiresAt).toBe(fakeNow + CHALLENGE_TIMEOUT_MS);
    });

    it('throws if redis.set rejects', async () => {
      mockRedis.set.mockRejectedValue(new Error('Redis connection lost'));
      await expect(
        manager.generateRegistrationChallenge('deadbeef')
      ).rejects.toThrow('Redis connection lost');
    });
  });

  describe('generateAuthenticationChallenge', () => {
    it('stores the challenge with type=authentication and no uid', async () => {
      mockRedis.set.mockResolvedValue('OK');
      await manager.generateAuthenticationChallenge();

      const [key, rawJson] = mockRedis.set.mock.calls[0];
      const stored: StoredChallenge = JSON.parse(rawJson);

      expect(key).toBe(`passkey:challenge:authentication:${MOCK_CHALLENGE}`);
      expect(stored.type).toBe('authentication');
      expect(stored.uid).toBeUndefined();
    });
  });

  describe('generateUpgradeChallenge', () => {
    it('stores the challenge with type=upgrade and uid', async () => {
      mockRedis.set.mockResolvedValue('OK');
      await manager.generateUpgradeChallenge('cafebabe');

      const [key, rawJson] = mockRedis.set.mock.calls[0];
      const stored: StoredChallenge = JSON.parse(rawJson);

      expect(key).toBe(`passkey:challenge:upgrade:${MOCK_CHALLENGE}:cafebabe`);
      expect(stored.type).toBe('upgrade');
      expect(stored.uid).toBe('cafebabe');
    });
  });

  describe('consumeChallenge', () => {
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

    it('returns StoredChallenge and increments statsd for a valid challenge', async () => {
      const stored = makeStored();
      mockRedis.getdel.mockResolvedValue(JSON.stringify(stored));

      const result = await manager.consumeRegistrationChallenge(
        MOCK_CHALLENGE,
        'deadbeef'
      );

      expect(result).toEqual(stored);
      expect(mockStatsd.increment).toHaveBeenCalledWith(
        'passkey.challenge.validated',
        { type: 'registration' }
      );
    });

    it('returns null and increments statsd if challenge not found', async () => {
      mockRedis.getdel.mockResolvedValue(null);

      const result = await manager.consumeRegistrationChallenge(
        MOCK_CHALLENGE,
        'deadbeef'
      );

      expect(result).toBeNull();
      expect(mockStatsd.increment).toHaveBeenCalledWith(
        'passkey.challenge.notFound',
        { type: 'registration' }
      );
    });

    it('returns null and increments statsd if challenge is bad json', async () => {
      mockRedis.getdel.mockResolvedValue('not a valid json string');

      const result = await manager.consumeRegistrationChallenge(
        MOCK_CHALLENGE,
        'deadbeef'
      );

      expect(result).toBeNull();
      expect(mockStatsd.increment).toHaveBeenCalledWith(
        'passkey.challenge.invalidJson',
        { type: 'registration' }
      );
    });

    it('calls GETDEL with the correct Redis key', async () => {
      const stored = makeStored({ type: 'authentication' });
      mockRedis.getdel.mockResolvedValue(JSON.stringify(stored));

      await manager.consumeAuthenticationChallenge(MOCK_CHALLENGE);

      expect(mockRedis.getdel).toHaveBeenCalledWith(
        `passkey:challenge:authentication:${MOCK_CHALLENGE}`
      );
    });
  });

  describe('deleteChallenge', () => {
    it('calls redis.del with the correct key', async () => {
      mockRedis.del.mockResolvedValue(1);
      await manager.deleteChallenge('registration', MOCK_CHALLENGE, 'deadbeef');

      expect(mockRedis.del).toHaveBeenCalledWith(
        `passkey:challenge:registration:${MOCK_CHALLENGE}:deadbeef`
      );
    });

    it('does not throw when the key does not exist (del returns 0)', async () => {
      mockRedis.del.mockResolvedValue(0);
      await expect(
        manager.deleteChallenge('authentication', MOCK_CHALLENGE, 'deadbeef')
      ).resolves.toBeUndefined();
    });
  });
});
