/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const config = require('../../config').getProperties();
const TestServer = require('../test_server');
const Client = require('../client')();
const error = require('../../lib/error');

describe('remote tokenCodes', function () {
  let server, client, email, code;
  const password = 'pssssst';

  this.timeout(10000);

  before(() => {
    return TestServer.start(config).then((s) => {
      server = s;
    });
  });

  beforeEach(() => {
    email = server.uniqueEmail('@mozilla.com');
    return Client.createAndVerify(
      config.publicUrl,
      email,
      password,
      server.mailbox
    ).then((x) => {
      client = x;
      assert.ok(client.authAt, 'authAt was set');
    });
  });

  it('should error with invalid code', () => {
    return Client.login(config.publicUrl, email, password, {
      verificationMethod: 'email-2fa',
      keys: true,
    })
      .then((res) => {
        client = res;
        assert.equal(
          res.verificationMethod,
          'email-2fa',
          'sets correct verification method'
        );
        return client.verifyShortCodeEmail('011001');
      })
      .then(
        () => {
          assert.fail('consumed invalid code');
        },
        (err) => {
          assert.equal(
            err.errno,
            error.ERRNO.INVALID_EXPIRED_OTP_CODE,
            'correct errno'
          );
          return client.emailStatus();
        }
      )
      .then((status) => {
        assert.equal(status.verified, false, 'account is not verified');
        assert.equal(status.emailVerified, true, 'email is verified');
        assert.equal(status.sessionVerified, false, 'session is not verified');
      });
  });

  it('should error with invalid request param when using wrong code format', () => {
    return Client.login(config.publicUrl, email, password, {
      verificationMethod: 'email-2fa',
      keys: true,
    })
      .then((res) => {
        client = res;
        assert.equal(
          res.verificationMethod,
          'email-2fa',
          'sets correct verification method'
        );
        return client.verifyShortCodeEmail('Cool Runnings 4 u');
      })
      .then(
        () => {
          assert.fail('consumed invalid code');
        },
        (err) => {
          assert.equal(
            err.errno,
            error.ERRNO.INVALID_PARAMETER,
            'correct errno'
          );
          return client.emailStatus();
        }
      )
      .then((status) => {
        assert.equal(status.verified, false, 'account is not verified');
        assert.equal(status.emailVerified, true, 'email is verified');
        assert.equal(status.sessionVerified, false, 'session is not verified');
      });
  });

  it('should consume valid code', () => {
    return Client.login(config.publicUrl, email, password, {
      verificationMethod: 'email-2fa',
      keys: true,
    })
      .then((res) => {
        client = res;
        assert.equal(
          res.verificationMethod,
          'email-2fa',
          'sets correct verification method'
        );
        return client.emailStatus();
      })
      .then((status) => {
        assert.equal(status.verified, false, 'account is not verified');
        assert.equal(status.emailVerified, true, 'email is verified');
        assert.equal(status.sessionVerified, false, 'session is not verified');
        return server.mailbox.waitForEmail(email);
      })
      .then((emailData) => {
        assert.equal(emailData.headers['x-template-name'], 'verifyLoginCode');
        code = emailData.headers['x-signin-verify-code'];
        assert.ok(code, 'code is sent');
        return client.verifyShortCodeEmail(code);
      })
      .then((res) => {
        assert.ok(res, 'verified successful response');
        return client.emailStatus();
      })
      .then((status) => {
        assert.equal(status.verified, true, 'account is verified');
        assert.equal(status.emailVerified, true, 'email is verified');
        assert.equal(status.sessionVerified, true, 'session is verified');
      });
  });

  it('should accept optional uid parameter in request body', () => {
    return Client.login(config.publicUrl, email, password, {
      verificationMethod: 'email-2fa',
      keys: true,
    })
      .then((res) => {
        client = res;
        return server.mailbox.waitForEmail(email);
      })
      .then((emailData) => {
        assert.equal(emailData.headers['x-template-name'], 'verifyLoginCode');
        code = emailData.headers['x-signin-verify-code'];
        assert.ok(code, 'code is sent');
        return client.verifyShortCodeEmail(code, { uid: client.uid });
      })
      .then((res) => {
        assert.ok(res, 'verified successful response');
        return client.emailStatus();
      })
      .then((status) => {
        assert.equal(status.verified, true, 'account is verified');
        assert.equal(status.emailVerified, true, 'email is verified');
        assert.equal(status.sessionVerified, true, 'session is verified');
      });
  });

  it('should retrieve account keys', () => {
    return Client.login(config.publicUrl, email, password, {
      verificationMethod: 'email-2fa',
      keys: true,
    })
      .then((res) => {
        client = res;
        return server.mailbox.waitForEmail(email);
      })
      .then((emailData) => {
        assert.equal(emailData.headers['x-template-name'], 'verifyLoginCode');
        code = emailData.headers['x-signin-verify-code'];
        assert.ok(code, 'code is sent');
        return client.verifyShortCodeEmail(code);
      })
      .then((res) => {
        assert.ok(res, 'verified successful response');

        return client.keys();
      })
      .then((keys) => {
        assert.ok(keys.kA, 'has kA keys');
        assert.ok(keys.kB, 'has kB keys');
        assert.ok(keys.wrapKb, 'has wrapKb keys');
      });
  });

  it('should resend authentication code', async () => {
    await Client.login(config.publicUrl, email, password, {
      verificationMethod: 'email-2fa',
      keys: true,
    });

    let emailData = await server.mailbox.waitForEmail(email);
    const originalMessageId = emailData['messageId'];
    const originalCode = emailData.headers['x-verify-short-code'];

    assert.equal(emailData.headers['x-template-name'], 'verifyLoginCode');
    assert.include(emailData.html, 'IP address');

    await client.resendVerifyShortCodeEmail();

    emailData = await server.mailbox.waitForEmail(email);
    assert.equal(emailData.headers['x-template-name'], 'verifyLoginCode');
    assert.include(emailData.html, 'IP address');

    assert.notEqual(
      originalMessageId,
      emailData['messageId'],
      'different email was sent'
    );
    assert.equal(
      originalCode,
      emailData.headers['x-verify-short-code'],
      'codes match'
    );
  });

  after(() => {
    return TestServer.stop(server);
  });
});
