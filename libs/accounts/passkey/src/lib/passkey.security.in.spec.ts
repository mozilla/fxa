/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Security-focused integration tests for the passkey library.
 *
 * Standards references:
 * - WebAuthn Level 3: https://www.w3.org/TR/webauthn-3/
 * - NIST SP 800-63B:  https://pages.nist.gov/800-63-3/sp800-63b.html
 */

import { faker } from '@faker-js/faker';
import {
  AccountDatabase,
  AccountDbProvider,
  PasskeyFactory,
  testAccountDatabaseSetup,
} from '@fxa/shared/db/mysql/account';
import { AccountManager } from '@fxa/shared/account/account';
import { LOGGER_PROVIDER } from '@fxa/shared/log';
import { StatsDService } from '@fxa/shared/metrics/statsd';
import { Test } from '@nestjs/testing';
import Redis from 'ioredis';
import { PasskeyManager } from './passkey.manager';
import { PasskeyChallengeManager } from './passkey.challenge.manager';
import { PasskeyConfig } from './passkey.config';
import { AppError } from '@fxa/accounts/errors';
import { PASSKEY_CHALLENGE_REDIS } from './passkey.provider';
import {
  bufferToAaguid,
  findPasskeyByCredentialId,
  insertPasskey,
} from './passkey.repository';

const mockLogger = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};

let db: AccountDatabase;
let manager: PasskeyManager;
let accountManager: AccountManager;

let redis: Redis.Redis;
let challengeManager: PasskeyChallengeManager;

describe('Passkey Security Tests', () => {
  describe('Credential and Data Security', () => {
    beforeAll(async () => {
      try {
        db = await testAccountDatabaseSetup(['accounts', 'emails', 'passkeys']);
        accountManager = new AccountManager(db);

        const moduleRef = await Test.createTestingModule({
          providers: [
            PasskeyManager,
            { provide: AccountDbProvider, useValue: db },
            {
              provide: PasskeyConfig,
              useValue: Object.assign(new PasskeyConfig({} as PasskeyConfig), {
                rpId: 'accounts.example.com',
                allowedOrigins: ['https://accounts.example.com'],
                maxPasskeysPerUser: 10,
              }),
            },
            { provide: LOGGER_PROVIDER, useValue: mockLogger },
            { provide: StatsDService, useValue: { increment: jest.fn() } },
          ],
        }).compile();

        manager = moduleRef.get(PasskeyManager);
      } catch (error) {
        console.warn('⚠️  Integration tests require database infrastructure.');
        console.warn(
          '⚠️  Run "yarn start infrastructure" to enable these tests.'
        );
        throw error;
      }
    });

    afterAll(async () => {
      if (db) {
        await db.destroy();
      }
    });

    async function createTestAccount(): Promise<string> {
      const email = faker.internet.email();
      return accountManager.createAccountStub(email, 1, 'en-US');
    }

    function uidBuffer(uid: string): Buffer {
      return Buffer.from(uid, 'hex');
    }

    // PasskeyFactory produces the DB-row shape (credentialId/aaguid: Buffer);
    // callers of registerPasskey / insertPasskey take NewPasskeyData
    // (credentialId: base64url string, aaguid: hyphenated-UUID string).
    function toNewPasskeyData(passkey: ReturnType<typeof PasskeyFactory>) {
      return {
        ...passkey,
        credentialId: passkey.credentialId.toString('base64url'),
        aaguid: bufferToAaguid(passkey.aaguid),
      };
    }

    // WebAuthn §4: https://www.w3.org/TR/webauthn-3/#credential-id
    it('credentialId uniqueness is globally scoped across users', async () => {
      const uid1 = await createTestAccount();
      const uid2 = await createTestAccount();
      const passkey = PasskeyFactory({ uid: uidBuffer(uid1) });
      const data = toNewPasskeyData(passkey);

      await manager.registerPasskey(uid1, data);

      // Same user, same credentialId — also rejected
      await expect(manager.registerPasskey(uid1, data)).rejects.toMatchObject(
        AppError.passkeyAlreadyRegistered()
      );
      // Different user, same credentialId — UNIQUE INDEX is global, not per-user
      await expect(
        manager.registerPasskey(uid2, { ...data })
      ).rejects.toMatchObject(AppError.passkeyAlreadyRegistered());
    });

    // WebAuthn §6.4.1: public keys are binary CBOR — base64 coercion would corrupt key material
    // https://www.w3.org/TR/webauthn-3/#sctn-attestation
    it('publicKey survives DB round-trip as binary Buffer, not a base64 string', async () => {
      const uid = await createTestAccount();
      const knownKey = Buffer.from('deadbeefcafebabe'.repeat(8), 'hex');
      const passkey = PasskeyFactory({
        uid: uidBuffer(uid),
        publicKey: knownKey,
      });

      await insertPasskey(db, uid, toNewPasskeyData(passkey));

      const found = await findPasskeyByCredentialId(
        db,
        passkey.credentialId.toString('base64url')
      );
      expect(found).toBeDefined();
      expect(Buffer.isBuffer(found?.publicKey)).toBe(true);
      expect(found?.publicKey).toEqual(knownKey);
      expect(typeof found?.publicKey).not.toBe('string');
    });

    // Best practice: credentialIds are arbitrary byte arrays — VARBINARY columns
    // can be silently coerced to strings by some drivers/ORMs
    // WebAuthn §4.1.1: https://www.w3.org/TR/webauthn-3/#credential-id
    it('credentialId survives DB round-trip with non-UTF8 bytes', async () => {
      const uid = await createTestAccount();
      // 32 bytes in the 0x80–0x9F range — not valid UTF-8
      const binaryCredentialId = Buffer.from(
        Array.from({ length: 32 }, (_, i) => 0x80 + i)
      );
      const passkey = PasskeyFactory({
        uid: uidBuffer(uid),
        credentialId: binaryCredentialId,
      });

      await insertPasskey(db, uid, toNewPasskeyData(passkey));

      const found = await findPasskeyByCredentialId(
        db,
        binaryCredentialId.toString('base64url')
      );
      expect(found).toBeDefined();
      expect(found?.credentialId).toEqual(
        binaryCredentialId.toString('base64url')
      );
    });
  });

  describe('Challenge Security', () => {
    const mockStatsd = { increment: jest.fn() };
    const challengeLogger = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    };

    const fakeUid = () =>
      faker.string.hexadecimal({ length: 32, prefix: '', casing: 'lower' });

    async function clearChallengeKeys() {
      const keys = await redis.keys('passkey:challenge:*');
      if (keys.length > 0) {
        await redis.del(keys);
      }
    }

    beforeAll(async () => {
      redis = new Redis({ host: 'localhost' });

      const config = Object.assign(new PasskeyConfig({} as PasskeyConfig), {
        rpId: 'localhost',
        allowedOrigins: ['http://localhost'],
        challengeTimeout: 1000 * 60 * 5, // 5 minutes
      });

      const moduleRef = await Test.createTestingModule({
        providers: [
          PasskeyChallengeManager,
          { provide: PASSKEY_CHALLENGE_REDIS, useValue: redis },
          { provide: PasskeyConfig, useValue: config },
          { provide: LOGGER_PROVIDER, useValue: challengeLogger },
          { provide: StatsDService, useValue: mockStatsd },
        ],
      }).compile();

      challengeManager = moduleRef.get(PasskeyChallengeManager);
    });

    beforeEach(async () => {
      await clearChallengeKeys();
    });

    afterAll(async () => {
      await clearChallengeKeys();
      await redis.quit();
    });

    // WebAuthn §13.4.3 + NIST SP 800-63B §5.1.9.1: challenges must be >= 16 bytes (we require >= 32)
    // https://www.w3.org/TR/webauthn-3/#sctn-cryptographic-challenges
    // Verifies output is the right size and not constant or cached.
    it('generates 100 unique challenges each with >= 32 bytes of entropy', async () => {
      const challenges: string[] = [];

      for (let i = 0; i < 100; i++) {
        const challenge =
          await challengeManager.generateRegistrationChallenge(fakeUid());
        challenges.push(challenge);
      }

      expect(new Set(challenges).size).toBe(100);

      for (const challenge of challenges) {
        const decoded = Buffer.from(challenge, 'base64url');
        expect(decoded.byteLength).toBeGreaterThanOrEqual(32);
      }
    }, 10_000);

    // WebAuthn §7.1 step 5 / §7.2 step 10: server must discard each challenge on first use
    // https://www.w3.org/TR/webauthn-3/#sctn-registering-a-new-credential
    it('consumeRegistrationChallenge physically deletes the Redis key on first use', async () => {
      const uid = fakeUid();
      const challenge =
        await challengeManager.generateRegistrationChallenge(uid);

      await challengeManager.consumeRegistrationChallenge(challenge, uid);

      expect(await redis.keys('passkey:challenge:*')).toHaveLength(0);
    });

    // WebAuthn §13.4.3: cross-ceremony attack prevention — ceremony type is part of
    // the Redis key, so a registration challenge cannot satisfy an authentication lookup.
    // Also verifies the failed lookup does not consume the challenge.
    // https://www.w3.org/TR/webauthn-3/#sctn-cryptographic-challenges
    it('a registration challenge is rejected when presented as an authentication challenge and remains unconsumed', async () => {
      const uid = fakeUid();
      const challenge =
        await challengeManager.generateRegistrationChallenge(uid);

      expect(
        await challengeManager.consumeAuthenticationChallenge(challenge)
      ).toBeNull();

      const correct = await challengeManager.consumeRegistrationChallenge(
        challenge,
        uid
      );
      expect(correct).not.toBeNull();
      expect(correct?.type).toBe('registration');
    });
  });
});
