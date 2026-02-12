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

    it('should find all passkeys for a user', async () => {
      const uid = await createTestAccount();
      const passkey1 = PasskeyFactory({ uid });
      const passkey2 = PasskeyFactory({ uid });

      await PasskeyRepository.insertPasskey(db, passkey1);
      await PasskeyRepository.insertPasskey(db, passkey2);

      const passkeys = await PasskeyRepository.findPasskeysByUid(db, uid);

      expect(passkeys.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('update operations', () => {
    it('should update passkey name', async () => {
      const uid = await createTestAccount();
      const passkey = PasskeyFactory({ uid });
      await PasskeyRepository.insertPasskey(db, passkey);

      const rowsUpdated = await PasskeyRepository.updatePasskeyName(
        db,
        passkey.credentialId,
        'New Name'
      );

      expect(rowsUpdated).toBe(1);

      const updated = await PasskeyRepository.findPasskeyByCredentialId(
        db,
        passkey.credentialId
      );
      expect(updated?.name).toBe('New Name');
    });

    it('should update counter and lastUsed after authentication', async () => {
      const uid = await createTestAccount();
      const passkey = PasskeyFactory({ uid });
      await PasskeyRepository.insertPasskey(db, passkey);

      const success = await PasskeyRepository.updatePasskeyCounterAndLastUsed(
        db,
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
  });

  describe('delete operations', () => {
    it('should delete a specific passkey', async () => {
      const uid = await createTestAccount();
      const passkey = PasskeyFactory({ uid });
      await PasskeyRepository.insertPasskey(db, passkey);

      const deleted = await PasskeyRepository.deletePasskey(
        db,
        passkey.uid,
        passkey.credentialId
      );

      expect(deleted).toBe(true);

      const found = await PasskeyRepository.findPasskeyByCredentialId(
        db,
        passkey.credentialId
      );
      expect(found).toBeUndefined();
    });

    it('should count passkeys for a user', async () => {
      const uid = await createTestAccount();
      const passkey1 = PasskeyFactory({ uid });
      const passkey2 = PasskeyFactory({ uid });

      await PasskeyRepository.insertPasskey(db, passkey1);
      await PasskeyRepository.insertPasskey(db, passkey2);

      const count = await PasskeyRepository.countPasskeysByUid(db, uid);

      expect(count).toBeGreaterThanOrEqual(2);
    });
  });
});
