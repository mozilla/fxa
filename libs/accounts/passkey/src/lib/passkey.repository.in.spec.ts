/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import {
  AccountDatabase,
  testAccountDatabaseSetup,
  PasskeyFactory,
} from '@fxa/shared/db/mysql/account';
import { AccountManager } from '@fxa/shared/account/account';
import * as PasskeyRepository from './passkey.repository';

describe('PasskeyRepository (Integration)', () => {
  let db: AccountDatabase;
  let accountManager: AccountManager;

  beforeAll(async () => {
    try {
      db = await testAccountDatabaseSetup(['accounts', 'emails', 'passkeys']);
      accountManager = new AccountManager(db);
    } catch (error) {
      console.warn('\n⚠️  Integration tests require database infrastructure.');
      console.warn(
        '   Run "yarn start infrastructure" to enable these tests.\n'
      );
      throw error;
    }
  });

  // Helper to create an account for testing
  async function createTestAccount() {
    const email = faker.internet.email();
    const uidHex = await accountManager.createAccountStub(email, 1, 'en-US');
    return Buffer.from(uidHex, 'hex');
  }

  afterAll(async () => {
    if (db) {
      await db.destroy();
    }
  });

  describe('insert and find operations', () => {
    it('should insert and retrieve a passkey', async () => {
      const uid = await createTestAccount();
      const passkey = PasskeyFactory({ uid });

      await PasskeyRepository.insertPasskey(db, passkey);

      const found = await PasskeyRepository.findPasskeyByCredentialId(
        db,
        passkey.credentialId
      );

      expect(found).toBeDefined();
      expect(found?.uid).toEqual(passkey.uid);
      expect(found?.name).toBe(passkey.name);
      expect(found?.transports).toBeDefined(); // JSON field
      expect(found?.aaguid).toEqual(passkey.aaguid); // NOT NULL
    });
  });

  describe('update operations', () => {
    it('should update counter and lastUsed after authentication', async () => {
      const uid = await createTestAccount();
      const passkey = PasskeyFactory({ uid });
      await PasskeyRepository.insertPasskey(db, passkey);

      const success = await PasskeyRepository.updatePasskeyCounterAndLastUsed(
        db,
        passkey.uid,
        passkey.credentialId,
        5,
        1
      );

      expect(success).toBe(true);

      const updated = await PasskeyRepository.findPasskeyByCredentialId(
        db,
        passkey.credentialId
      );
      expect(updated?.signCount).toBe(5);
      expect(updated?.backupState).toBe(true);
      expect(updated?.lastUsedAt).toBeGreaterThan(0);
    });

    it('should reject update when new signCount equals stored non-zero signCount', async () => {
      const uid = await createTestAccount();
      const passkey = PasskeyFactory({ uid, signCount: 5 });
      await PasskeyRepository.insertPasskey(db, passkey);

      // Same non-zero signCount is a potential cloning signal — should be rejected
      const success = await PasskeyRepository.updatePasskeyCounterAndLastUsed(
        db,
        passkey.uid,
        passkey.credentialId,
        5,
        0
      );

      expect(success).toBe(false);
      const found = await PasskeyRepository.findPasskeyByCredentialId(
        db,
        passkey.credentialId
      );
      expect(found?.signCount).toBe(5);
    });

    it('should allow update when both stored and new signCount are zero', async () => {
      const uid = await createTestAccount();
      const passkey = PasskeyFactory({ uid, signCount: 0 });
      await PasskeyRepository.insertPasskey(db, passkey);

      // Authenticators that never increment always return 0 — valid per WebAuthn spec
      const success = await PasskeyRepository.updatePasskeyCounterAndLastUsed(
        db,
        passkey.uid,
        passkey.credentialId,
        0,
        0
      );

      expect(success).toBe(true);
    });

    it('should not update when uid does not match credential owner', async () => {
      const uid1 = await createTestAccount();
      const uid2 = await createTestAccount();
      const passkey = PasskeyFactory({ uid: uid1, signCount: 0 });
      await PasskeyRepository.insertPasskey(db, passkey);

      // Wrong uid — WHERE clause should prevent the update
      const success = await PasskeyRepository.updatePasskeyCounterAndLastUsed(
        db,
        uid2,
        passkey.credentialId,
        1,
        0
      );

      expect(success).toBe(false);
      const found = await PasskeyRepository.findPasskeyByCredentialId(
        db,
        passkey.credentialId
      );
      expect(found?.signCount).toBe(0);
    });
  });
});
