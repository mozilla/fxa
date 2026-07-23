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
import { bufferToAaguid } from './passkey.repository';

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
  async function createTestAccount(): Promise<string> {
    const email = faker.internet.email();
    return accountManager.createAccountStub(email, 1, 'en-US');
  }

  function uidBuffer(uid: string): Buffer {
    return Buffer.from(uid, 'hex');
  }

  // PasskeyFactory produces the DB-row shape (credentialId/aaguid: Buffer);
  // insertPasskey takes NewPasskeyData (credentialId: base64url string,
  // aaguid: hyphenated-UUID string).
  function toNewPasskeyData(passkey: ReturnType<typeof PasskeyFactory>) {
    return {
      ...passkey,
      credentialId: passkey.credentialId.toString('base64url'),
      aaguid: bufferToAaguid(passkey.aaguid),
    };
  }

  afterAll(async () => {
    if (db) {
      await db.destroy();
    }
  });

  describe('insert and find operations', () => {
    it('should insert and retrieve a passkey', async () => {
      const uid = await createTestAccount();
      const passkey = PasskeyFactory({ uid: uidBuffer(uid) });

      await PasskeyRepository.insertPasskey(db, uid, toNewPasskeyData(passkey));

      const found = await PasskeyRepository.findPasskeyByCredentialId(
        db,
        passkey.credentialId.toString('base64url')
      );

      expect(found).toBeDefined();
      expect(found?.uid.toString('hex')).toEqual(passkey.uid.toString('hex'));
      expect(found?.name).toBe(passkey.name);
      expect(found?.transports).toBeDefined(); // JSON field
      expect(found?.aaguid).toEqual(bufferToAaguid(passkey.aaguid)); // NOT NULL
    });
  });

  describe('update operations', () => {
    it('should update counter and lastUsedAt after authentication', async () => {
      const uid = await createTestAccount();
      const passkey = PasskeyFactory({ uid: uidBuffer(uid) });
      await PasskeyRepository.insertPasskey(db, uid, toNewPasskeyData(passkey));

      const success = await PasskeyRepository.updatePasskeyCounterAndLastUsed(
        db,
        passkey.uid.toString('hex'),
        passkey.credentialId.toString('base64url'),
        5,
        true
      );

      expect(success).toBe(true);

      const updated = await PasskeyRepository.findPasskeyByCredentialId(
        db,
        passkey.credentialId.toString('base64url')
      );
      expect(updated?.signCount).toBe(5);
      expect(updated?.backupState).toBe(true);
      expect(updated?.lastUsedAt).toBeGreaterThan(0);
    });

    it('should reject update when new signCount equals stored non-zero signCount', async () => {
      const uid = await createTestAccount();
      const passkey = PasskeyFactory({ uid: uidBuffer(uid), signCount: 5 });
      await PasskeyRepository.insertPasskey(db, uid, toNewPasskeyData(passkey));

      // Same non-zero signCount is a potential cloning signal — should be rejected
      const success = await PasskeyRepository.updatePasskeyCounterAndLastUsed(
        db,
        passkey.uid.toString('hex'),
        passkey.credentialId.toString('base64url'),
        5,
        false
      );

      expect(success).toBe(false);
      const found = await PasskeyRepository.findPasskeyByCredentialId(
        db,
        passkey.credentialId.toString('base64url')
      );
      expect(found?.signCount).toBe(5);
    });

    it('should allow update when both stored and new signCount are zero', async () => {
      const uid = await createTestAccount();
      const passkey = PasskeyFactory({ uid: uidBuffer(uid), signCount: 0 });
      await PasskeyRepository.insertPasskey(db, uid, toNewPasskeyData(passkey));

      // Authenticators that never increment always return 0 — valid per WebAuthn spec
      const success = await PasskeyRepository.updatePasskeyCounterAndLastUsed(
        db,
        passkey.uid.toString('hex'),
        passkey.credentialId.toString('base64url'),
        0,
        false
      );

      expect(success).toBe(true);
    });

    it('should not update when uid does not match credential owner', async () => {
      const uid1 = await createTestAccount();
      const uid2 = await createTestAccount();
      const passkey = PasskeyFactory({ uid: uidBuffer(uid1), signCount: 0 });
      await PasskeyRepository.insertPasskey(
        db,
        uid1,
        toNewPasskeyData(passkey)
      );

      // Wrong uid — WHERE clause should prevent the update
      const success = await PasskeyRepository.updatePasskeyCounterAndLastUsed(
        db,
        uid2,
        passkey.credentialId.toString('base64url'),
        1,
        false
      );

      expect(success).toBe(false);
      const found = await PasskeyRepository.findPasskeyByCredentialId(
        db,
        passkey.credentialId.toString('base64url')
      );
      expect(found?.signCount).toBe(0);
    });
  });

  describe('updatePasskeyPrfEnabled (monotonic)', () => {
    it('rolls prfEnabled forward from false to true', async () => {
      const uid = await createTestAccount();
      const passkey = PasskeyFactory({
        uid: uidBuffer(uid),
        prfEnabled: false,
      });
      await PasskeyRepository.insertPasskey(db, uid, toNewPasskeyData(passkey));

      const rows = await PasskeyRepository.updatePasskeyPrfEnabled(
        db,
        uid,
        passkey.credentialId.toString('base64url')
      );

      expect(rows).toBe(1);
      const found = await PasskeyRepository.findPasskeyByCredentialId(
        db,
        passkey.credentialId.toString('base64url')
      );
      expect(found?.prfEnabled).toBe(true);
    });

    it('is a no-op (0 rows) when prfEnabled is already true', async () => {
      const uid = await createTestAccount();
      const passkey = PasskeyFactory({ uid: uidBuffer(uid), prfEnabled: true });
      await PasskeyRepository.insertPasskey(db, uid, toNewPasskeyData(passkey));

      const rows = await PasskeyRepository.updatePasskeyPrfEnabled(
        db,
        uid,
        passkey.credentialId.toString('base64url')
      );

      expect(rows).toBe(0);
      const found = await PasskeyRepository.findPasskeyByCredentialId(
        db,
        passkey.credentialId.toString('base64url')
      );
      expect(found?.prfEnabled).toBe(true);
    });

    it('does not update when uid does not match the credential owner', async () => {
      const uid1 = await createTestAccount();
      const uid2 = await createTestAccount();
      const passkey = PasskeyFactory({
        uid: uidBuffer(uid1),
        prfEnabled: false,
      });
      await PasskeyRepository.insertPasskey(
        db,
        uid1,
        toNewPasskeyData(passkey)
      );

      const rows = await PasskeyRepository.updatePasskeyPrfEnabled(
        db,
        uid2,
        passkey.credentialId.toString('base64url')
      );

      expect(rows).toBe(0);
      const found = await PasskeyRepository.findPasskeyByCredentialId(
        db,
        passkey.credentialId.toString('base64url')
      );
      expect(found?.prfEnabled).toBe(false);
    });
    it('does not update when the credential does not match', async () => {
      const uid = await createTestAccount();
      const passkey1 = PasskeyFactory({
        uid: uidBuffer(uid),
        prfEnabled: false,
      });
      const passkey2 = PasskeyFactory({
        uid: uidBuffer(uid),
        prfEnabled: false,
      });
      await PasskeyRepository.insertPasskey(
        db,
        uid,
        toNewPasskeyData(passkey1)
      );
      await PasskeyRepository.insertPasskey(
        db,
        uid,
        toNewPasskeyData(passkey2)
      );

      const rows = await PasskeyRepository.updatePasskeyPrfEnabled(
        db,
        uid,
        passkey1.credentialId.toString('base64url')
      );
      // Should update passkey1 but not passkey2
      expect(rows).toBe(1);
      const found1 = await PasskeyRepository.findPasskeyByCredentialId(
        db,
        passkey1.credentialId.toString('base64url')
      );
      const found2 = await PasskeyRepository.findPasskeyByCredentialId(
        db,
        passkey2.credentialId.toString('base64url')
      );
      expect(found1?.prfEnabled).toBe(true);
      expect(found2?.prfEnabled).toBe(false);
    });
  });
});
