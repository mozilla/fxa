/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const assert = require('assert');
const Client = require('../client')();
const crypto = require('crypto');
const TestServer = require('../test_server');

const config = require('../../config').getProperties();

describe('remote account login', () => {
  let server;

  before(function () {
    this.timeout(15000);
    config.securityHistory.ipProfiling.allowedRecency = 0;
    config.signinConfirmation.skipForNewAccounts.enabled = false;
    return TestServer.start(config).then((s) => {
      server = s;
    });
  });

  it('the email is returned in the error on Incorrect password errors', () => {
    const email = server.uniqueEmail();
    const password = 'abcdef';
    return Client.createAndVerify(
      config.publicUrl,
      email,
      password,
      server.mailbox
    )
      .then(() => {
        return Client.login(config.publicUrl, email, `${password}x`);
      })
      .then(
        () => assert(false),
        (err) => {
          assert.equal(err.code, 400);
          assert.equal(err.errno, 103);
          assert.equal(err.email, email);
        }
      );
  });

  it('the email is returned in the error on Incorrect email case errors with correct password', () => {
    const signupEmail = server.uniqueEmail();
    const loginEmail = signupEmail.toUpperCase();
    const password = 'abcdef';
    return Client.createAndVerify(
      config.publicUrl,
      signupEmail,
      password,
      server.mailbox
    )
      .then(() => {
        return Client.login(config.publicUrl, loginEmail, password);
      })
      .then(
        () => assert(false),
        (err) => {
          assert.equal(err.code, 400);
          assert.equal(err.errno, 120);
          assert.equal(err.email, signupEmail);
        }
      );
  });

  it('Unknown account should not exist', () => {
    const client = new Client(config.publicUrl);
    client.email = server.uniqueEmail();
    client.authPW = crypto.randomBytes(32);
    return client.login().then(
      () => {
        assert(false, 'account should not exist');
      },
      (err) => {
        assert.equal(err.errno, 102, 'account does not exist');
      }
    );
  });

  it('No keyFetchToken without keys=true', () => {
    const email = server.uniqueEmail();
    const password = 'abcdef';
    return Client.createAndVerify(
      config.publicUrl,
      email,
      password,
      server.mailbox
    )
      .then((c) => {
        return Client.login(config.publicUrl, email, password, { keys: false });
      })
      .then((c) => {
        assert.equal(c.keyFetchToken, null, 'should not have keyFetchToken');
      });
  });

  it('login works with unicode email address', () => {
    const email = server.uniqueUnicodeEmail();
    const password = 'wibble';
    return Client.createAndVerify(
      config.publicUrl,
      email,
      password,
      server.mailbox
    )
      .then(() => {
        return Client.login(config.publicUrl, email, password);
      })
      .then((client) => {
        assert.ok(client, 'logged in to account');
      });
  });

  it('account login works with minimal metricsContext metadata', () => {
    const email = server.uniqueEmail();
    return Client.createAndVerify(
      config.publicUrl,
      email,
      'foo',
      server.mailbox
    )
      .then(() => {
        return Client.login(config.publicUrl, email, 'foo', {
          metricsContext: {
            flowId:
              '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
            flowBeginTime: Date.now(),
          },
        });
      })
      .then((client) => {
        assert.ok(client, 'logged in to account');
      });
  });

  it('account login fails with invalid metricsContext flowId', () => {
    const email = server.uniqueEmail();
    return Client.createAndVerify(
      config.publicUrl,
      email,
      'foo',
      server.mailbox
    )
      .then(() => {
        return Client.login(config.publicUrl, email, 'foo', {
          metricsContext: {
            flowId:
              '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0',
            flowBeginTime: Date.now(),
          },
        });
      })
      .then(
        () => {
          assert(false, 'account login should have failed');
        },
        (err) => {
          assert.ok(err, 'account login failed');
        }
      );
  });

  it('account login fails with invalid metricsContext flowBeginTime', () => {
    const email = server.uniqueEmail();
    return Client.createAndVerify(
      config.publicUrl,
      email,
      'foo',
      server.mailbox
    )
      .then(() => {
        return Client.login(config.publicUrl, email, 'foo', {
          metricsContext: {
            flowId:
              '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
            flowBeginTime: 'wibble',
          },
        });
      })
      .then(
        () => {
          assert(false, 'account login should have failed');
        },
        (err) => {
          assert.ok(err, 'account login failed');
        }
      );
  });

  describe('can use verificationMethod', () => {
    let client, email;
    const password = 'foo';
    beforeEach(() => {
      email = server.uniqueEmail('@mozilla.com');
      return Client.createAndVerify(
        config.publicUrl,
        email,
        password,
        server.mailbox
      );
    });

    it('fails with invalid verification method', () => {
      return Client.login(config.publicUrl, email, password, {
        verificationMethod: 'notvalid',
        keys: true,
      }).then(
        () => {
          assert.fail('should not have succeed');
        },
        (err) => {
          assert.equal(err.errno, 107, 'invalid parameter');
        }
      );
    });

    it('can use `email` verification', () => {
      return Client.login(config.publicUrl, email, password, {
        verificationMethod: 'email',
        keys: true,
      })
        .then((res) => {
          client = res;
          assert.equal(
            res.verificationMethod,
            'email',
            'sets correct verification method'
          );
          return client.emailStatus();
        })
        .then((status) => {
          assert.equal(status.verified, false, 'account is not verified');
          assert.equal(status.emailVerified, true, 'email is verified');
          assert.equal(
            status.sessionVerified,
            false,
            'session is not verified'
          );
          return server.mailbox.waitForEmail(email);
        })
        .then((emailData) => {
          assert.equal(emailData.headers['x-template-name'], 'verifyLogin');
          const code = emailData.headers['x-verify-code'];
          assert.ok(code, 'code is sent');
          return client.verifyEmail(code);
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

    it('can use `email-2fa` verification', () => {
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
          assert.equal(
            status.sessionVerified,
            false,
            'session is not verified'
          );
          return server.mailbox.waitForEmail(email);
        })
        .then((emailData) => {
          assert.equal(emailData.headers['x-template-name'], 'verifyLoginCode');
          const code = emailData.headers['x-signin-verify-code'];
          assert.ok(code, 'code is sent');
        });
    });

    it('can use `totp-2fa` verification', () => {
      email = server.uniqueEmail();
      return Client.createAndVerifyAndTOTP(
        config.publicUrl,
        email,
        password,
        server.mailbox,
        { keys: true }
      )
        .then(() => {
          return Client.login(config.publicUrl, email, password, {
            verificationMethod: 'totp-2fa',
            keys: true,
          });
        })
        .then((res) => {
          client = res;
          assert.equal(
            res.verificationMethod,
            'totp-2fa',
            'sets correct verification method'
          );
          return client.emailStatus();
        })
        .then((status) => {
          assert.equal(status.verified, false, 'account is not verified');
          assert.equal(status.emailVerified, true, 'email is verified');
          assert.equal(
            status.sessionVerified,
            false,
            'session is not verified'
          );
        });
    });

    it('should ignore verificationMethod if not requesting keys', () => {
      return Client.login(config.publicUrl, email, password, {
        verificationMethod: 'email',
        keys: false,
      })
        .then((res) => {
          client = res;
          assert.equal(
            res.verificationMethod,
            undefined,
            'sets correct verification method'
          );
          return client.emailStatus();
        })
        .then((status) => {
          assert.equal(status.verified, true, 'account is verified');
          assert.equal(status.emailVerified, true, 'email is verified');
          assert.equal(
            status.sessionVerified,
            false,
            'session is not verified'
          );
        });
    });
  });

  after(() => {
    return TestServer.stop(server);
  });
});
