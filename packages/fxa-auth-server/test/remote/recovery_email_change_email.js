/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const TestServer = require('../test_server');
const Client = require('../client')();

let config, server, client, email, secondEmail;
const password = 'allyourbasearebelongtous',
  newPassword = 'newpassword';

describe('remote change email', function() {
  this.timeout(30000);

  before(() => {
    config = require('../../config').getProperties();
    config.securityHistory.ipProfiling = {};
    return TestServer.start(config).then(s => {
      server = s;
    });
  });

  beforeEach(() => {
    email = server.uniqueEmail();
    secondEmail = server.uniqueEmail('@notrestmail.com');
    return Client.createAndVerify(
      config.publicUrl,
      email,
      password,
      server.mailbox
    )
      .then(x => {
        client = x;
        assert.ok(client.authAt, 'authAt was set');
      })
      .then(() => {
        return client.emailStatus();
      })
      .then(status => {
        assert.equal(status.verified, true, 'account is verified');
        return client.createEmail(secondEmail);
      })
      .then(res => {
        assert.ok(res, 'ok response');
        return server.mailbox.waitForEmail(secondEmail);
      })
      .then(emailData => {
        const templateName = emailData['headers']['x-template-name'];
        const emailCode = emailData['headers']['x-verify-code'];
        assert.equal(
          templateName,
          'verifySecondaryEmail',
          'email template name set'
        );
        assert.ok(emailCode, 'emailCode set');
        return client.verifySecondaryEmail(emailCode, secondEmail);
      })
      .then(res => {
        assert.ok(res, 'ok response');
        return client.accountEmails();
      })
      .then(res => {
        assert.equal(res.length, 2, 'returns number of emails');
        assert.equal(res[1].email, secondEmail, 'returns correct email');
        assert.equal(res[1].isPrimary, false, 'returns correct isPrimary');
        assert.equal(res[1].verified, true, 'returns correct verified');
        return server.mailbox.waitForEmail(email);
      });
  });

  describe('should change primary email', () => {
    it('fails to change email to an that is not owned by user', () => {
      const userEmail2 = server.uniqueEmail();
      const anotherEmail = server.uniqueEmail();
      return Client.createAndVerify(
        config.publicUrl,
        userEmail2,
        password,
        server.mailbox
      )
        .then(client2 => {
          return client2.createEmail(anotherEmail);
        })
        .then(() => {
          return client.setPrimaryEmail(anotherEmail).then(() => {
            assert.fail(
              'Should not have set email that belongs to another account'
            );
          });
        })
        .catch(err => {
          assert.equal(err.errno, 148, 'returns correct errno');
          assert.equal(err.code, 400, 'returns correct error code');
        });
    });

    it('fails to change email to unverified email', () => {
      const someEmail = server.uniqueEmail();
      return client
        .createEmail(someEmail)
        .then(() => {
          return client.setPrimaryEmail(someEmail).then(() => {
            assert.fail('Should not have set email to an unverified email');
          });
        })
        .catch(err => {
          assert.equal(err.errno, 147, 'returns correct errno');
          assert.equal(err.code, 400, 'returns correct error code');
        });
    });

    it('can change primary email', () => {
      return client
        .setPrimaryEmail(secondEmail)
        .then(res => {
          assert.ok(res, 'ok response');
          return client.accountEmails();
        })
        .then(res => {
          assert.equal(res.length, 2, 'returns number of emails');
          assert.equal(res[0].email, secondEmail, 'returns correct email');
          assert.equal(res[0].isPrimary, true, 'returns correct isPrimary');
          assert.equal(res[0].verified, true, 'returns correct verified');
          assert.equal(res[1].email, email, 'returns correct email');
          assert.equal(res[1].isPrimary, false, 'returns correct isPrimary');
          assert.equal(res[1].verified, true, 'returns correct verified');

          return server.mailbox.waitForEmail(secondEmail);
        })
        .then(emailData => {
          assert.equal(emailData.headers['to'], secondEmail, 'to email set');
          assert.equal(emailData.headers['cc'], email, 'cc emails set');
          assert.equal(
            emailData.headers['x-template-name'],
            'postChangePrimaryEmail',
            'returns correct template'
          );
        });
    });

    it('can login', () => {
      return client
        .setPrimaryEmail(secondEmail)
        .then(res => {
          assert.ok(res, 'ok response');

          // Verify account can login with new primary email
          return Client.login(config.publicUrl, secondEmail, password).then(
            () => {
              assert.fail(
                new Error(
                  'Should have returned correct email for user to login'
                )
              );
            }
          );
        })
        .catch(err => {
          // Login should fail for this user and return the normalizedEmail used when
          // the account was created. We then attempt to re-login with this email and pass
          // the original email used to login
          assert.equal(err.code, 400, 'correct error code');
          assert.equal(err.errno, 120, 'correct errno code');
          assert.equal(err.email, email, 'correct hashed email returned');

          return Client.login(config.publicUrl, err.email, password, {
            originalLoginEmail: secondEmail,
          });
        })
        .then(res => {
          assert.ok(res, 'ok response');
        });
    });

    it('can change password', () => {
      return client
        .setPrimaryEmail(secondEmail)
        .then(res => {
          assert.ok(res, 'ok response');
          return Client.login(config.publicUrl, email, password, {
            originalLoginEmail: secondEmail,
          });
        })
        .then(res => {
          client = res;
          return client.changePassword(newPassword);
        })
        .then(res => {
          assert.ok(res, 'ok response');
          return Client.login(config.publicUrl, email, newPassword, {
            originalLoginEmail: secondEmail,
          });
        })
        .then(res => {
          assert.ok(res, 'ok response');
        });
    });

    it('can reset password', () => {
      return client
        .setPrimaryEmail(secondEmail)
        .then(res => {
          assert.ok(res, 'ok response');
          return server.mailbox.waitForEmail(secondEmail);
        })
        .then(emailData => {
          assert.equal(emailData.headers['to'], secondEmail, 'to email set');
          assert.equal(emailData.headers['cc'], email, 'cc emails set');
          assert.equal(
            emailData.headers['x-template-name'],
            'postChangePrimaryEmail',
            'returns correct template'
          );

          client.email = secondEmail;
          return client.forgotPassword();
        })
        .then(() => {
          return server.mailbox.waitForCode(secondEmail);
        })
        .then(code => {
          assert.ok(code, 'code is set');
          return resetPassword(client, code, newPassword, undefined, {
            emailToHashWith: email,
          });
        })
        .then(res => {
          assert.ok(res, 'ok response');
          return Client.login(config.publicUrl, email, newPassword, {
            originalLoginEmail: secondEmail,
          });
        })
        .then(res => {
          assert.ok(res, 'ok response');
        });
    });

    it('can delete account', () => {
      return client
        .setPrimaryEmail(secondEmail)
        .then(res => {
          assert.ok(res, 'ok response');
          return client.destroyAccount();
        })
        .then(() => {
          return Client.login(config.publicUrl, email, newPassword, {
            originalLoginEmail: secondEmail,
          })
            .then(() => {
              assert.fail(
                'Should not have been able to login after deleting account'
              );
            })
            .catch(err => {
              assert.equal(err.errno, 102, 'unknown account error code');
              assert.equal(err.email, email, 'returns correct email');
            });
        });
    });
  });

  describe('change primary email, deletes old primary', () => {
    beforeEach(() => {
      return client
        .setPrimaryEmail(secondEmail)
        .then(res => {
          assert.ok(res, 'ok response');
          return server.mailbox.waitForEmail(secondEmail);
        })
        .then(emailData => {
          assert.equal(emailData.headers['to'], secondEmail, 'to email set');
          assert.equal(emailData.headers['cc'], email, 'cc emails set');
          assert.equal(
            emailData.headers['x-template-name'],
            'postChangePrimaryEmail',
            'returns correct template'
          );
          return client.deleteEmail(email);
        })
        .then(res => {
          assert.ok(res, 'ok response');
          return client.accountEmails();
        })
        .then(res => {
          assert.equal(res.length, 1, 'returns number of emails');
          assert.equal(res[0].email, secondEmail, 'returns correct email');
          assert.equal(res[0].isPrimary, true, 'returns correct isPrimary');
          assert.equal(res[0].verified, true, 'returns correct verified');

          // Primary account is notified that secondary email has been removed
          return server.mailbox.waitForEmail(secondEmail);
        })
        .then(emailData => {
          const templateName = emailData['headers']['x-template-name'];
          assert.equal(
            templateName,
            'postRemoveSecondaryEmail',
            'email template name set'
          );
        });
    });

    it('can login', () => {
      // Verify account can still login with new primary email
      return Client.login(config.publicUrl, secondEmail, password)
        .then(() => {
          assert.fail(
            new Error('Should have returned correct email for user to login')
          );
        })
        .catch(err => {
          // Login should fail for this user and return the normalizedEmail used when
          // the account was created. We then attempt to re-login with this email and pass
          // the original email used to login
          assert.equal(err.code, 400, 'correct error code');
          assert.equal(err.errno, 120, 'correct errno code');
          assert.equal(err.email, email, 'correct hashed email returned');

          return Client.login(config.publicUrl, err.email, password, {
            originalLoginEmail: secondEmail,
          });
        })
        .then(res => {
          assert.ok(res, 'ok response');
        });
    });

    it('can change password', () => {
      return Client.login(config.publicUrl, email, password, {
        originalLoginEmail: secondEmail,
      })
        .then(res => {
          client = res;
          return client.changePassword(newPassword);
        })
        .then(res => {
          assert.ok(res, 'ok response');
          return Client.login(config.publicUrl, email, newPassword, {
            originalLoginEmail: secondEmail,
          });
        })
        .then(res => {
          assert.ok(res, 'ok response');
        });
    });

    it('can reset password', () => {
      client.email = secondEmail;
      return client
        .forgotPassword()
        .then(() => {
          return server.mailbox.waitForCode(secondEmail);
        })
        .then(code => {
          assert.ok(code, 'code is set');
          return resetPassword(client, code, newPassword, undefined, {
            emailToHashWith: email,
          });
        })
        .then(res => {
          assert.ok(res, 'ok response');
          return Client.login(config.publicUrl, email, newPassword, {
            originalLoginEmail: secondEmail,
          });
        })
        .then(res => {
          assert.ok(res, 'ok response');
        });
    });

    it('can delete account', () => {
      return client.destroyAccount().then(() => {
        return Client.login(config.publicUrl, email, newPassword, {
          originalLoginEmail: secondEmail,
        })
          .then(() => {
            assert.fail(
              'Should not have been able to login after deleting account'
            );
          })
          .catch(err => {
            assert.equal(err.errno, 102, 'unknown account error code');
            assert.equal(err.email, email, 'returns correct email');
          });
      });
    });
  });

  after(() => {
    return TestServer.stop(server);
  });

  function resetPassword(client, code, newPassword, headers, options) {
    return client.verifyPasswordResetCode(code, headers, options).then(() => {
      return client.resetPassword(newPassword, {}, options);
    });
  }
});
