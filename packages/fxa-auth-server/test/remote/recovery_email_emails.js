/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const TestServer = require('../test_server');
const Client = require('../client')();
const ERRNO = require('../../lib/error').ERRNO;

let config, server, client, email;
const password = 'allyourbasearebelongtous';

function includes(haystack, needle) {
  return haystack.indexOf(needle) > -1;
}

describe('remote emails', function () {
  this.timeout(30000);

  before(() => {
    config = require('../../config').getProperties();
    config.securityHistory.ipProfiling = {};
    config.signinConfirmation.skipForNewAccounts.enabled = false;

    return TestServer.start(config).then((s) => {
      server = s;
    });
  });

  beforeEach(() => {
    email = server.uniqueEmail();
    return Client.createAndVerify(
      config.publicUrl,
      email,
      password,
      server.mailbox
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
      });
  });

  describe('should create and get additional email', () => {
    it('can create', () => {
      const secondEmail = server.uniqueEmail();
      const thirdEmail = server.uniqueEmail();
      return client
        .accountEmails()
        .then((res) => {
          assert.equal(res.length, 1, 'returns number of emails');
          assert.equal(res[0].email, email, 'returns correct email');
          assert.equal(res[0].isPrimary, true, 'returns correct isPrimary');
          assert.equal(res[0].verified, true, 'returns correct verified');
          return client.createEmail(secondEmail);
        })
        .then((res) => {
          assert.ok(res, 'ok response');
          return client.accountEmails();
        })
        .then((res) => {
          assert.equal(res.length, 2, 'returns number of emails');
          assert.equal(res[1].email, secondEmail, 'returns correct email');
          assert.equal(res[1].isPrimary, false, 'returns correct isPrimary');
          assert.equal(res[1].verified, false, 'returns correct verified');
          return client.createEmail(thirdEmail);
        })
        .then((res) => {
          assert.ok(res, 'ok response');
          return client.accountEmails();
        })
        .then((res) => {
          assert.equal(res.length, 3, 'returns number of emails');
          assert.equal(res[2].email, thirdEmail, 'returns correct email');
          assert.equal(res[2].isPrimary, false, 'returns correct isPrimary');
          assert.equal(res[2].verified, false, 'returns correct verified');
        })
        .catch((err) => {
          assert.fail(err);
        });
    });

    it('can create email if email is unverified on another account', () => {
      let client2;
      const clientEmail = server.uniqueEmail();
      const secondEmail = server.uniqueEmail();
      return client
        .createEmail(secondEmail)
        .then((res) => {
          assert.ok(res, 'ok response');
          return server.mailbox.waitForEmail(secondEmail);
        })
        .then(() => {
          return client.accountEmails();
        })
        .then((res) => {
          assert.equal(res.length, 2, 'returns number of emails');
          assert.equal(res[1].email, secondEmail, 'returns correct email');
          assert.equal(res[1].isPrimary, false, 'returns correct isPrimary');
          assert.equal(res[1].verified, false, 'returns correct verified');
          return Client.createAndVerify(
            config.publicUrl,
            clientEmail,
            password,
            server.mailbox
          ).catch(assert.fail);
        })
        .then((x) => {
          client2 = x;
          assert.equal(
            client2.email,
            clientEmail,
            'account created with email'
          );
          return client2.createEmail(secondEmail);
        })
        .then((res) => {
          assert.ok(res, 'ok response');
          return client.accountEmails();
        })
        .then((res) => {
          // Secondary email on first account should have been deleted
          assert.equal(res.length, 1, 'returns number of emails');
          assert.equal(res[0].email, client.email, 'returns correct email');
          assert.equal(res[0].isPrimary, true, 'returns correct isPrimary');
          assert.equal(res[0].verified, true, 'returns correct verified');
          return client2.accountEmails();
        })
        .then((res) => {
          // Secondary email should be on the second account
          assert.equal(res.length, 2, 'returns number of emails');
          assert.equal(res[1].email, secondEmail, 'returns correct email');
          assert.equal(res[1].isPrimary, false, 'returns correct isPrimary');
          assert.equal(res[1].verified, false, 'returns correct verified');
        });
    });

    it('fails create when email is user primary email', () => {
      return client
        .createEmail(email)
        .then(assert.fail)
        .catch((err) => {
          assert.equal(err.errno, 139, 'email already exists errno');
          assert.equal(err.code, 400, 'email already exists code');
          assert.equal(
            err.message,
            'Can not add secondary email that is same as your primary',
            'correct error message'
          );
        });
    });

    it('fails create when email exists in user emails', () => {
      const secondEmail = server.uniqueEmail();
      return client
        .createEmail(secondEmail)
        .then((res) => {
          assert.ok(res, 'ok response');
          return client.createEmail(secondEmail);
        })
        .then(assert.fail)
        .catch((err) => {
          assert.equal(err.errno, 189, 'email already exists errno');
          assert.equal(err.code, 400, 'email already exists code');
          assert.equal(
            err.message,
            'This email already exists on your account',
            'correct error message'
          );
        });
    });

    it('fails create when verified secondary email exists in other user account', () => {
      const anotherUserEmail = server.uniqueEmail();
      const anotherUserSecondEmail = server.uniqueEmail();
      let anotherClient;
      return Client.createAndVerify(
        config.publicUrl,
        anotherUserEmail,
        password,
        server.mailbox
      )
        .then((x) => {
          anotherClient = x;
          assert.ok(client.authAt, 'authAt was set');
          return anotherClient.createEmail(anotherUserSecondEmail);
        })
        .then(() => {
          return server.mailbox.waitForEmail(anotherUserSecondEmail);
        })
        .then((emailData) => {
          const emailCode = emailData['headers']['x-verify-code'];
          return anotherClient.verifySecondaryEmail(
            emailCode,
            anotherUserSecondEmail
          );
        })
        .then((res) => {
          assert.ok(res, 'ok response');
          return client.createEmail(anotherUserSecondEmail).then(assert.fail);
        })
        .catch((err) => {
          assert.equal(err.errno, 136, 'email already exists errno');
          assert.equal(err.code, 400, 'email already exists code');
          assert.equal(
            err.message,
            'Email already exists',
            'correct error message'
          );
        });
    });

    it('fails for unverified session', () => {
      const secondEmail = server.uniqueEmail();
      return client
        .login()
        .then(() => {
          return client.accountEmails();
        })
        .then((res) => {
          assert.equal(res.length, 1, 'returns number of emails');
          assert.equal(res[0].email, email, 'returns correct email');
          assert.equal(res[0].isPrimary, true, 'returns correct isPrimary');
          assert.equal(res[0].verified, true, 'returns correct verified');
          return client.createEmail(secondEmail).then(() => {
            assert.fail(new Error('Should not have created email'));
          });
        })
        .catch((err) => {
          assert.equal(err.code, 400, 'correct error code');
          assert.equal(
            err.errno,
            138,
            'correct error errno unverified session'
          );
        });
    });

    it('fails create when email is another users verified primary', () => {
      const anotherUserEmail = server.uniqueEmail();
      return Client.createAndVerify(
        config.publicUrl,
        anotherUserEmail,
        password,
        server.mailbox
      )
        .then(() => {
          return client.createEmail(anotherUserEmail);
        })
        .then(assert.fail)
        .catch((err) => {
          assert.equal(err.errno, 140, 'email already exists errno');
          assert.equal(err.code, 400, 'email already exists code');
          assert.equal(
            err.message,
            'Email already exists',
            'correct error message'
          );
        });
    });
  });

  describe('should verify additional email', () => {
    let secondEmail;
    beforeEach(() => {
      secondEmail = server.uniqueEmail();
      return client
        .createEmail(secondEmail)
        .then((res) => {
          assert.ok(res, 'ok response');
          return client.accountEmails();
        })
        .then((res) => {
          assert.equal(res.length, 2, 'returns number of emails');
          assert.equal(res[1].email, secondEmail, 'returns correct email');
          assert.equal(res[1].isPrimary, false, 'returns correct isPrimary');
          assert.equal(res[1].verified, false, 'returns correct verified');
        });
    });

    it('can verify', () => {
      return server.mailbox
        .waitForEmail(secondEmail)
        .then((emailData) => {
          const templateName = emailData['headers']['x-template-name'];
          const emailCode = emailData['headers']['x-verify-code'];
          const verifyLink = emailData['headers']['x-link'];
          assert.equal(templateName, 'verifySecondary');

          assert.equal(
            includes(verifyLink, 'type=secondary'),
            true,
            'contains type=secondary'
          );
          const secondaryEmailParam = `secondary_email_verified=${encodeURIComponent(
            secondEmail
          )}`;
          assert.equal(
            includes(verifyLink, secondaryEmailParam),
            true,
            'contains correct secondary_email_verified'
          );

          assert.ok(emailCode, 'emailCode set');
          return client.verifySecondaryEmail(emailCode, secondEmail);
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
        })
        .then((emailData) => {
          const templateName = emailData['headers']['x-template-name'];
          assert.equal(templateName, 'postVerifySecondary');
        });
    });

    it('does not verify on random email code', () => {
      return server.mailbox
        .waitForEmail(secondEmail)
        .then((emailData) => {
          const templateName = emailData['headers']['x-template-name'];
          const emailCode = emailData['headers']['x-verify-code'];
          assert.equal(templateName, 'verifySecondary');
          assert.ok(emailCode, 'emailCode set');
          return client.verifySecondaryEmail(
            'd092f3155ec8d534a7ee7f53b68e9e8b',
            secondEmail
          );
        })
        .then(assert.fail)
        .catch((err) => {
          assert.equal(err.errno, 105, 'correct error errno');
          assert.equal(err.code, 400, 'correct error code');
        });
    });

    it('can resend verify email code for added address', () => {
      let emailCode;
      return server.mailbox
        .waitForEmail(secondEmail)
        .then((emailData) => {
          const templateName = emailData['headers']['x-template-name'];
          emailCode = emailData['headers']['x-verify-code'];
          assert.equal(templateName, 'verifySecondary');
          assert.ok(emailCode, 'emailCode set');
          client.options.email = secondEmail;
          return client.requestVerifyEmail();
        })
        .then((res) => {
          assert.ok(res, 'ok response');
          return server.mailbox.waitForEmail(secondEmail);
        })
        .then((emailData) => {
          const templateName = emailData['headers']['x-template-name'];
          const resendEmailCode = emailData['headers']['x-verify-code'];
          assert.equal(templateName, 'verifySecondary');
          assert.equal(resendEmailCode, emailCode, 'emailCode matches');
          return client.verifySecondaryEmail(emailCode, secondEmail);
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
        });
    });
  });

  describe('should delete additional email', () => {
    let secondEmail;
    beforeEach(() => {
      secondEmail = server.uniqueEmail();
      return client
        .createEmail(secondEmail)
        .then(() => {
          return server.mailbox.waitForEmail(secondEmail);
        })
        .then((emailData) => {
          const templateName = emailData['headers']['x-template-name'];
          const emailCode = emailData['headers']['x-verify-code'];
          assert.equal(templateName, 'verifySecondary');
          return client.verifySecondaryEmail(emailCode, secondEmail);
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
        })
        .then(() => {
          return server.mailbox.waitForEmail(email);
        })
        .then((emailData) => {
          const templateName = emailData['headers']['x-template-name'];
          assert.equal(templateName, 'postVerifySecondary');
        });
    });

    it('can delete', () => {
      return client
        .deleteEmail(secondEmail)
        .then((res) => {
          assert.ok(res, 'ok response');
          return client.accountEmails();
        })
        .then((res) => {
          assert.equal(res.length, 1, 'returns number of emails');
          assert.equal(res[0].email, email, 'returns correct email');
          assert.equal(res[0].isPrimary, true, 'returns correct isPrimary');
          assert.equal(res[0].verified, true, 'returns correct verified');

          // Primary account is notified that secondary email has been removed
          return server.mailbox.waitForEmail(email);
        })
        .then((emailData) => {
          const templateName = emailData['headers']['x-template-name'];
          assert.equal(templateName, 'postRemoveSecondary');
        });
    });

    it('resets account tokens when deleting an email', () => {
      let code;
      return client
        .forgotPassword()
        .then(() => {
          return server.mailbox.waitForEmail(secondEmail);
        })
        .then((emailData) => {
          code = emailData.headers['x-recovery-code'];
          assert.ok(code, 'recovery code was sent the secondary email');
        })
        .then((res) => {
          return client.deleteEmail(secondEmail);
        })
        .then((res) => {
          assert.ok(res, 'ok response');
          return client.accountEmails();
        })
        .then((res) => {
          assert.equal(res.length, 1, 'the secondary email was deleted');
          return client.verifyPasswordResetCode(code);
        })
        .then(
          () => {
            assert.fail('password recovery code shoud not have been accepted');
          },
          (err) => {
            assert.equal(
              err.errno,
              ERRNO.INVALID_TOKEN,
              'token was invalidated'
            );
          }
        );
    });

    it('silient fail on delete non-existent email', () => {
      return client.deleteEmail('fill@yourboots.com').then((res) => {
        // User is attempting to delete an email that doesn't exist, make sure nothing blew up
        assert.ok(res, 'ok response');
      });
    });

    it('fails on delete primary account email', () => {
      return client
        .deleteEmail(email)
        .then(assert.fail)
        .catch((err) => {
          assert.equal(err.errno, 137, 'correct error errno');
          assert.equal(err.code, 400, 'correct error code');
          assert.equal(
            err.message,
            'Can not delete primary email',
            'correct error message'
          );
        });
    });

    it('fails for unverified session', () => {
      return client
        .login()
        .then(() => {
          return client.accountEmails();
        })
        .then((res) => {
          assert.equal(res.length, 2, 'returns number of emails');
          assert.equal(res[1].email, secondEmail, 'returns correct email');
          assert.equal(res[1].isPrimary, false, 'returns correct isPrimary');
          assert.equal(res[1].verified, true, 'returns correct verified');
          return client.deleteEmail(secondEmail).then(
            () => {
              assert.fail(new Error('Should not have deleted email'));
            },
            (err) => {
              assert.equal(err.code, 400, 'correct error code');
              assert.equal(
                err.errno,
                138,
                'correct error errno unverified session'
              );
            }
          );
        });
    });
  });

  describe('should receive emails on verified secondary emails', () => {
    let secondEmail;
    let thirdEmail;
    beforeEach(() => {
      secondEmail = server.uniqueEmail();
      thirdEmail = server.uniqueEmail();
      return client
        .createEmail(secondEmail)
        .then((res) => {
          assert.ok(res, 'ok response');
          return server.mailbox.waitForEmail(secondEmail);
        })
        .then((emailData) => {
          const templateName = emailData['headers']['x-template-name'];
          const emailCode = emailData['headers']['x-verify-code'];
          assert.equal(templateName, 'verifySecondary');
          assert.ok(emailCode, 'emailCode set');
          return client.verifySecondaryEmail(emailCode, secondEmail);
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
        })
        .then((emailData) => {
          const templateName = emailData['headers']['x-template-name'];
          assert.equal(templateName, 'postVerifySecondary');

          // Create a third email but don't verify it. This should not appear in the cc-list
          return client.createEmail(thirdEmail);
        });
    });

    it('receives sign-in confirmation email', () => {
      let emailCode;
      return client
        .login({ keys: true })
        .then((res) => {
          assert.ok(res);
          return server.mailbox.waitForEmail(email);
        })
        .then((emailData) => {
          const templateName = emailData['headers']['x-template-name'];
          emailCode = emailData['headers']['x-verify-code'];
          assert.equal(templateName, 'verifyLogin');
          assert.ok(emailCode, 'emailCode set');
          assert.equal(emailData.cc.length, 1);
          assert.equal(emailData.cc[0].address, secondEmail);
          return client.requestVerifyEmail();
        })
        .then((res) => {
          assert.ok(res);
          return server.mailbox.waitForEmail(email);
        })
        .then((emailData) => {
          const templateName = emailData['headers']['x-template-name'];
          const anotherEmailCode = emailData['headers']['x-verify-code'];
          assert.equal(templateName, 'verifyLogin');
          assert.equal(emailCode, anotherEmailCode, 'emailCodes match');
          assert.equal(emailData.cc.length, 1);
          assert.equal(emailData.cc[0].address, secondEmail);
        });
    });

    it('receives sign-in unblock email', () => {
      let unblockCode;
      return client
        .sendUnblockCode(email)
        .then(() => {
          return server.mailbox.waitForEmail(email);
        })
        .then((emailData) => {
          const templateName = emailData['headers']['x-template-name'];
          unblockCode = emailData['headers']['x-unblock-code'];
          assert.equal(templateName, 'unblockCode');
          assert.ok(unblockCode, 'code set');
          assert.equal(emailData.cc.length, 1);
          assert.equal(emailData.cc[0].address, secondEmail);
          return client.sendUnblockCode(email);
        })
        .then((res) => {
          assert.ok(res);
          return server.mailbox.waitForEmail(email);
        })
        .then((emailData) => {
          const templateName = emailData['headers']['x-template-name'];
          const anotherUnblockCode = emailData['headers']['x-unblock-code'];
          assert.equal(templateName, 'unblockCode');
          assert.ok(unblockCode, anotherUnblockCode, 'unblock codes match set');
          assert.equal(emailData.cc.length, 1);
          assert.equal(emailData.cc[0].address, secondEmail);
        });
    });

    it('receives password reset email', () => {
      return client
        .forgotPassword()
        .then(() => {
          return server.mailbox.waitForEmail(email);
        })
        .then((emailData) => {
          const templateName = emailData['headers']['x-template-name'];
          assert.equal(templateName, 'recovery');
          assert.equal(emailData.cc.length, 1);
          assert.equal(emailData.cc[0].address, secondEmail);
          return emailData.headers['x-recovery-code'];
        });
    });

    it('receives change password notification', () => {
      return client
        .changePassword('password1', undefined)
        .then((res) => {
          assert.ok(res);
          return server.mailbox.waitForEmail(email);
        })
        .then((emailData) => {
          const templateName = emailData['headers']['x-template-name'];
          assert.equal(templateName, 'passwordChanged');
          assert.equal(emailData.cc.length, 1);
          assert.equal(emailData.cc[0].address, secondEmail);
        });
    });

    it('receives password reset notification', () => {
      return client
        .forgotPassword()
        .then(() => {
          return server.mailbox.waitForEmail(email);
        })
        .then((emailData) => {
          return emailData.headers['x-recovery-code'];
        })
        .then((code) => {
          return resetPassword(client, code, 'password1', undefined, undefined);
        })
        .then((res) => {
          assert.ok(res);
          return server.mailbox.waitForEmail(email);
        })
        .then((emailData) => {
          const templateName = emailData['headers']['x-template-name'];
          assert.equal(templateName, 'passwordReset');
          assert.equal(emailData.cc.length, 1);
          assert.equal(emailData.cc[0].address, secondEmail);
          return client.login({ keys: true });
        })
        .then((x) => {
          client = x;
          return client.accountEmails();
        })
        .then((res) => {
          // Emails maintain there verification status through the password reset
          assert.equal(res.length, 3, 'returns number of emails');
          assert.equal(res[1].email, secondEmail, 'returns correct email');
          assert.equal(res[1].isPrimary, false, 'returns correct isPrimary');
          assert.equal(res[1].verified, true, 'returns correct verified');
          assert.equal(res[2].email, thirdEmail, 'returns correct email');
          assert.equal(res[2].isPrimary, false, 'returns correct isPrimary');
          assert.equal(res[2].verified, false, 'returns correct verified');
        });
    });

    it('receives secondary email removed notification', () => {
      const fourthEmail = server.uniqueEmail();
      return client
        .createEmail(fourthEmail)
        .then((res) => {
          assert.ok(res, 'ok response');
          return server.mailbox.waitForEmail(fourthEmail);
        })
        .then((emailData) => {
          const emailCode = emailData['headers']['x-verify-code'];
          return client.verifySecondaryEmail(emailCode, fourthEmail);
        })
        .then(() => {
          // Clear email added template
          return server.mailbox.waitForEmail(email);
        })
        .then(() => {
          return client.deleteEmail(fourthEmail);
        })
        .then(() => {
          return server.mailbox.waitForEmail(email);
        })
        .then((emailData) => {
          const templateName = emailData['headers']['x-template-name'];
          assert.equal(templateName, 'postRemoveSecondary');
          assert.equal(emailData.cc.length, 1);
          assert.equal(emailData.cc[0].address, secondEmail);
        });
    });

    it('receives new device sign-in email', () => {
      config.signinConfirmation.skipForNewAccounts.enabled = true;
      return TestServer.start(config)
        .then((s) => {
          server = s;
          email = server.uniqueEmail();
          secondEmail = server.uniqueEmail();
          thirdEmail = server.uniqueEmail();
          return Client.createAndVerify(
            config.publicUrl,
            email,
            password,
            server.mailbox
          );
        })
        .then((x) => {
          client = x;
          return client.createEmail(secondEmail);
        })
        .then(() => {
          return server.mailbox.waitForCode(secondEmail);
        })
        .then((code) => {
          return client.verifySecondaryEmail(code, secondEmail).then(() => {
            // Clear add secondary email notification
            return server.mailbox.waitForEmail(email);
          });
        })
        .then(() => {
          // Create unverified email
          return client.createEmail(thirdEmail);
        })
        .then(() => {
          return client.login({ keys: true });
        })
        .then(() => {
          return server.mailbox.waitForEmail(email);
        })
        .then((emailData) => {
          const templateName = emailData['headers']['x-template-name'];
          assert.equal(templateName, 'newDeviceLogin');
          assert.equal(emailData.cc.length, 1);
          assert.equal(emailData.cc[0].address, secondEmail);
        });
    });
  });

  describe("shouldn't be able to initiate account reset from secondary email", () => {
    let secondEmail;
    beforeEach(() => {
      secondEmail = server.uniqueEmail();
      return client
        .createEmail(secondEmail)
        .then((res) => {
          assert.ok(res, 'ok response');
          return server.mailbox.waitForEmail(secondEmail);
        })
        .then((emailData) => {
          const emailCode = emailData['headers']['x-verify-code'];
          assert.ok(emailCode, 'emailCode set');
          return client.verifySecondaryEmail(emailCode, secondEmail);
        });
    });

    it('fails to initiate account reset with known secondary email', () => {
      client.email = secondEmail;
      return client
        .forgotPassword()
        .then(() => {
          assert.fail(
            new Error('should not have been able to initiate reset password')
          );
        })
        .catch((err) => {
          assert.equal(err.code, 400, 'correct error code');
          assert.equal(err.errno, 145, 'correct errno code');
        });
    });

    it('returns account unknown error when using unknown email', () => {
      client.email = 'unknown@email.com';
      return client
        .forgotPassword()
        .then(() => {
          assert.fail(
            new Error('should not have been able to initiate reset password')
          );
        })
        .catch((err) => {
          assert.equal(err.code, 400, 'correct error code');
          assert.equal(err.errno, 102, 'correct errno code');
        });
    });
  });

  describe("shouldn't be able to login with secondary email", () => {
    let secondEmail;
    beforeEach(() => {
      secondEmail = server.uniqueEmail();
      return client
        .createEmail(secondEmail)
        .then((res) => {
          assert.ok(res, 'ok response');
          return server.mailbox.waitForEmail(secondEmail);
        })
        .then((emailData) => {
          const templateName = emailData['headers']['x-template-name'];
          const emailCode = emailData['headers']['x-verify-code'];
          assert.equal(templateName, 'verifySecondary');
          assert.ok(emailCode, 'emailCode set');
          return client.verifySecondaryEmail(emailCode, secondEmail);
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

    it('fails to login', () => {
      return Client.login(config.publicUrl, secondEmail, password, {})
        .then(() => {
          assert.fail(new Error('should not have been able to login'));
        })
        .catch((err) => {
          assert.equal(err.code, 400, 'correct error code');
          assert.equal(err.errno, 142, 'correct errno code');
        });
    });
  });

  describe('should handle account creation', () => {
    let secondEmail;
    let emailCode;

    beforeEach(() => {
      secondEmail = server.uniqueEmail();
      return client
        .createEmail(secondEmail)
        .then((res) => {
          assert.ok(res, 'ok response');
          return server.mailbox.waitForEmail(secondEmail);
        })
        .then((emailData) => {
          emailCode = emailData['headers']['x-verify-code'];
        });
    });

    it('fails to create account using verified secondary email', () => {
      return client
        .verifySecondaryEmail(emailCode, secondEmail)
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
        })
        .then(() => {
          return Client.create(config.publicUrl, secondEmail, password, {})
            .then(assert.fail)
            .catch((err) => {
              assert.equal(err.errno, 144, 'return correct errno');
              assert.equal(err.code, 400, 'return correct code');
            });
        });
    });

    it('should create account with unverified secondary email and delete unverified secondary email', () => {
      let client2;
      return client
        .accountEmails()
        .then((res) => {
          assert.equal(res.length, 2, 'returns number of emails');
          assert.equal(res[1].email, secondEmail, 'returns correct email');
          assert.equal(res[1].isPrimary, false, 'returns correct isPrimary');
          assert.equal(res[1].verified, false, 'returns correct verified');
          return Client.createAndVerify(
            config.publicUrl,
            secondEmail,
            password,
            server.mailbox
          ).catch(assert.fail);
        })
        .then((x) => {
          client2 = x;
          assert.equal(
            client2.email,
            secondEmail,
            'account created with secondary email address'
          );
          return client.accountEmails();
        })
        .then((res) => {
          // Secondary email on first account should have been deleted
          assert.equal(res.length, 1, 'returns number of emails');
          assert.equal(res[0].email, client.email, 'returns correct email');
          assert.equal(res[0].isPrimary, true, 'returns correct isPrimary');
          assert.equal(res[0].verified, true, 'returns correct verified');
        });
    });
  });

  describe('verify secondary email with code', async () => {
    let secondEmail;
    beforeEach(async () => {
      secondEmail = server.uniqueEmail();
      let res = await client.createEmail(secondEmail, 'email-otp');

      assert.ok(res, 'ok response');
      res = await client.accountEmails();

      assert.equal(res.length, 2, 'returns number of emails');
      assert.equal(res[1].email, secondEmail, 'returns correct email');
      assert.equal(res[1].isPrimary, false, 'returns correct isPrimary');
      assert.equal(res[1].verified, false, 'returns correct verified');
    });

    it('can verify using a code', async () => {
      let emailData = await server.mailbox.waitForEmail(secondEmail);
      let templateName = emailData['headers']['x-template-name'];
      const code = emailData['headers']['x-verify-code'];
      assert.equal(templateName, 'verifySecondaryCode');

      assert.ok(code, 'code set');
      let res = await client.verifySecondaryEmailWithCode(code, secondEmail);

      assert.ok(res, 'ok response');
      res = await client.accountEmails();

      assert.equal(res.length, 2, 'returns number of emails');
      assert.equal(res[1].email, secondEmail, 'returns correct email');
      assert.equal(res[1].isPrimary, false, 'returns correct isPrimary');
      assert.equal(res[1].verified, true, 'returns correct verified');

      emailData = await server.mailbox.waitForEmail(email);

      templateName = emailData['headers']['x-template-name'];
      assert.equal(templateName, 'postVerifySecondary');
    });

    it('does not verify on random email code', async () => {
      const emailData = await server.mailbox.waitForEmail(secondEmail);
      const templateName = emailData['headers']['x-template-name'];
      const emailCode = emailData['headers']['x-verify-code'];
      assert.equal(templateName, 'verifySecondaryCode');
      assert.ok(emailCode, 'emailCode set');
      let failed = false;
      try {
        await client.verifySecondaryEmailWithCode('123123', secondEmail);
        failed = true;
      } catch (err) {
        assert.equal(err.errno, 105, 'correct error errno');
        assert.equal(err.code, 400, 'correct error code');
      }

      if (failed) {
        assert.fail('should have failed');
      }
    });

    it('can resend verify email code', async () => {
      let emailData = await server.mailbox.waitForEmail(secondEmail);
      let templateName = emailData['headers']['x-template-name'];
      const emailCode = emailData['headers']['x-verify-code'];
      assert.equal(templateName, 'verifySecondaryCode');
      assert.ok(emailCode, 'emailCode set');
      assert.equal(emailCode.length, 6);
      client.options.email = secondEmail;
      let res = await client.resendVerifySecondaryEmailWithCode(secondEmail);

      assert.ok(res, 'ok response');
      emailData = await server.mailbox.waitForEmail(secondEmail);

      templateName = emailData['headers']['x-template-name'];
      const resendEmailCode = emailData['headers']['x-verify-code'];
      assert.equal(templateName, 'verifySecondaryCode');
      assert.equal(resendEmailCode, emailCode, 'emailCode matches');
      res = await client.verifySecondaryEmailWithCode(emailCode, secondEmail);

      assert.ok(res, 'ok response');
      res = await client.accountEmails();

      assert.equal(res.length, 2, 'returns number of emails');
      assert.equal(res[1].email, secondEmail, 'returns correct email');
      assert.equal(res[1].isPrimary, false, 'returns correct isPrimary');
      assert.equal(res[1].verified, true, 'returns correct verified');
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
