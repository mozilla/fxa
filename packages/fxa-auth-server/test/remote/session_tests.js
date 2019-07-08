/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const TestServer = require('../test_server');
const Client = require('../client')();
const P = require('../../lib/promise');
const jwtool = require('fxa-jwtool');
const config = require('../../config').getProperties();
const pubSigKey = jwtool.JWK.fromFile(config.publicKeyFile);
const duration = 1000 * 60 * 60 * 24;
const publicKey = {
  algorithm: 'RS',
  n:
    '4759385967235610503571494339196749614544606692567785790953934768202714280652973091341316862993582789079872007974809511698859885077002492642203267408776123',
  e: '65537',
};

describe('remote session', function() {
  this.timeout(15000);
  let server;
  config.signinConfirmation.skipForNewAccounts.enabled = false;
  before(() => {
    return TestServer.start(config).then(s => {
      server = s;
    });
  });

  describe('destroy', () => {
    it('deletes a valid session', () => {
      const email = server.uniqueEmail();
      const password = 'foobar';
      let client = null;
      let sessionToken = null;
      return Client.createAndVerify(
        config.publicUrl,
        email,
        password,
        server.mailbox
      )
        .then(x => {
          client = x;
          return client.sessionStatus();
        })
        .then(() => {
          sessionToken = client.sessionToken;
          return client.destroySession();
        })
        .then(() => {
          assert.equal(client.sessionToken, null, 'session token deleted');
          client.sessionToken = sessionToken;
          return client.sessionStatus();
        })
        .then(
          status => {
            assert(false, 'got status with destroyed session');
          },
          err => {
            assert.equal(err.errno, 110, 'session is invalid');
          }
        );
    });

    it('deletes a different custom token', () => {
      const email = server.uniqueEmail();
      const password = 'foobar';
      let client = null;
      let tokenId = null;
      let sessionTokenCreate = null;
      let sessionTokenLogin = null;
      return Client.create(config.publicUrl, email, password)
        .then(x => {
          client = x;
          sessionTokenCreate = client.sessionToken;
          return client.api.sessions(sessionTokenCreate);
        })
        .then(sessions => {
          tokenId = sessions[0].id;
          return client.login();
        })
        .then(c => {
          sessionTokenLogin = c.sessionToken;
          return client.api.sessionStatus(sessionTokenCreate);
        })
        .then(status => {
          assert.ok(status.uid, 'got valid session');

          return client.api.sessionDestroy(sessionTokenLogin, {
            customSessionToken: tokenId,
          });
        })
        .then(() => {
          return client.api.sessionStatus(sessionTokenCreate);
        })
        .then(
          status => {
            assert(false, 'got status with destroyed session');
          },
          err => {
            assert.equal(err.code, 401);
            assert.equal(err.errno, 110, 'session is invalid');
          }
        );
    });

    it('fails with a bad custom token', () => {
      const email = server.uniqueEmail();
      const password = 'foobar';
      let client = null;
      let sessionTokenCreate = null;
      let sessionTokenLogin = null;
      return Client.create(config.publicUrl, email, password)
        .then(x => {
          client = x;
          sessionTokenCreate = client.sessionToken;
          return client.login();
        })
        .then(c => {
          sessionTokenLogin = c.sessionToken;
          return client.api.sessionStatus(sessionTokenCreate);
        })
        .then(() => {
          return client.api.sessionDestroy(sessionTokenLogin, {
            customSessionToken:
              'eff779f59ab974f800625264145306ce53185bb22ee01fe80280964ff2766504',
          });
        })
        .then(() => {
          return client.api.sessionStatus(sessionTokenCreate);
        })
        .then(
          status => {
            assert(false, 'got status with destroyed session');
          },
          err => {
            assert.equal(err.code, 401);
            assert.equal(err.errno, 110, 'session is invalid');
            assert.equal(err.error, 'Unauthorized');
            assert.equal(
              err.message,
              'The authentication token could not be found'
            );
          }
        );
    });
  });

  describe('duplicate', () => {
    it('duplicates a valid session into a new, independent session', () => {
      const email = server.uniqueEmail();
      const password = 'foobar';
      let client1, client2;
      return Client.createAndVerify(
        config.publicUrl,
        email,
        password,
        server.mailbox
      )
        .then(x => {
          client1 = x;
          return client1.duplicate();
        })
        .then(x => {
          client2 = x;
          assert.notEqual(
            client1.sessionToken,
            client2.sessionToken,
            'generated a new sessionToken'
          );
          return client1.api.sessionDestroy(client1.sessionToken);
        })
        .then(() => {
          return client1.sessionStatus();
        })
        .then(
          () => {
            assert.fail('client1 session should have been destroyed');
          },
          err => {
            assert.equal(err.code, 401);
            assert.equal(err.errno, 110);
          }
        )
        .then(() => {
          return client2.sessionStatus();
        })
        .then(status => {
          assert.ok(status, 'client2 session is still alive');
          return client2.api.sessionDestroy(client2.sessionToken);
        })
        .then(() => {
          return client2.sessionStatus();
        })
        .then(
          () => {
            assert.fail('client2 session should have been destroyed');
          },
          err => {
            assert.equal(err.code, 401);
            assert.equal(err.errno, 110);
          }
        );
    });

    it('creates independent verification state for the new token', () => {
      const email = server.uniqueEmail();
      const password = 'foobar';
      let client1, client2, client3;
      return Client.create(config.publicUrl, email, password, server.mailbox)
        .then(x => {
          client1 = x;
          return client1.duplicate();
        })
        .then(x => {
          client2 = x;
          assert.ok(!client1.verified, 'client1 session is not verified');
          assert.ok(!client2.verified, 'client2 session is not verified');
          return server.mailbox.waitForCode(email);
        })
        .then(code => {
          return client1.verifyEmail(code);
        })
        .then(() => {
          return client1.sessionStatus();
        })
        .then(status => {
          assert.equal(
            status.state,
            'verified',
            'client1 session has become verified'
          );
          return client2.sessionStatus();
        })
        .then(status => {
          assert.equal(
            status.state,
            'unverified',
            'client2 session has remained unverified'
          );
          return client2.duplicate();
        })
        .then(x => {
          client3 = x;
          return client2.requestVerifyEmail();
        })
        .then(() => {
          return server.mailbox.waitForCode(email);
        })
        .then(code => {
          return client2.verifyEmail(code);
        })
        .then(() => {
          return client2.sessionStatus();
        })
        .then(status => {
          assert.equal(
            status.state,
            'verified',
            'client2 session has become verified'
          );
          return client3.sessionStatus();
        })
        .then(status => {
          assert.ok(
            status.state,
            'unverified',
            'client3 session has remained unverified'
          );
        });
    });
  });

  describe('reauth', () => {
    it('allocates a new keyFetchToken', () => {
      const email = server.uniqueEmail();
      const password = 'foobar';
      let client, kA, kB;
      return Client.createAndVerify(
        config.publicUrl,
        email,
        password,
        server.mailbox,
        { keys: true }
      )
        .then(x => {
          client = x;
          return client.keys();
        })
        .then(keys => {
          kA = keys.kA;
          kB = keys.kB;
          assert.equal(
            client.keyFetchToken,
            null,
            'keyFetchToken was consumed'
          );
          return client.reauth({ keys: true });
        })
        .then(() => {
          assert.ok(client.keyFetchToken, 'got a new keyFetchToken');
          return client.keys();
        })
        .then(keys => {
          assert.equal(keys.kA, kA, 'kA was fetched successfully');
          assert.equal(keys.kB, kB, 'kB was fetched successfully');
          assert.equal(
            client.keyFetchToken,
            null,
            'keyFetchToken was consumed'
          );
        });
    });

    it('updates the last-auth time', () => {
      const email = server.uniqueEmail();
      const password = 'foobar';
      let client, lastAuth1, lastAuth2;
      return Client.createAndVerify(
        config.publicUrl,
        email,
        password,
        server.mailbox
      )
        .then(x => {
          client = x;
        })
        .then(() => {
          return client.sign(publicKey, duration);
        })
        .then(cert => {
          const payload = jwtool.verify(cert, pubSigKey.pem);
          assert.equal(
            payload.principal.email.split('@')[0],
            client.uid,
            'cert has correct uid'
          );
          lastAuth1 = payload['fxa-lastAuthAt'];
          return P.delay(1000);
        })
        .then(() => {
          return client.reauth();
        })
        .then(() => {
          return client.sign(publicKey, duration);
        })
        .then(cert => {
          const payload = jwtool.verify(cert, pubSigKey.pem);
          assert.equal(
            payload.principal.email.split('@')[0],
            client.uid,
            'cert has correct uid'
          );
          lastAuth2 = payload['fxa-lastAuthAt'];
          assert.ok(lastAuth1 < lastAuth2, 'last-auth timestamp increased');
        });
    });

    it('rejects incorrect passwords', () => {
      const email = server.uniqueEmail();
      const password = 'foobar';
      let client;
      return Client.createAndVerify(
        config.publicUrl,
        email,
        password,
        server.mailbox
      )
        .then(x => {
          client = x;
        })
        .then(() => {
          return client.setupCredentials(email, 'fiibar');
        })
        .then(() => {
          return client.reauth();
        })
        .then(
          () => {
            assert.fail('password should have been rejected');
          },
          err => {
            assert.equal(err.code, 400);
            assert.equal(err.errno, 103);
          }
        );
    });

    it('has sane account-verification behaviour', () => {
      const email = server.uniqueEmail();
      const password = 'foobar';
      let client;
      return Client.create(config.publicUrl, email, password, server.mailbox)
        .then(x => {
          client = x;
          assert.ok(!client.verified, 'account is not verified');
          // Clear the verification email, without verifying.
          return server.mailbox.waitForCode(email);
        })
        .then(() => {
          return client.reauth();
        })
        .then(() => {
          return client.sessionStatus();
        })
        .then(status => {
          assert.equal(
            status.state,
            'unverified',
            'client session is still unverified'
          );
        })
        .then(() => {
          // The reauth should have triggerd a second email.
          return server.mailbox.waitForCode(email);
        })
        .then(code => {
          return client.verifyEmail(code);
        })
        .then(() => {
          return client.sessionStatus();
        })
        .then(status => {
          assert.equal(
            status.state,
            'verified',
            'client session has become verified'
          );
        });
    });

    it('has sane session-verification behaviour', () => {
      const email = server.uniqueEmail();
      const password = 'foobar';
      let client;
      return Client.createAndVerify(
        config.publicUrl,
        email,
        password,
        server.mailbox,
        { keys: false }
      )
        .then(() => {
          return Client.login(config.publicUrl, email, password, {
            keys: false,
          });
        })
        .then(x => {
          client = x;
          return client.sessionStatus();
        })
        .then(status => {
          assert.equal(
            status.state,
            'unverified',
            'client session reports unverified'
          );
          return client.emailStatus();
        })
        .then(status => {
          assert.equal(
            status.verified,
            true,
            'email status reports verified, because mustVerify=false'
          );
          return client.reauth({ keys: true });
        })
        .then(() => {
          return client.sessionStatus();
        })
        .then(status => {
          assert.equal(
            status.state,
            'unverified',
            'client session still reports unverified'
          );
          return client.emailStatus();
        })
        .then(status => {
          assert.equal(
            status.verified,
            false,
            'email status now reports unverified, because mustVerify=true'
          );
          // The reauth should have triggerd a verification email.
          return server.mailbox.waitForCode(email);
        })
        .then(code => {
          return client.verifyEmail(code);
        })
        .then(() => {
          return client.sessionStatus();
        })
        .then(status => {
          assert.equal(
            status.state,
            'verified',
            'client session has become verified'
          );
          return client.emailStatus();
        })
        .then(status => {
          assert.equal(
            status.verified,
            true,
            'email status is now verified, because session is verified'
          );
        });
    });

    it('does not send notification emails on verified sessions', () => {
      const email = server.uniqueEmail();
      const password = 'foobar';
      let client;
      return Client.createAndVerify(
        config.publicUrl,
        email,
        password,
        server.mailbox,
        { keys: true }
      )
        .then(x => {
          client = x;
          return client.reauth({ keys: true });
        })
        .then(() => {
          // Send some other type of email, and assert that it's the one we get back.
          // If the above sent a "new login" notification, we would get that instead.
          return client.forgotPassword();
        })
        .then(() => {
          return server.mailbox.waitForEmail(email);
        })
        .then(msg => {
          assert.ok(
            msg.headers['x-recovery-code'],
            'the next email was the password-reset email'
          );
        });
    });
  });

  describe('status', () => {
    it('succeeds with valid token', () => {
      const email = server.uniqueEmail();
      const password = 'testx';
      let uid = null;
      return Client.createAndVerify(
        config.publicUrl,
        email,
        password,
        server.mailbox
      )
        .then(c => {
          uid = c.uid;
          return c.login().then(() => {
            return c.api.sessionStatus(c.sessionToken);
          });
        })
        .then(x => {
          assert.deepEqual(x, {
            state: 'unverified',
            uid: uid,
          });
        });
    });

    it('errors with invalid token', () => {
      const client = new Client(config.publicUrl);
      return client.api
        .sessionStatus(
          '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF'
        )
        .then(
          () => assert(false),
          err => {
            assert.equal(err.errno, 110, 'invalid token');
          }
        );
    });
  });

  after(() => {
    return TestServer.stop(server);
  });
});
