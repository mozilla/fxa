/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const config = require('../../config').getProperties();
const crypto = require('crypto');
const TestServer = require('../test_server');
const Client = require('../client')();
const P = require('bluebird');
const jwtool = require('fxa-jwtool');

describe('remote recovery keys', function () {
  this.timeout(10000);

  let server, client, email;
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

    return P.resolve({
      recoveryCode,
      recoveryData,
      recoveryKeyId,
      recoveryKey,
    });
  }

  before(() => {
    return TestServer.start(config).then((s) => (server = s));
  });

  beforeEach(() => {
    email = server.uniqueEmail();
    return Client.createAndVerify(
      config.publicUrl,
      email,
      password,
      server.mailbox,
      { keys: true }
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
          // Should create recovery key
          return client
            .createRecoveryKey(result.recoveryKeyId, result.recoveryData)
            .then((res) => assert.ok(res, 'empty response'))
            .then(() => server.mailbox.waitForEmail(email))
            .then((emailData) => {
              assert.equal(
                emailData.headers['x-template-name'],
                'postAddAccountRecovery'
              );
            });
        });
      });
  });

  it('should get recovery key', () => {
    return getAccountResetToken(client, server, email)
      .then(() => client.getRecoveryKey(recoveryKeyId))
      .then((res) => {
        assert.equal(res.recoveryData, recoveryData, 'recoveryData returned');
      });
  });

  it('should fail to get unknown recovery key', () => {
    return getAccountResetToken(client, server, email)
      .then(() => client.getRecoveryKey('abce1234567890'))
      .then(assert.fail, (err) => {
        assert.equal(err.errno, 159, 'recovery key is not valid');
      });
  });

  it('should fail if recoveryKeyId is missing', () => {
    return getAccountResetToken(client, server, email)
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

  it('should fail if wrapKb is missing', () => {
    return getAccountResetToken(client, server, email)
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
    await getAccountResetToken(client, server, email);
    let res = await client.getRecoveryKey(recoveryKeyId);
    assert.equal(res.recoveryData, recoveryData, 'recoveryData returned');

    const duration = 1000 * 60 * 60 * 24; // 24 hours
    const publicKey = {
      algorithm: 'RS',
      n:
        '4759385967235610503571494339196749614544606692567785790953934768202714280652973091341316862993582789079872007974809511698859885077002492642203267408776123',
      e: '65537',
    };
    const cert1 = jwtool.unverify(await client.sign(publicKey, duration))
      .payload;

    res = await client.resetAccountWithRecoveryKey(
      'newpass',
      keys.kB,
      recoveryKeyId,
      {},
      { keys: true }
    );
    assert.equal(res.uid, client.uid, 'uid returned');
    assert.ok(res.sessionToken, 'sessionToken return');

    const emailData = await server.mailbox.waitForEmail(email);
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
      keys: true,
    });
    assert.ok(c.sessionToken, 'sessionToken returned');
    res = await c.keys();
    assert.equal(res.kA, keys.kA, 'kA are equal returned');
    assert.equal(res.kB, keys.kB, 'kB are equal returned');

    const cert2 = jwtool.unverify(await c.sign(publicKey, duration)).payload;

    assert.equal(cert1['fxa-uid'], cert2['fxa-uid']);
    assert.ok(cert1['fxa-generation'] < cert2['fxa-generation']);
    assert.equal(cert1['fxa-keysChangedAt'], cert2['fxa-keysChangedAt']);
  });

  it('should delete recovery key', () => {
    return client.deleteRecoveryKey().then((res) => {
      assert.ok(res, 'empty response');
      return client
        .getRecoveryKeyExists()
        .then((result) => {
          assert.equal(result.exists, false, 'recovery key deleted');
        })
        .then(() => server.mailbox.waitForEmail(email))
        .then((emailData) => {
          assert.equal(
            emailData.headers['x-template-name'],
            'postRemoveAccountRecovery'
          );
        });
    });
  });

  it('should fail to create recovery key when one already exists', () => {
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

  describe('check recovery key status', () => {
    describe('with sessionToken', () => {
      it('should return true if recovery key exists and enabled', () => {
        return client.getRecoveryKeyExists().then((res) => {
          assert.equal(res.exists, true, 'recovery key exists');
        });
      });

      it("should return false if recovery key doesn't exist", () => {
        email = server.uniqueEmail();
        return Client.createAndVerify(
          config.publicUrl,
          email,
          password,
          server.mailbox,
          { keys: true }
        )
          .then((c) => {
            client = c;
            return client.getRecoveryKeyExists();
          })
          .then((res) => {
            assert.equal(res.exists, false, 'recovery key doesnt exists');
          });
      });

      it('should return false if recovery key exist but not enabled', async () => {
        const email2 = server.uniqueEmail();
        const client2 = await Client.createAndVerify(
          config.publicUrl,
          email2,
          password,
          server.mailbox,
          { keys: true }
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
        assert.equal(res.exists, false, 'recovery key doesnt exists');
      });
    });

    describe('with email', () => {
      it('should return true if recovery key exists', () => {
        return client.getRecoveryKeyExists(email).then((res) => {
          assert.equal(res.exists, true, 'recovery key exists');
        });
      });

      it("should return false if recovery key doesn't exist", () => {
        email = server.uniqueEmail();
        return Client.createAndVerify(
          config.publicUrl,
          email,
          password,
          server.mailbox,
          { keys: true }
        )
          .then((c) => {
            client = c;
            return client.getRecoveryKeyExists(email);
          })
          .then((res) => {
            assert.equal(res.exists, false, "recovery key doesn't exist");
          });
      });
    });
  });

  after(() => {
    return TestServer.stop(server);
  });
});

function getAccountResetToken(client, server, email) {
  return client
    .forgotPassword()
    .then(() => server.mailbox.waitForCode(email))
    .then((code) =>
      client.verifyPasswordResetCode(
        code,
        {},
        { accountResetWithRecoveryKey: true }
      )
    );
}
