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
import Redis from 'ioredis';
import { Test } from '@nestjs/testing';
import { AppError } from '@fxa/accounts/errors';
import {
  AccountDatabase,
  AccountDbProvider,
  PasskeyFactory,
  testAccountDatabaseSetup,
} from '@fxa/shared/db/mysql/account';
import { AccountManager } from '@fxa/shared/account/account';
import { LOGGER_PROVIDER } from '@fxa/shared/log';
import { StatsDService } from '@fxa/shared/metrics/statsd';
import { PasskeyManager } from './passkey.manager';
import { PasskeyChallengeManager } from './passkey.challenge.manager';
import { PasskeyConfig } from './passkey.config';
import { PASSKEY_CHALLENGE_REDIS } from './passkey.provider';
import { findPasskeyByCredentialId, insertPasskey } from './passkey.repository';
import { generateRandomChallenge } from './webauthn-adapter';
import { PasskeyService } from './passkey.service';
import type { RegistrationResponseJSON } from '@simplewebauthn/server';
import { encodeCBOR, type CBORType } from '@levischuck/tiny-cbor';
import { createHash, generateKeyPairSync, randomBytes } from 'node:crypto';

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
              useValue: new PasskeyConfig({
                rpId: 'accounts.example.com',
                allowedOrigins: ['https://accounts.example.com'],
                maxPasskeysPerUser: 10,
                enabled: true,
                challengeTimeout: 30_000,
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

    async function createTestAccount(): Promise<Buffer> {
      const email = faker.internet.email();
      const uidHex = await accountManager.createAccountStub(email, 1, 'en-US');
      return Buffer.from(uidHex, 'hex');
    }

    // WebAuthn §4: https://www.w3.org/TR/webauthn-3/#credential-id
    it('credentialId uniqueness is globally scoped across users', async () => {
      const uid1 = await createTestAccount();
      const uid2 = await createTestAccount();
      const passkey = PasskeyFactory({ uid: uid1 });

      await manager.registerPasskey(passkey);

      // Same user, same credentialId — also rejected
      await expect(manager.registerPasskey(passkey)).rejects.toMatchObject(
        AppError.passkeyAlreadyRegistered()
      );
      // Different user, same credentialId — UNIQUE INDEX is global, not per-user
      await expect(
        manager.registerPasskey({ ...passkey, uid: uid2 })
      ).rejects.toMatchObject(AppError.passkeyAlreadyRegistered());
    });

    // WebAuthn §6.4.1: public keys are binary CBOR — base64 coercion would corrupt key material
    // https://www.w3.org/TR/webauthn-3/#sctn-attestation
    it('publicKey survives DB round-trip as binary Buffer, not a base64 string', async () => {
      const uid = await createTestAccount();
      const knownKey = Buffer.from('deadbeefcafebabe'.repeat(8), 'hex');
      const passkey = PasskeyFactory({ uid, publicKey: knownKey });

      await insertPasskey(db, passkey);

      const found = await findPasskeyByCredentialId(db, passkey.credentialId);
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
      const passkey = PasskeyFactory({ uid, credentialId: binaryCredentialId });

      await insertPasskey(db, passkey);

      const found = await findPasskeyByCredentialId(db, binaryCredentialId);
      expect(found).toBeDefined();
      expect(found?.credentialId).toEqual(binaryCredentialId);
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

      const config = new PasskeyConfig({
        enabled: true,
        rpId: 'localhost',
        allowedOrigins: ['http://localhost'],
        challengeTimeout: 1000 * 60 * 5, // 5 minutes
        maxPasskeysPerUser: 2,
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
        const challenge = generateRandomChallenge();
        await challengeManager.storeRegistrationChallenge(challenge, fakeUid());
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
      const challenge = generateRandomChallenge();
      await challengeManager.storeRegistrationChallenge(challenge, uid);

      await challengeManager.consumeRegistrationChallenge(challenge, uid);

      expect(await redis.keys('passkey:challenge:*')).toHaveLength(0);
    });

    // WebAuthn §13.4.3: cross-ceremony attack prevention — ceremony type is part of
    // the Redis key, so a registration challenge cannot satisfy an authentication lookup.
    // Also verifies the failed lookup does not consume the challenge.
    // https://www.w3.org/TR/webauthn-3/#sctn-cryptographic-challenges
    it('a registration challenge is rejected when presented as an authentication challenge and remains unconsumed', async () => {
      const uid = fakeUid();
      const challenge = generateRandomChallenge();
      await challengeManager.storeRegistrationChallenge(challenge, uid);

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

  describe('PasskeyService Registration Flow', () => {
    const serviceConfig = new PasskeyConfig({
      rpId: 'localhost',
      allowedOrigins: ['http://localhost'],
      maxPasskeysPerUser: 10,
      enabled: true,
      challengeTimeout: 30_000,
    });

    let serviceDb: AccountDatabase;
    let serviceRedis: Redis.Redis;
    let serviceAccountManager: AccountManager;
    let passkeyService: PasskeyService;

    /**
     * Builds a cryptographically valid WebAuthn "none"-attestation registration response
     * for the given challenge. Generates a fresh EC P-256 key pair each call.
     *
     * Uses the same CBOR library (@levischuck/tiny-cbor) that @simplewebauthn/server uses
     * internally, so the encoded structures are accepted without modification.
     */
    function buildValidRegistrationResponse(
      challenge: string
    ): RegistrationResponseJSON {
      const { publicKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
      const jwk = publicKey.export({ format: 'jwk' }) as {
        x: string;
        y: string;
      };
      const x = Buffer.from(jwk.x, 'base64url');
      const y = Buffer.from(jwk.y, 'base64url');

      // COSE EC2 public key (RFC 9052 §7.1)
      const coseKeyMap = new Map<number, CBORType>([
        [1, 2],
        [3, -7],
        [-1, 1],
        [-2, x],
        [-3, y],
      ]);
      const coseKey = Buffer.from(encodeCBOR(coseKeyMap));

      const credentialId = randomBytes(32);

      // Authenticator data layout (WebAuthn §6.1)
      const rpIdHash = createHash('sha256').update(serviceConfig.rpId).digest();
      const flags = Buffer.from([0x45]); // UP | UV | AT
      const signCount = Buffer.alloc(4);
      const aaguid = Buffer.alloc(16);
      const credIdLen = Buffer.alloc(2);
      credIdLen.writeUInt16BE(credentialId.length);

      const authenticatorData = Buffer.concat([
        rpIdHash,
        flags,
        signCount,
        aaguid,
        credIdLen,
        credentialId,
        coseKey,
      ]);

      const clientDataJSON = Buffer.from(
        JSON.stringify({
          type: 'webauthn.create',
          challenge,
          origin: 'http://localhost',
          crossOrigin: false,
        })
      ).toString('base64url');

      const attestObjMap = new Map<string, CBORType>([
        ['fmt', 'none'],
        ['attStmt', new Map<string, CBORType>()],
        ['authData', new Uint8Array(authenticatorData)],
      ]);
      const attestationObject = Buffer.from(encodeCBOR(attestObjMap)).toString(
        'base64url'
      );

      return {
        id: credentialId.toString('base64url'),
        rawId: credentialId.toString('base64url'),
        response: { clientDataJSON, attestationObject },
        type: 'public-key',
        clientExtensionResults: {},
      };
    }

    beforeAll(async () => {
      try {
        serviceDb = await testAccountDatabaseSetup([
          'accounts',
          'emails',
          'passkeys',
        ]);
        serviceAccountManager = new AccountManager(serviceDb);
        serviceRedis = new Redis({ host: 'localhost' });

        const moduleRef = await Test.createTestingModule({
          providers: [
            PasskeyService,
            PasskeyManager,
            PasskeyChallengeManager,
            { provide: AccountDbProvider, useValue: serviceDb },
            { provide: PasskeyConfig, useValue: serviceConfig },
            { provide: PASSKEY_CHALLENGE_REDIS, useValue: serviceRedis },
            { provide: LOGGER_PROVIDER, useValue: mockLogger },
            { provide: StatsDService, useValue: { increment: jest.fn() } },
          ],
        }).compile();

        passkeyService = moduleRef.get(PasskeyService);
      } catch (error) {
        console.warn('⚠️  Integration tests require database infrastructure.');
        console.warn(
          '⚠️  Run "yarn start infrastructure" to enable these tests.'
        );
        throw error;
      }
    });

    afterAll(async () => {
      if (serviceDb) await serviceDb.destroy();
      if (serviceRedis) await serviceRedis.quit();
    });

    // WebAuthn §7.1: a valid attestation response with a matching challenge must
    // be accepted and the credential stored in the database.
    // https://www.w3.org/TR/webauthn-3/#sctn-registering-a-new-credential
    it('accepts a valid registration response paired with its challenge', async () => {
      const email = faker.internet.email();
      const uidHex = await serviceAccountManager.createAccountStub(
        email,
        1,
        'en-US'
      );
      const uid = Buffer.from(uidHex, 'hex');

      const options = await passkeyService.generateRegistrationChallenge(
        uid,
        email
      );
      const challenge = options.challenge;

      const response = buildValidRegistrationResponse(challenge);

      const passkey =
        await passkeyService.createPasskeyFromRegistrationResponse(
          uid,
          response,
          challenge
        );

      expect(passkey).toMatchObject({
        uid,
        credentialId: expect.any(Buffer),
        publicKey: expect.any(Buffer),
      });
    });

    // WebAuthn §7.1 step 11: a tampered or structurally invalid attestation must
    // be rejected even when the challenge is genuine.
    // https://www.w3.org/TR/webauthn-3/#sctn-registering-a-new-credential
    it('rejects a bogus registration response paired with a valid challenge', async () => {
      const email = faker.internet.email();
      const uidHex = await serviceAccountManager.createAccountStub(
        email,
        1,
        'en-US'
      );
      const uid = Buffer.from(uidHex, 'hex');

      const options = await passkeyService.generateRegistrationChallenge(
        uid,
        email
      );
      const challenge = options.challenge;

      const bogusResponse: RegistrationResponseJSON = {
        id: 'bogus-credential-id',
        rawId: 'bogus-credential-id',
        response: {
          clientDataJSON: Buffer.from('not-valid-json').toString('base64url'),
          attestationObject: Buffer.from('not-cbor-data').toString('base64url'),
        },
        type: 'public-key',
        clientExtensionResults: {},
      };

      await expect(
        passkeyService.createPasskeyFromRegistrationResponse(
          uid,
          bogusResponse,
          challenge
        )
      ).rejects.toMatchObject(AppError.passkeyRegistrationFailed());
    });
  });
});
