/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import {
  AccountDatabase,
  AccountDbProvider,
  PasskeyFactory,
  testAccountDatabaseSetup,
} from '@fxa/shared/db/mysql/account';
import { AccountManager } from '@fxa/shared/account/account';
import { LOGGER_PROVIDER } from '@fxa/shared/log';
import { Test } from '@nestjs/testing';
import { PasskeyManager } from './passkey.manager';
import { PasskeyConfig, MAX_PASSKEY_NAME_LENGTH } from './passkey.config';
import { findPasskeyByCredentialId, insertPasskey } from './passkey.repository';
import { StatsDService } from '@fxa/shared/metrics/statsd';
import { AppError } from '../../../errors/src';

describe('PasskeyManager (Integration)', () => {
  let manager: PasskeyManager;
  let db: AccountDatabase;
  let accountManager: AccountManager;

  // Use a small limit to make passkeyLimitReached error tests practical
  const testConfig: PasskeyConfig = new PasskeyConfig({
    enabled: true,
    rpId: 'accounts.example.com',
    allowedOrigins: ['https://accounts.example.com'],
    maxPasskeysPerUser: 2,
    challengeTimeout: 30_000,
  });

  const mockMetrics = {
    increment: jest.fn(),
    timing: jest.fn(),
  };

  const mockLogger = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  beforeAll(async () => {
    try {
      db = await testAccountDatabaseSetup(['accounts', 'emails', 'passkeys']);
      accountManager = new AccountManager(db);

      const moduleRef = await Test.createTestingModule({
        providers: [
          PasskeyManager,
          {
            provide: AccountDbProvider,
            useValue: db,
          },
          {
            provide: PasskeyConfig,
            useValue: testConfig,
          },
          {
            provide: LOGGER_PROVIDER,
            useValue: mockLogger,
          },
          { provide: StatsDService, useValue: mockMetrics },
        ],
      }).compile();

      manager = moduleRef.get(PasskeyManager);
    } catch (error) {
      console.warn('\n⚠️  Integration tests require database infrastructure.');
      console.warn(
        '   Run "yarn start infrastructure" to enable these tests.\n'
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

  describe('registerPasskey', () => {
    it('persists the passkey with correct field values', async () => {
      const uid = await createTestAccount();
      // Pass lastUsedAt: null explicitly — PasskeyFactory may randomise it
      const passkey = PasskeyFactory({
        uid,
        backupEligible: true,
        backupState: false,
        prfEnabled: false,
        lastUsedAt: null,
      });

      await manager.registerPasskey(passkey);

      const found = await findPasskeyByCredentialId(db, passkey.credentialId);
      expect(found?.uid).toEqual(uid);
      expect(found?.credentialId).toEqual(passkey.credentialId);
      expect(found?.name).toBe(passkey.name);
      expect(found?.backupEligible).toBe(true);
      expect(found?.backupState).toBe(false);
      expect(found?.prfEnabled).toBe(false);
      expect(found?.lastUsedAt).toBeNull();
    });

    it('throws passkeyLimitReached AppError when user reaches the limit', async () => {
      const uid = await createTestAccount();

      // Fill up to the limit (maxPasskeysPerUser = 2)
      await manager.registerPasskey(PasskeyFactory({ uid }));
      await manager.registerPasskey(PasskeyFactory({ uid }));

      await expect(
        manager.registerPasskey(PasskeyFactory({ uid }))
      ).rejects.toMatchObject(
        AppError.passkeyLimitReached(testConfig.maxPasskeysPerUser)
      );
    });

    it('throws passkeyAlreadyRegistered AppError on duplicate credentialId', async () => {
      const uid = await createTestAccount();
      const passkey = PasskeyFactory({ uid });

      await manager.registerPasskey(passkey);

      // Attempt to register the same credentialId again
      await expect(
        manager.registerPasskey({ ...passkey })
      ).rejects.toMatchObject(AppError.passkeyAlreadyRegistered());
    });
  });

  describe('updatePasskeyAfterAuth', () => {
    it('updates signCount, backupState, and lastUsedAt', async () => {
      const uid = await createTestAccount();
      const passkey = PasskeyFactory({ uid, signCount: 0, backupState: false });
      await manager.registerPasskey(passkey);

      const updated = await manager.updatePasskeyAfterAuth(
        passkey.uid,
        passkey.credentialId,
        5,
        true
      );

      expect(updated).toBe(true);

      const found = await findPasskeyByCredentialId(db, passkey.credentialId);
      expect(found?.signCount).toBe(5);
      expect(found?.backupState).toBe(true);
      expect(found?.lastUsedAt).toBeGreaterThan(0);
    });

    it('sets backupState to false when passed false', async () => {
      const uid = await createTestAccount();
      const passkey = PasskeyFactory({ uid, backupState: true });
      await manager.registerPasskey(passkey);

      await manager.updatePasskeyAfterAuth(
        passkey.uid,
        passkey.credentialId,
        1,
        false
      );

      const found = await findPasskeyByCredentialId(db, passkey.credentialId);
      expect(found?.backupState).toBe(false);
    });

    it('returns false when credentialId not found', async () => {
      const result = await manager.updatePasskeyAfterAuth(
        Buffer.alloc(16, 0xff),
        Buffer.alloc(32, 0xff),
        1,
        false
      );
      expect(result).toBe(false);
    });

    it('returns false and does not update when signCount regresses', async () => {
      const uid = await createTestAccount();
      const passkey = PasskeyFactory({ uid, signCount: 10 });
      await manager.registerPasskey(passkey);

      // Attempt to set a lower signCount — should be rejected
      const result = await manager.updatePasskeyAfterAuth(
        passkey.uid,
        passkey.credentialId,
        5,
        false
      );

      expect(result).toBe(false);
      const found = await findPasskeyByCredentialId(db, passkey.credentialId);
      expect(found?.signCount).toBe(10);
    });

    it('returns false and does not update when new signCount equals stored non-zero signCount', async () => {
      const uid = await createTestAccount();
      const passkey = PasskeyFactory({ uid, signCount: 5 });
      await manager.registerPasskey(passkey);

      // Same non-zero signCount is a potential cloning signal — should be rejected
      const result = await manager.updatePasskeyAfterAuth(
        passkey.uid,
        passkey.credentialId,
        5,
        false
      );

      expect(result).toBe(false);
      const found = await findPasskeyByCredentialId(db, passkey.credentialId);
      expect(found?.signCount).toBe(5);
    });

    it('succeeds when both stored and new signCount are zero', async () => {
      const uid = await createTestAccount();
      const passkey = PasskeyFactory({ uid, signCount: 0, backupState: false });
      await manager.registerPasskey(passkey);

      // Authenticators that never increment always return 0 — this is valid per WebAuthn spec
      const result = await manager.updatePasskeyAfterAuth(
        passkey.uid,
        passkey.credentialId,
        0,
        false
      );

      expect(result).toBe(true);
    });

    it('returns false and does not update when uid does not match credential owner', async () => {
      const uid1 = await createTestAccount();
      const uid2 = await createTestAccount();
      const passkey = PasskeyFactory({ uid: uid1, signCount: 0 });
      await manager.registerPasskey(passkey);

      // uid2 attempts to update uid1's credential — should be rejected
      const result = await manager.updatePasskeyAfterAuth(
        uid2,
        passkey.credentialId,
        1,
        false
      );

      expect(result).toBe(false);
      const found = await findPasskeyByCredentialId(db, passkey.credentialId);
      expect(found?.signCount).toBe(0);
    });
  });

  describe('listPasskeysForUser', () => {
    it('returns passkeys sorted by createdAt descending', async () => {
      const uid = await createTestAccount();
      const now = Date.now();

      // Insert directly via repository to control createdAt precisely
      const older = PasskeyFactory({ uid, createdAt: now - 5000 });
      const middle = PasskeyFactory({ uid, createdAt: now - 2000 });
      const newest = PasskeyFactory({ uid, createdAt: now });
      await insertPasskey(db, older);
      await insertPasskey(db, middle);
      await insertPasskey(db, newest);

      const result = await manager.listPasskeysForUser(uid);

      expect(result.length).toBeGreaterThanOrEqual(3);
      for (let i = 1; i < result.length; i++) {
        expect(result[i - 1].createdAt).toBeGreaterThanOrEqual(
          result[i].createdAt
        );
      }
    });

    it('returns empty array for user with no passkeys', async () => {
      const uid = await createTestAccount();
      const result = await manager.listPasskeysForUser(uid);
      expect(result).toEqual([]);
    });

    it('returns only passkeys belonging to the requested user', async () => {
      const uid1 = await createTestAccount();
      const uid2 = await createTestAccount();

      await manager.registerPasskey(PasskeyFactory({ uid: uid1 }));
      await manager.registerPasskey(PasskeyFactory({ uid: uid2 }));

      const result = await manager.listPasskeysForUser(uid1);
      expect(result.every((p) => p.uid.equals(uid1))).toBe(true);
    });
  });

  describe('renamePasskey', () => {
    it('renames an existing passkey', async () => {
      const uid = await createTestAccount();
      const passkey = PasskeyFactory({ uid });
      await manager.registerPasskey(passkey);

      const renamed = await manager.renamePasskey(
        uid,
        passkey.credentialId,
        'New Name'
      );

      expect(renamed).toBe(true);
      const found = await findPasskeyByCredentialId(db, passkey.credentialId);
      expect(found?.name).toBe('New Name');
    });

    it('does not rename a passkey belonging to a different user', async () => {
      const uid1 = await createTestAccount();
      const uid2 = await createTestAccount();
      const passkey = PasskeyFactory({ uid: uid1 });
      await manager.registerPasskey(passkey);

      // uid2 tries to rename uid1's passkey — should return false
      const renamed = await manager.renamePasskey(
        uid2,
        passkey.credentialId,
        'Hijacked'
      );
      expect(renamed).toBe(false);

      // Name is unchanged
      const found = await findPasskeyByCredentialId(db, passkey.credentialId);
      expect(found?.name).toBe(passkey.name);
    });

    it(`accepts a name at exactly ${MAX_PASSKEY_NAME_LENGTH} characters`, async () => {
      const uid = await createTestAccount();
      const passkey = PasskeyFactory({ uid });
      await manager.registerPasskey(passkey);

      const exactName = 'x'.repeat(MAX_PASSKEY_NAME_LENGTH);
      const renamed = await manager.renamePasskey(
        uid,
        passkey.credentialId,
        exactName
      );
      expect(renamed).toBe(true);
    });

    it('returns false when credentialId is not found', async () => {
      const uid = await createTestAccount();
      const result = await manager.renamePasskey(
        uid,
        Buffer.alloc(32, 0xff),
        'Ghost'
      );
      expect(result).toBe(false);
    });
  });

  describe('deletePasskey', () => {
    it('deletes an existing passkey and returns true', async () => {
      const uid = await createTestAccount();
      const passkey = PasskeyFactory({ uid });
      await manager.registerPasskey(passkey);

      const deleted = await manager.deletePasskey(uid, passkey.credentialId);

      expect(deleted).toBe(true);
      const found = await findPasskeyByCredentialId(db, passkey.credentialId);
      expect(found).toBeUndefined();
    });

    it('returns false when passkey is not found', async () => {
      const uid = await createTestAccount();
      const result = await manager.deletePasskey(uid, Buffer.alloc(32, 0xff));
      expect(result).toBe(false);
    });

    it('does not delete a passkey belonging to a different user', async () => {
      const uid1 = await createTestAccount();
      const uid2 = await createTestAccount();
      const passkey = PasskeyFactory({ uid: uid1 });
      await manager.registerPasskey(passkey);

      // uid2 tries to delete uid1's passkey — should return false
      const deleted = await manager.deletePasskey(uid2, passkey.credentialId);
      expect(deleted).toBe(false);

      // Passkey still exists
      const found = await findPasskeyByCredentialId(db, passkey.credentialId);
      expect(found).toBeDefined();
    });
  });

  describe('countPasskeys', () => {
    it('returns 0 for a new user', async () => {
      const uid = await createTestAccount();
      expect(await manager.countPasskeys(uid)).toBe(0);
    });

    it('increments as passkeys are added', async () => {
      const uid = await createTestAccount();

      await manager.registerPasskey(PasskeyFactory({ uid }));
      expect(await manager.countPasskeys(uid)).toBe(1);

      await manager.registerPasskey(PasskeyFactory({ uid }));
      expect(await manager.countPasskeys(uid)).toBe(2);
    });

    it('decrements after deletion', async () => {
      const uid = await createTestAccount();
      const passkey = PasskeyFactory({ uid });
      await manager.registerPasskey(passkey);

      expect(await manager.countPasskeys(uid)).toBe(1);
      await manager.deletePasskey(uid, passkey.credentialId);
      expect(await manager.countPasskeys(uid)).toBe(0);
    });
  });

  describe('deleteAllPasskeysForUser', () => {
    it('removes all passkeys for the user and returns the count deleted', async () => {
      const uid = await createTestAccount();
      await manager.registerPasskey(PasskeyFactory({ uid }));
      await manager.registerPasskey(PasskeyFactory({ uid }));

      const deleted = await manager.deleteAllPasskeysForUser(uid);

      expect(deleted).toBe(2);
      expect(await manager.countPasskeys(uid)).toBe(0);
    });

    it('returns 0 when the user has no passkeys', async () => {
      const uid = await createTestAccount();
      expect(await manager.deleteAllPasskeysForUser(uid)).toBe(0);
    });

    it('does not affect passkeys belonging to other users', async () => {
      const uid1 = await createTestAccount();
      const uid2 = await createTestAccount();

      await manager.registerPasskey(PasskeyFactory({ uid: uid1 }));
      await manager.registerPasskey(PasskeyFactory({ uid: uid2 }));

      await manager.deleteAllPasskeysForUser(uid1);

      expect(await manager.countPasskeys(uid1)).toBe(0);
      expect(await manager.countPasskeys(uid2)).toBe(1);
    });
  });
});
