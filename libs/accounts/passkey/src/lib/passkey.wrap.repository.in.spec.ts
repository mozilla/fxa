/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import {
  AccountDatabase,
  PasskeyFactory,
  PasskeyWrapFactory,
  testAccountDatabaseSetup,
} from '@fxa/shared/db/mysql/account';
import { AccountManager } from '@fxa/shared/account/account';
import {
  bufferToAaguid,
  findPasskeyByCredentialId,
  insertPasskey,
} from './passkey.repository';
import {
  deleteAllPasskeyWrapsForUser,
  findPasskeyWrap,
  insertPasskeyWrap,
  type NewPasskeyWrapData,
} from './passkey.wrap.repository';

describe('PasskeyWrapRepository (Integration)', () => {
  let db: AccountDatabase;
  let accountManager: AccountManager;

  const NOW = 1_700_000_000_000;

  beforeAll(async () => {
    try {
      db = await testAccountDatabaseSetup([
        'accounts',
        'emails',
        'passkeys',
        'passkeyWraps',
      ]);
      accountManager = new AccountManager(db);
    } catch (error) {
      console.warn('\n⚠️  Integration tests require database infrastructure.');
      console.warn(
        '   Run "yarn start infrastructure" to enable these tests.\n'
      );
      throw error;
    }
  });

  afterAll(async () => {
    await db?.destroy();
  });

  /** An account with one PRF-enabled passkey, ready to hold a wrap. */
  async function createAccountWithPasskey(prfEnabled = true) {
    const uid = await accountManager.createAccountStub(
      faker.internet.email(),
      1,
      'en-US'
    );
    const passkey = PasskeyFactory({ prfEnabled });
    const credentialId = passkey.credentialId.toString('base64url');

    await insertPasskey(db, uid, {
      ...passkey,
      credentialId,
      aaguid: bufferToAaguid(passkey.aaguid),
    });

    return { uid, credentialId };
  }

  function envelope(credentialId: string): NewPasskeyWrapData {
    const wrap = PasskeyWrapFactory();
    return {
      credentialId,
      pkR: wrap.pkR,
      prfWrappedSkR: wrap.prfWrappedSkR,
      keyWrapIv: wrap.keyWrapIv,
      hpkeEncapsulatedSecret: wrap.hpkeEncapsulatedSecret,
      hpkeSealedKb: wrap.hpkeSealedKb,
    };
  }

  describe('insertPasskeyWrap / findPasskeyWrap', () => {
    it('round-trips every binary field byte-for-byte', async () => {
      // The reason these columns are fixed-width BINARY: a value stored at the
      // wrong length is right-padded and can never be opened again.
      const { uid, credentialId } = await createAccountWithPasskey();
      const data = envelope(credentialId);

      await insertPasskeyWrap(db, uid, data, NOW);
      const stored = await findPasskeyWrap(db, uid, credentialId);

      expect(stored).toBeDefined();
      expect(stored?.pkR.equals(data.pkR)).toBe(true);
      expect(stored?.prfWrappedSkR.equals(data.prfWrappedSkR)).toBe(true);
      expect(stored?.keyWrapIv.equals(data.keyWrapIv)).toBe(true);
      expect(
        stored?.hpkeEncapsulatedSecret.equals(data.hpkeEncapsulatedSecret)
      ).toBe(true);
      expect(stored?.hpkeSealedKb.equals(data.hpkeSealedKb)).toBe(true);
    });

    // A width assertion on a read is vacuous — BINARY(n) always returns n bytes.
    // What matters is that a short value is refused before MySQL right-pads it
    // into something that can never be opened.
    it.each([
      ['pkR', 132],
      ['prfWrappedSkR', 81],
      ['keyWrapIv', 11],
      ['hpkeEncapsulatedSecret', 132],
      ['hpkeSealedKb', 47],
    ])(
      'refuses a short %s rather than letting MySQL pad it',
      async (field, short) => {
        const { uid, credentialId } = await createAccountWithPasskey();
        const data = {
          ...envelope(credentialId),
          [field as string]: Buffer.alloc(short as number, 0x01),
        };

        await expect(insertPasskeyWrap(db, uid, data, NOW)).rejects.toThrow(
          `${field} must be`
        );
        await expect(
          findPasskeyWrap(db, uid, credentialId)
        ).resolves.toBeUndefined();
      }
    );

    it('sets createdAt from the supplied timestamp', async () => {
      const { uid, credentialId } = await createAccountWithPasskey();
      await insertPasskeyWrap(db, uid, envelope(credentialId), NOW);

      const stored = await findPasskeyWrap(db, uid, credentialId);

      expect(stored?.createdAt).toBe(NOW);
    });

    it('returns undefined for a credential with no wrap', async () => {
      const { uid, credentialId } = await createAccountWithPasskey();

      await expect(
        findPasskeyWrap(db, uid, credentialId)
      ).resolves.toBeUndefined();
    });

    it('does not return another user’s wrap', async () => {
      const owner = await createAccountWithPasskey();
      const other = await createAccountWithPasskey();
      await insertPasskeyWrap(db, owner.uid, envelope(owner.credentialId), NOW);

      await expect(
        findPasskeyWrap(db, other.uid, owner.credentialId)
      ).resolves.toBeUndefined();
    });

    it('rejects a second wrap for the same credential', async () => {
      const { uid, credentialId } = await createAccountWithPasskey();
      await insertPasskeyWrap(db, uid, envelope(credentialId), NOW);

      await expect(
        insertPasskeyWrap(db, uid, envelope(credentialId), NOW)
      ).rejects.toMatchObject({ code: 'ER_DUP_ENTRY' });
    });

    it('rejects a wrap for a credential that does not exist', async () => {
      // The foreign key is what guarantees a wrap always has a parent passkey.
      const uid = await accountManager.createAccountStub(
        faker.internet.email(),
        1,
        'en-US'
      );
      const orphan = Buffer.alloc(32, 0x99).toString('base64url');

      await expect(
        insertPasskeyWrap(db, uid, envelope(orphan), NOW)
      ).rejects.toMatchObject({ code: 'ER_NO_REFERENCED_ROW_2' });
    });
  });

  describe('deleteAllPasskeyWrapsForUser', () => {
    it('deletes every wrap for the user and leaves the passkeys registered', async () => {
      // The password-reset path: kB changed, so the envelopes are useless, but
      // the credentials stay usable for re-enrolment.
      const { uid, credentialId } = await createAccountWithPasskey();
      await insertPasskeyWrap(db, uid, envelope(credentialId), NOW);

      const deleted = await deleteAllPasskeyWrapsForUser(db, uid);

      expect(deleted).toBe(1);
      await expect(
        findPasskeyWrap(db, uid, credentialId)
      ).resolves.toBeUndefined();
      await expect(
        findPasskeyByCredentialId(db, credentialId)
      ).resolves.toBeDefined();
    });

    it('leaves another user’s wraps alone', async () => {
      const target = await createAccountWithPasskey();
      const bystander = await createAccountWithPasskey();
      await insertPasskeyWrap(
        db,
        target.uid,
        envelope(target.credentialId),
        NOW
      );
      await insertPasskeyWrap(
        db,
        bystander.uid,
        envelope(bystander.credentialId),
        NOW
      );

      await deleteAllPasskeyWrapsForUser(db, target.uid);

      await expect(
        findPasskeyWrap(db, bystander.uid, bystander.credentialId)
      ).resolves.toBeDefined();
    });

    it('reports zero when the user has no wraps', async () => {
      const { uid } = await createAccountWithPasskey();

      await expect(deleteAllPasskeyWrapsForUser(db, uid)).resolves.toBe(0);
    });
  });

  describe('cascade from passkeys', () => {
    it('removes the wrap when its passkey is deleted', async () => {
      const { uid, credentialId } = await createAccountWithPasskey();
      await insertPasskeyWrap(db, uid, envelope(credentialId), NOW);

      await db
        .deleteFrom('passkeys')
        .where('uid', '=', Buffer.from(uid, 'hex'))
        .execute();

      await expect(
        findPasskeyWrap(db, uid, credentialId)
      ).resolves.toBeUndefined();
    });
  });
});
