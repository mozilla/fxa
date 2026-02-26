/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createTestServer, TestServerInstance } from '../support/helpers/test-server';
import crypto from 'crypto';

const Client = require('../client')();

function createMockRecoveryKey() {
  const recoveryCode = crypto.randomBytes(16).toString('hex');
  const recoveryKeyId = crypto.randomBytes(16).toString('hex');
  const recoveryKey = crypto.randomBytes(16).toString('hex');
  const recoveryData = crypto.randomBytes(32).toString('hex');

  return Promise.resolve({
    recoveryCode,
    recoveryData,
    recoveryKeyId,
    recoveryKey,
  });
}

async function getAccountResetToken(client: any, server: TestServerInstance, email: string) {
  await client.forgotPassword();
  const otpCode = await server.mailbox.waitForCode(email);
  const result = await client.verifyPasswordForgotOtp(otpCode);
  await client.verifyPasswordResetCode(
    result.code,
    {},
    { accountResetWithRecoveryKey: true }
  );
}

let server: TestServerInstance;

beforeAll(async () => {
  server = await createTestServer();
}, 120000);

afterAll(async () => {
  await server.stop();
});

const testVersions = [
  { version: '', tag: '' },
  { version: 'V2', tag: 'V2' },
];

describe.each(testVersions)(
  '#integration$tag - remote recovery keys',
  ({ version, tag }) => {
    const testOptions = { version };
    const password = '(-.-)Zzz...';
    let client: any;
    let email: string;
    let recoveryKeyId: string;
    let recoveryData: string;
    let keys: any;

    beforeEach(async () => {
      email = server.uniqueEmail();
      client = await Client.createAndVerify(
        server.publicUrl,
        email,
        password,
        server.mailbox,
        { ...testOptions, keys: true }
      );
      expect(client.authAt).toBeTruthy();

      keys = await client.keys();

      const mockKey = await createMockRecoveryKey();
      recoveryKeyId = mockKey.recoveryKeyId;
      recoveryData = mockKey.recoveryData;

      const res = await client.createRecoveryKey(
        mockKey.recoveryKeyId,
        mockKey.recoveryData
      );
      expect(res).toBeTruthy();

      const emailData = await server.mailbox.waitForEmail(email);
      expect(emailData.headers['x-template-name']).toBe('postAddAccountRecovery');
    });

    it('should get account recovery key', async () => {
      await getAccountResetToken(client, server, email);
      const res = await client.getRecoveryKey(recoveryKeyId);
      expect(res.recoveryData).toBe(recoveryData);
    });

    it('should fail to get unknown account recovery key', async () => {
      await getAccountResetToken(client, server, email);
      try {
        await client.getRecoveryKey('abce1234567890');
        fail('should have thrown');
      } catch (err: any) {
        expect(err.errno).toBe(159);
      }
    });

    if (version === 'V2') {
      const checkPayloadV2 = async (mutate: () => void, restore: () => void) => {
        await getAccountResetToken(client, server, email);
        await client.getRecoveryKey(recoveryKeyId);
        let err: any;
        try {
          mutate();
          await client.api.accountResetWithRecoveryKeyV2(
            client.accountResetToken,
            client.authPW,
            client.authPWVersion2,
            client.wrapKb,
            client.wrapKbVersion2,
            client.clientSalt,
            recoveryKeyId,
            undefined,
            {}
          );
        } catch (error) {
          err = error;
        } finally {
          restore();
        }

        expect(err).toBeDefined();
        expect(err.errno).toBe(107);
      };

      it('should fail if wrapKb is missing and authPWVersion2 is provided', async () => {
        const temp = client.wrapKb;
        await checkPayloadV2(
          () => {
            client.unwrapBKey = undefined;
            client.wrapKb = undefined;
          },
          () => {
            client.wrapKb = temp;
          }
        );
      });

      it('should fail if wrapKbVersion2 is missing and authPWVersion2 is provided', async () => {
        const temp = client.wrapKbVersion2;
        await checkPayloadV2(
          () => {
            client.wrapKbVersion2 = undefined;
          },
          () => {
            client.wrapKbVersion2 = temp;
          }
        );
      });

      it('should fail if clientSalt is missing and authPWVersion2 is provided', async () => {
        const temp = client.clientSalt;
        await checkPayloadV2(
          () => {
            client.clientSalt = undefined;
          },
          () => {
            client.clientSalt = temp;
          }
        );
      });
    }

    if (version === '') {
      it('should fail if recoveryKeyId is missing', async () => {
        await getAccountResetToken(client, server, email);
        const res = await client.getRecoveryKey(recoveryKeyId);
        expect(res.recoveryData).toBe(recoveryData);

        try {
          await client.resetAccountWithRecoveryKey(
            'newpass',
            keys.kB,
            undefined,
            {},
            { keys: true }
          );
          fail('should have thrown');
        } catch (err: any) {
          expect(err.errno).toBe(107);
        }
      });

      it('should fail if wrapKb is missing', async () => {
        await getAccountResetToken(client, server, email);
        const res = await client.getRecoveryKey(recoveryKeyId);
        expect(res.recoveryData).toBe(recoveryData);

        try {
          await client.resetAccountWithRecoveryKey(
            'newpass',
            keys.kB,
            recoveryKeyId,
            {},
            { keys: true, undefinedWrapKb: true }
          );
          fail('should have thrown');
        } catch (err: any) {
          expect(err.errno).toBe(107);
        }
      });
    }

    it('should reset password while keeping kB', async () => {
      await getAccountResetToken(client, server, email);
      let res = await client.getRecoveryKey(recoveryKeyId);
      expect(res.recoveryData).toBe(recoveryData);

      const profileBefore = await client.accountProfile();

      res = await client.resetAccountWithRecoveryKey(
        'newpass',
        keys.kB,
        recoveryKeyId,
        {},
        { keys: true }
      );
      expect(res.uid).toBe(client.uid);
      expect(res.sessionToken).toBeTruthy();

      const emailData = await server.mailbox.waitForEmail(email);
      expect(emailData.headers['x-template-name']).toBe(
        'passwordResetAccountRecovery'
      );

      res = await client.keys();
      expect(res.kA).toBe(keys.kA);
      expect(res.kB).toBe(keys.kB);

      // Login with new password and check kB hasn't changed
      const c = await Client.login(server.publicUrl, email, 'newpass', {
        ...testOptions,
        keys: true,
      });
      expect(c.sessionToken).toBeTruthy();
      res = await c.keys();
      expect(res.kA).toBe(keys.kA);
      expect(res.kB).toBe(keys.kB);

      const profileAfter = await client.accountProfile();
      expect(profileBefore['keysChangedAt']).toBe(profileAfter['keysChangedAt']);
    });

    it('should delete account recovery key', async () => {
      const res = await client.deleteRecoveryKey();
      expect(res).toBeTruthy();

      const result = await client.getRecoveryKeyExists();
      expect(result.exists).toBe(false);

      const emailData = await server.mailbox.waitForEmail(email);
      expect(emailData.headers['x-template-name']).toBe(
        'postRemoveAccountRecovery'
      );
    });

    it('should fail to create account recovery key when one already exists', async () => {
      const mockKey = await createMockRecoveryKey();

      try {
        await client.createRecoveryKey(mockKey.recoveryKeyId, mockKey.recoveryData);
        fail('should have thrown');
      } catch (err: any) {
        expect(err.errno).toBe(161);
      }
    });

    describe('check account recovery key status', () => {
      describe('with sessionToken', () => {
        it('should return true if account recovery key exists and enabled', async () => {
          const res = await client.getRecoveryKeyExists();
          expect(res.exists).toBe(true);
        });

        it("should return false if account recovery key doesn't exist", async () => {
          const newEmail = server.uniqueEmail();
          const newClient = await Client.createAndVerify(
            server.publicUrl,
            newEmail,
            password,
            server.mailbox,
            { ...testOptions, keys: true }
          );

          const res = await newClient.getRecoveryKeyExists();
          expect(res.exists).toBe(false);
        });

        it('should return false if account recovery key exist but not enabled', async () => {
          const email2 = server.uniqueEmail();
          const client2 = await Client.createAndVerify(
            server.publicUrl,
            email2,
            password,
            server.mailbox,
            { ...testOptions, keys: true }
          );

          const recoveryKeyMock = await createMockRecoveryKey();
          let res = await client2.createRecoveryKey(
            recoveryKeyMock.recoveryKeyId,
            recoveryKeyMock.recoveryData,
            false
          );
          expect(res).toEqual({});

          res = await client2.getRecoveryKeyExists();
          expect(res.exists).toBe(false);
        });
      });
    });
  }
);
