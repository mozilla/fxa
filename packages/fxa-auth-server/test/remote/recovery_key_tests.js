/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const config = require('../../config').default.getProperties();
const crypto = require('crypto');
const Client = require('../client')();
const mailbox = require('../mailbox')();
const { uniqueEmail } = require('../lib/util');

[{ version: '' }, { version: 'V2' }].forEach((testOptions) => {
  describe(`#integration${testOptions.version} - remote recovery keys`, function () {

    let client, email;
    const password = '(-.-)Zzz...';

    let recoveryKeyId;
    let recoveryData;
    let keys;

    function createMockRecoveryKey() {
      // The auth-server does not care about the encryption details of the recovery data.
      // To simplify things, we can mock out some random bits to be stored. Check out
      // /docs/recovery_keys.md for more details on the encryption that a client
      // could perform.
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

    before(async () => {
    });

    after(async () => {
    });

    beforeEach(async () => {
      email = uniqueEmail();
      await Client.createAndVerify(
        config.publicUrl,
        email,
        password,
        mailbox,
        {
          ...testOptions,
          keys: true,
        }
      )
        .then((x) => {
          client = x;
          assert.ok(client.authAt, 'authAt was set');

          return client.keys();
        })
        .then((result) => {
          keys = result;

          return createMockRecoveryKey(client.uid, keys.kB).then((result) => {
            recoveryKeyId = result.recoveryKeyId;
            recoveryData = result.recoveryData;
            // Should create account recovery key
            return client
              .createRecoveryKey(result.recoveryKeyId, result.recoveryData)
              .then((res) => assert.ok(res, 'empty response'))
              .then(() => mailbox.waitForEmail(email))
              .then((emailData) => {
                assert.equal(
                  emailData.headers['x-template-name'],
                  'postAddAccountRecovery'
                );
              });
          });
        });
    });

    it('should get account recovery key', () => {
      return getAccountResetToken(client, email)
        .then(() => client.getRecoveryKey(recoveryKeyId))
        .then((res) => {
          assert.equal(res.recoveryData, recoveryData, 'recoveryData returned');
        });
    });

    it('should fail to get unknown account recovery key', () => {
      return getAccountResetToken(client, email)
        .then(() => client.getRecoveryKey('abce1234567890'))
        .then(assert.fail, (err) => {
          assert.equal(err.errno, 159, 'account recovery key is not valid');
        });
    });

    async function checkPayloadV2(mutate, restore) {
      await getAccountResetToken(client, email);
      await client.getRecoveryKey(recoveryKeyId);
      let err;
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

      assert.exists(err);
      assert.equal(err.errno, 107, 'invalid param');
    }

    it('should fail if wrapKb is missing and authPWVersion2 is provided', async function () {
      if (testOptions.version !== 'V2') {
        return this.skip();
      }
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

    it('should fail if wrapKbVersion2 is missing and authPWVersion2 is provided', async function () {
      if (testOptions.version !== 'V2') {
        return this.skip();
      }

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

    it('should fail if clientSalt is missing and authPWVersion2 is provided', async function () {
      if (testOptions.version !== 'V2') {
        return this.skip();
      }
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

    it('should fail if recoveryKeyId is missing', function () {
      if (testOptions.version === 'V2') {
        return this.skip();
      }

      return getAccountResetToken(client, email)
        .then(() => client.getRecoveryKey(recoveryKeyId))
        .then((res) =>
          assert.equal(res.recoveryData, recoveryData, 'recoveryData returned')
        )
        .then(() =>
          client.resetAccountWithRecoveryKey(
            'newpass',
            keys.kB,
            undefined,
            {},
            { keys: true }
          )
        )
        .then(assert.fail, (err) => {
          assert.equal(err.errno, 107, 'invalid param');
        });
    });

    it('should fail if wrapKb is missing', function () {
      if (testOptions.version === 'V2') {
        return this.skip();
      }

      return getAccountResetToken(client, email)
        .then(() => client.getRecoveryKey(recoveryKeyId))
        .then((res) =>
          assert.equal(res.recoveryData, recoveryData, 'recoveryData returned')
        )
        .then(() =>
          client.resetAccountWithRecoveryKey(
            'newpass',
            keys.kB,
            recoveryKeyId,
            {},
            { keys: true, undefinedWrapKb: true }
          )
        )
        .then(assert.fail, (err) => {
          assert.equal(err.errno, 107, 'invalid param');
        });
    });

    it('should reset password while keeping kB', async () => {
      await getAccountResetToken(client, email);
      let res = await client.getRecoveryKey(recoveryKeyId);
      assert.equal(res.recoveryData, recoveryData, 'recoveryData returned');

      const profileBefore = await client.accountProfile();

      res = await client.resetAccountWithRecoveryKey(
        'newpass',
        keys.kB,
        recoveryKeyId,
        {},
        { keys: true }
      );
      assert.equal(res.uid, client.uid, 'uid returned');
      assert.ok(res.sessionToken, 'sessionToken return');

      const emailData = await mailbox.waitForEmail(email);
      assert.equal(
        emailData.headers['x-template-name'],
        'passwordResetAccountRecovery',
        'correct template sent'
      );

      res = await client.keys();
      assert.equal(res.kA, keys.kA, 'kA are equal returned');
      assert.equal(res.kB, keys.kB, 'kB are equal returned');

      // Login with new password and check to see kB hasn't changed
      const c = await Client.login(config.publicUrl, email, 'newpass', {
        ...testOptions,
        keys: true,
      });
      assert.ok(c.sessionToken, 'sessionToken returned');
      res = await c.keys();
      assert.equal(res.kA, keys.kA, 'kA are equal returned');
      assert.equal(res.kB, keys.kB, 'kB are equal returned');

      const profileAfter = await client.accountProfile();

      assert.equal(
        profileBefore['keysChangedAt'],
        profileAfter['keysChangedAt']
      );
    });

    it('should delete account recovery key', () => {
      return client.deleteRecoveryKey().then((res) => {
        assert.ok(res, 'empty response');
        return client
          .getRecoveryKeyExists()
          .then((result) => {
            assert.equal(result.exists, false, 'account recovery key deleted');
          })
          .then(() => mailbox.waitForEmail(email))
          .then((emailData) => {
            assert.equal(
              emailData.headers['x-template-name'],
              'postRemoveAccountRecovery'
            );
          });
      });
    });

    it('should fail to create account recovery key when one already exists', () => {
      return createMockRecoveryKey(client.uid, keys.kB).then((result) => {
        recoveryKeyId = result.recoveryKeyId;
        recoveryData = result.recoveryData;
        return client
          .createRecoveryKey(result.recoveryKeyId, result.recoveryData)
          .then(assert.fail, (err) => {
            assert.equal(err.errno, 161, 'correct errno');
          });
      });
    });

    describe('check account recovery key status', () => {
      describe('with sessionToken', () => {
        it('should return true if account recovery key exists and enabled', () => {
          console.debug('staring problem test');
          return client.getRecoveryKeyExists().then((res) => {
            assert.equal(res.exists, true, 'account recovery key exists');
          });
        });

        it("should return false if account recovery key doesn't exist", () => {
          email = uniqueEmail();
          return Client.createAndVerify(
            config.publicUrl,
            email,
            password,
            mailbox,
            {
              ...testOptions,
              keys: true,
            }
          )
            .then((c) => {
              client = c;
              return client.getRecoveryKeyExists();
            })
            .then((res) => {
              assert.equal(
                res.exists,
                false,
                'account recovery key doesnt exists'
              );
            });
        });

        it('should return false if account recovery key exist but not enabled', async () => {
          const email2 = uniqueEmail();
          const client2 = await Client.createAndVerify(
            config.publicUrl,
            email2,
            password,
            mailbox,
            {
              ...testOptions,
              keys: true,
            }
          );
          const recoveryKeyMock = await createMockRecoveryKey(
            client2.uid,
            keys.kB
          );
          let res = await client2.createRecoveryKey(
            recoveryKeyMock.recoveryKeyId,
            recoveryKeyMock.recoveryData,
            false
          );
          assert.deepEqual(res, {});

          res = await client2.getRecoveryKeyExists();
          assert.equal(res.exists, false, 'account recovery key doesnt exists');
        });
      });
    });
  });

  function getAccountResetToken(client, email) {
    return client
      .forgotPassword()
      .then(() => mailbox.waitForCode(email))
      .then((code) =>
        client.verifyPasswordResetCode(
          code,
          {},
          { accountResetWithRecoveryKey: true }
        )
      );
  }
});
