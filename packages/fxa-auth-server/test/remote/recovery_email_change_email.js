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

[ {version:""}, {version:"V2"}].forEach((testOptions) => {

describe(`#integration${testOptions.version} - remote change email`, function () {
  this.timeout(60000);

  before(async () => {
    config = require('../../config').default.getProperties();
    config.securityHistory.ipProfiling = {};
    server = await TestServer.start(config);
  });

  after(async () => {
    await TestServer.stop(server);
  });

  beforeEach(() => {
    email = server.uniqueEmail();
    secondEmail = server.uniqueEmail('@notrestmail.com');

    return Client.createAndVerify(
      config.publicUrl,
      email,
      password,
      server.mailbox,
      testOptions
    )
      .then((x) => {
        client = x;
        assert.ok(client.authAt, 'authAt was set');
      })
      .then(() => {
        return client.emailStatus();
      })
      .then((status) => {
        assert.equal(status.verified, true, 'account is verified');
        return client.createEmail(secondEmail);
      })
      .then((res) => {
        assert.ok(res, 'ok response');
        return server.mailbox.waitForEmail(secondEmail);
      })
      .then((emailData) => {
        const templateName = emailData['headers']['x-template-name'];
        const emailCode = emailData['headers']['x-verify-code'];
        assert.equal(templateName, 'verifySecondaryCode');
        assert.ok(emailCode, 'emailCode set');
        return client.verifySecondaryEmailWithCode(emailCode, secondEmail);
      })
      .then((res) => {
        assert.ok(res, 'ok response');
        return client.accountEmails();
      })
      .then((res) => {
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
        server.mailbox,
        testOptions
      )
        .then((client2) => {
          return client2.createEmail(anotherEmail);
        })
        .then(() => {
          return client.setPrimaryEmail(anotherEmail).then(() => {
            assert.fail(
              'Should not have set email that belongs to another account'
            );
          });
        })
        .catch((err) => {
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
        .catch((err) => {
          assert.equal(err.errno, 147, 'returns correct errno');
          assert.equal(err.code, 400, 'returns correct error code');
        });
    });

    it('can change primary email', () => {
      return client
        .setPrimaryEmail(secondEmail)
        .then((res) => {
          assert.ok(res, 'ok response');
          return client.accountEmails();
        })
        .then((res) => {
          assert.equal(res.length, 2, 'returns number of emails');
          assert.equal(res[0].email, secondEmail, 'returns correct email');
          assert.equal(res[0].isPrimary, true, 'returns correct isPrimary');
          assert.equal(res[0].verified, true, 'returns correct verified');
          assert.equal(res[1].email, email, 'returns correct email');
          assert.equal(res[1].isPrimary, false, 'returns correct isPrimary');
          assert.equal(res[1].verified, true, 'returns correct verified');

          return server.mailbox.waitForEmail(secondEmail);
        })
        .then((emailData) => {
          assert.equal(emailData.headers['to'], secondEmail, 'to email set');
          assert.equal(emailData.headers['cc'], email, 'cc emails set');
          assert.equal(
            emailData.headers['x-template-name'],
            'postChangePrimary'
          );
        });
    });

    it('can login', () => {
      return client
        .setPrimaryEmail(secondEmail)
        .then((res) => {
          assert.ok(res, 'ok response');

          if (testOptions.version === 'V2') {
            // Note for V2 we can login with new primary email. The password is not encrypted with
            // the original email, so this now works!
            return Client.login(
              config.publicUrl,
              secondEmail,
              password,
              testOptions
            );
          } else {
            // Verify account can login with new primary email
            return Client.login(
              config.publicUrl,
              secondEmail,
              password,
              testOptions
            ).then(() => {
              assert.fail(
                new Error(
                  'Should have returned correct email for user to login'
                )
              );
            });
          }
        })
        .catch((err) => {
          // Login should fail for this user and return the normalizedEmail used when
          // the account was created. We then attempt to re-login with this email and pass
          // the original email used to login
          assert.equal(err.code, 400, 'correct error code');
          assert.equal(err.errno, 120, 'correct errno code');
          assert.equal(err.email, email, 'correct hashed email returned');

          return Client.login(config.publicUrl, err.email, password, {
            originalLoginEmail: secondEmail,
            ...testOptions,
          });
        })
        .then((res) => {
          assert.ok(res, 'ok response');
        });
    });

    it('can change password', () => {
      return client
        .setPrimaryEmail(secondEmail)
        .then((res) => {
          assert.ok(res, 'ok response');
          return Client.login(config.publicUrl, email, password, {
            originalLoginEmail: secondEmail,
            ...testOptions,
          });
        })
        .then((res) => {
          client = res;
          return client.changePassword(newPassword);
        })
        .then((res) => {
          assert.ok(res, 'ok response');
          return Client.login(config.publicUrl, email, newPassword, {
            originalLoginEmail: secondEmail,
            ...testOptions,
          });
        })
        .then((res) => {
          assert.ok(res, 'ok response');
        });
    });

    it('can reset password', () => {
      return client
        .setPrimaryEmail(secondEmail)
        .then((res) => {
          assert.ok(res, 'ok response');
          return server.mailbox.waitForEmail(secondEmail);
        })
        .then((emailData) => {
          assert.equal(emailData.headers['to'], secondEmail, 'to email set');
          assert.equal(emailData.headers['cc'], email, 'cc emails set');
          assert.equal(
            emailData.headers['x-template-name'],
            'postChangePrimary'
          );

          client.email = secondEmail;
          return client.forgotPassword();
        })
        .then(() => {
          return server.mailbox.waitForCode(secondEmail);
        })
        .then((code) => {
          assert.ok(code, 'code is set');
          return resetPassword(client, code, newPassword, undefined, {
            emailToHashWith: email,
          });
        })
        .then((res) => {
          assert.ok(res, 'ok response');
        })
        .then(() => {
          if (testOptions.version === 'V2') {
            return Client.upgradeCredentials(
              config.publicUrl,
              email,
              newPassword,
              {
                originalLoginEmail: secondEmail,
                version: '',
                keys: true,
              }
            );
          }
        })
        .then(() => {
          return Client.login(config.publicUrl, email, newPassword, {
            originalLoginEmail: secondEmail,
            ...testOptions,
          });
        })
        .then((res) => {
          assert.ok(res, 'ok response');
        });
    });

    it('can delete account', () => {
      return client
        .setPrimaryEmail(secondEmail)
        .then((res) => {
          assert.ok(res, 'ok response');
          return client.destroyAccount();
        })
        .then(() => {
          return Client.login(config.publicUrl, email, newPassword, {
            originalLoginEmail: secondEmail,
            ...testOptions,
          })
            .then(() => {
              assert.fail(
                'Should not have been able to login after deleting account'
              );
            })
            .catch((err) => {
              assert.equal(err.errno, 102, 'unknown account error code');
              assert.equal(err.email, secondEmail, 'returns correct email');
            });
        });
    });
  });

  it('change primary email with multiple accounts', async () => {
    /**
     * Below tests the following scenario:
     *
     * User A with Email A (primary) and Email A1 (secondary)
     * User B with Email B (primary) and Email B1 (secondary)
     *
     * with changing primary emails etc transform to ==>
     *
     * User A with Email B (primary)
     * User B with Email A (primary)
     *
     * and can successfully login
     */
    let emailData, emailCode;
    const password2 = 'asdf';
    const client1Email = server.uniqueEmail();
    const client1SecondEmail = server.uniqueEmail();
    const client2Email = server.uniqueEmail();
    const client2SecondEmail = server.uniqueEmail();

    const client1 = await Client.createAndVerify(
      config.publicUrl,
      client1Email,
      password,
      server.mailbox,
      testOptions
    );

    // Create a second client
    const client2 = await Client.createAndVerify(
      config.publicUrl,
      client2Email,
      password2,
      server.mailbox,
      testOptions
    );

    // Update client1's email and verify
    await client1.createEmail(client1SecondEmail);
    emailData = await server.mailbox.waitForEmail(client1SecondEmail);
    emailCode = emailData['headers']['x-verify-code'];
    await client1.verifySecondaryEmailWithCode(emailCode, client1SecondEmail);

    // Update client2
    await client2.createEmail(client2SecondEmail);
    emailData = await server.mailbox.waitForEmail(client2SecondEmail);
    emailCode = emailData['headers']['x-verify-code'];
    await client2.verifySecondaryEmailWithCode(emailCode, client2SecondEmail);

    await client1.setPrimaryEmail(client1SecondEmail);
    await client1.deleteEmail(client1Email);

    await client2.setPrimaryEmail(client2SecondEmail);
    await client2.deleteEmail(client2Email);

    await client1.createEmail(client2Email);
    emailData = await server.mailbox.waitForEmail(client2Email);
    emailCode = emailData[2]['headers']['x-verify-code'];
    await client1.verifySecondaryEmailWithCode(emailCode, client2Email);
    await client1.setPrimaryEmail(client2Email);
    await client1.deleteEmail(client1SecondEmail);

    await client2.createEmail(client1Email);
    emailData = await server.mailbox.waitForEmail(client1Email);
    emailCode = emailData[2]['headers']['x-verify-code'];
    await client2.verifySecondaryEmailWithCode(emailCode, client1Email);
    await client2.setPrimaryEmail(client1Email);
    await client2.deleteEmail(client2SecondEmail);

    const res = await Client.login(config.publicUrl, client1Email, password, {
      originalLoginEmail: client2Email,
      ...testOptions,
    });

    assert.ok(res, 'ok response');
  });

  describe('change primary email, deletes old primary', () => {
    beforeEach(() => {
      return client
        .setPrimaryEmail(secondEmail)
        .then((res) => {
          assert.ok(res, 'ok response');
          return server.mailbox.waitForEmail(secondEmail);
        })
        .then((emailData) => {
          assert.equal(emailData.headers['to'], secondEmail, 'to email set');
          assert.equal(emailData.headers['cc'], email, 'cc emails set');
          assert.equal(
            emailData.headers['x-template-name'],
            'postChangePrimary'
          );
          return client.deleteEmail(email);
        })
        .then((res) => {
          assert.ok(res, 'ok response');
          return client.accountEmails();
        })
        .then((res) => {
          assert.equal(res.length, 1, 'returns number of emails');
          assert.equal(res[0].email, secondEmail, 'returns correct email');
          assert.equal(res[0].isPrimary, true, 'returns correct isPrimary');
          assert.equal(res[0].verified, true, 'returns correct verified');

          // Primary account is notified that secondary email has been removed
          return server.mailbox.waitForEmail(secondEmail);
        })
        .then((emailData) => {
          const templateName = emailData['headers']['x-template-name'];
          assert.equal(templateName, 'postRemoveSecondary');
        });
    });

    it('can login', () => {
      if (testOptions.version === 'V2') {
        // Note that with V2 logins, you can actually use the secondary email to login. This is
        // due to the fact the salt is now independent of the original email.
        return Client.login(
          config.publicUrl,
          secondEmail,
          password,
          testOptions
        ).then((res) => {
          assert.exists(res.sessionToken);
        });
      }

      // Verify account can still login with new primary email
      return Client.login(config.publicUrl, secondEmail, password, testOptions)
        .then(() => {
          assert.fail(
            new Error('Should have returned correct email for user to login')
          );
        })
        .catch((err) => {
          // Login should fail for this user and return the normalizedEmail used when
          // the account was created. We then attempt to re-login with this email and pass
          // the original email used to login
          assert.equal(err.code, 400, 'correct error code');
          assert.equal(err.errno, 120, 'correct errno code');
          assert.equal(err.email, email, 'correct hashed email returned');

          return Client.login(config.publicUrl, err.email, password, {
            originalLoginEmail: secondEmail,
            ...testOptions,
          });
        })
        .then((res) => {
          assert.ok(res, 'ok response');
        });
    });

    it('can change password', () => {
      return Client.login(config.publicUrl, email, password, {
        originalLoginEmail: secondEmail,
        ...testOptions,
      })
        .then((res) => {
          client = res;
          return client.changePassword(newPassword);
        })
        .then((res) => {
          assert.ok(res, 'ok response');
          return Client.login(config.publicUrl, email, newPassword, {
            originalLoginEmail: secondEmail,
            ...testOptions,
          });
        })
        .then((res) => {
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
        .then((code) => {
          assert.ok(code, 'code is set');
          return resetPassword(client, code, newPassword, undefined, {
            emailToHashWith: email,
          });
        })
        .then((res) => {
          assert.ok(res, 'ok response');
        })
        .then(() => {
          if (testOptions.version === 'V2') {
            return Client.upgradeCredentials(
              config.publicUrl,
              email,
              newPassword,
              {
                originalLoginEmail: secondEmail,
                version: '',
                keys: true,
              }
            );
          }
        })
        .then(() => {
          return Client.login(config.publicUrl, email, newPassword, {
            originalLoginEmail: secondEmail,
            ...testOptions,
          });
        })
        .then((res) => {
          assert.ok(res, 'ok response');
        });
    });

    it('can delete account', () => {
      return client.destroyAccount().then(() => {
        return Client.login(config.publicUrl, email, newPassword, {
          originalLoginEmail: secondEmail,
          ...testOptions,
        })
          .then(() => {
            assert.fail(
              'Should not have been able to login after deleting account'
            );
          })
          .catch((err) => {
            assert.equal(err.errno, 102, 'unknown account error code');
            assert.equal(err.email, secondEmail, 'returns correct email');
          });
      });
    });
  });



  function resetPassword(client, code, newPassword, headers, options) {
    return client.verifyPasswordResetCode(code, headers, options).then(() => {
      return client.resetPassword(newPassword, {}, options);
    });
  }
});

});
