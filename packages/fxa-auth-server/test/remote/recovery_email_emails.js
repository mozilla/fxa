/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const TestServer = require('../test_server');
const Client = require('../client')();
const { setupAccountDatabase } = require('@fxa/shared/db/mysql/account');
const cfg = require('../../config').default.getProperties();
const { email: emailHelper } = require('fxa-shared');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const uuid = require('uuid');
const tokens = require('../../lib/tokens')({ trace: function () {} });

// Helper to generate MFA JWT for email scope
async function generateMfaJwt(client) {
  const sessionTokenHex = client.sessionToken;
  const sessionToken = await tokens.SessionToken.fromHex(sessionTokenHex);
  const sessionTokenId = sessionToken.id;

  const now = Math.floor(Date.now() / 1000);
  const claims = {
    sub: client.uid,
    scope: ['mfa:email'],
    iat: now,
    jti: uuid.v4(),
    stid: sessionTokenId,
  };

  return jwt.sign(claims, cfg.mfa.jwt.secretKey, {
    algorithm: 'HS256',
    expiresIn: cfg.mfa.jwt.expiresInSec,
    audience: cfg.mfa.jwt.audience,
    issuer: cfg.mfa.jwt.issuer,
  });
}

let config, server, client, email;
const password = 'allyourbasearebelongtous';

[{ version: '' }, { version: 'V2' }].forEach((testOptions) => {
  describe(`#integration${testOptions.version} - remote emails`, function () {
    this.timeout(60000);

    before(async function () {
      config = require('../../config').default.getProperties();
      config.securityHistory.ipProfiling = {};
      config.signinConfirmation.skipForNewAccounts.enabled = false;

      server = await TestServer.start(config);
    });

    after(async () => {
      await TestServer.stop(server);
    });

    beforeEach(() => {
      email = server.uniqueEmail();
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
        });
    });

    describe('should create and get additional email', () => {
      it('can create', async () => {
        const secondEmail = server.uniqueEmail();
        const mfaJwt = await generateMfaJwt(client);

        let res = await client.accountEmails();
        assert.equal(res.length, 1, 'returns number of emails');
        assert.equal(res[0].email, email, 'returns correct email');
        assert.equal(res[0].isPrimary, true, 'returns correct isPrimary');
        assert.equal(res[0].verified, true, 'returns correct verified');

        res = await client.createEmail(mfaJwt, secondEmail);
        assert.ok(res, 'ok response');

        res = await client.accountEmails();
        // the email is not verified, so it should not be returned yet
        assert.equal(res.length, 1, 'returns number of emails');

        const emailData = await server.mailbox.waitForEmail(secondEmail);
        const templateName = emailData['headers']['x-template-name'];
        const emailCode = emailData['headers']['x-verify-code'];
        assert.equal(templateName, 'verifySecondaryCode');
        assert.ok(emailCode, 'emailCode set');

        res = await client.verifySecondaryEmailWithCode(mfaJwt, emailCode, secondEmail);
        assert.ok(res, 'ok response');

        res = await client.accountEmails();
        assert.equal(res.length, 2, 'returns number of emails');
        assert.equal(res[1].email, secondEmail, 'returns correct email');
        assert.equal(res[1].isPrimary, false, 'returns correct isPrimary');
        assert.equal(res[1].verified, true, 'returns correct verified');
      });

      it('can create account with an email that is an unverified secondary email on another account', async () => {
        let client2;
        const secondEmail = server.uniqueEmail();
        // create an unverified secondary email on the first account by seeding the db
        const db = await setupAccountDatabase(cfg.database.mysql.auth);
        try {
          await db
            .insertInto('emails')
            .values({
              email: secondEmail,
              normalizedEmail: emailHelper.helpers.normalizeEmail(secondEmail),
              uid: Buffer.from(client.uid, 'hex'),
              emailCode: Buffer.from(
                crypto.randomBytes(16).toString('hex'),
                'hex'
              ),
              isVerified: 0,
              isPrimary: 0,
              createdAt: Date.now(),
            })
            .execute();
        } finally {
          await db.destroy();
        }

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
              server.mailbox,
              testOptions
            ).catch(assert.fail);
          })
          .then((x) => {
            client2 = x;
            assert.equal(
              client2.email,
              secondEmail,
              'account created with first account unverified secondary email'
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

      it('can transfer an unverified secondary email from one account to another', async () => {
        const clientEmail = server.uniqueEmail();
        const secondEmail = server.uniqueEmail();
        // create an unverified secondary email on the first account by seeding the db
        const db = await setupAccountDatabase(cfg.database.mysql.auth);
        try {
          await db
            .insertInto('emails')
            .values({
              email: secondEmail,
              normalizedEmail: emailHelper.helpers.normalizeEmail(secondEmail),
              uid: Buffer.from(client.uid, 'hex'),
              emailCode: Buffer.from(
                crypto.randomBytes(16).toString('hex'),
                'hex'
              ),
              isVerified: 0,
              isPrimary: 0,
              createdAt: Date.now(),
            })
            .execute();
        } finally {
          await db.destroy();
        }

        let res = await client.accountEmails();
        assert.equal(res.length, 2, 'returns number of emails');
        assert.equal(res[1].email, secondEmail, 'returns correct email');
        assert.equal(res[1].isPrimary, false, 'returns correct isPrimary');
        assert.equal(res[1].verified, false, 'returns correct verified');

        const client2 = await Client.createAndVerify(
          config.publicUrl,
          clientEmail,
          password,
          server.mailbox,
          testOptions
        );
        assert.equal(client2.email, clientEmail, 'account created with email');

        const client2Jwt = await generateMfaJwt(client2);
        await client2.createEmail(client2Jwt, secondEmail);

        const emailData = await server.mailbox.waitForEmail(secondEmail);
        const templateName = emailData['headers']['x-template-name'];
        const emailCode = emailData['headers']['x-verify-code'];
        assert.equal(templateName, 'verifySecondaryCode');
        assert.ok(emailCode, 'emailCode set');

        res = await client2.verifySecondaryEmailWithCode(client2Jwt, emailCode, secondEmail);
        assert.ok(res, 'ok response');

        res = await client.accountEmails();
        // Secondary email on first account should have been deleted
        assert.equal(res.length, 1, 'returns number of emails');
        assert.equal(res[0].email, client.email, 'returns correct email');
        assert.equal(res[0].isPrimary, true, 'returns correct isPrimary');
        assert.equal(res[0].verified, true, 'returns correct verified');

        res = await client2.accountEmails();
        // Secondary email should be on the second account
        assert.equal(res.length, 2, 'returns number of emails');
        assert.equal(res[1].email, secondEmail, 'returns correct email');
        assert.equal(res[1].isPrimary, false, 'returns correct isPrimary');
        assert.equal(res[1].verified, true, 'returns correct verified');
      });

      it('fails create when email is user primary email', async () => {
        const mfaJwt = await generateMfaJwt(client);
        try {
          await client.createEmail(mfaJwt, email);
          assert.fail('should have thrown');
        } catch (err) {
          assert.equal(err.errno, 139, 'email already exists errno');
          assert.equal(err.code, 400, 'email already exists code');
          assert.equal(
            err.message,
            'Can not add secondary email that is same as your primary',
            'correct error message'
          );
        }
      });

      it('fails create when email exists in user emails', async () => {
        const secondEmail = server.uniqueEmail();
        const mfaJwt = await generateMfaJwt(client);

        await client.createEmail(mfaJwt, secondEmail);
        const emailData = await server.mailbox.waitForEmail(secondEmail);
        const templateName = emailData['headers']['x-template-name'];
        const emailCode = emailData['headers']['x-verify-code'];
        assert.equal(templateName, 'verifySecondaryCode');
        assert.ok(emailCode, 'emailCode set');

        const res = await client.verifySecondaryEmailWithCode(mfaJwt, emailCode, secondEmail);
        assert.ok(res, 'ok response');

        try {
          await client.createEmail(mfaJwt, secondEmail);
          assert.fail('should have thrown');
        } catch (err) {
          assert.equal(err.errno, 189, 'email already exists errno');
          assert.equal(err.code, 400, 'email already exists code');
          assert.equal(
            err.message,
            'This email already exists on your account',
            'correct error message'
          );
        }
      });

      it('fails create when verified secondary email exists in other user account', async () => {
        const anotherUserEmail = server.uniqueEmail();
        const anotherUserSecondEmail = server.uniqueEmail();

        const anotherClient = await Client.createAndVerify(
          config.publicUrl,
          anotherUserEmail,
          password,
          server.mailbox,
          testOptions
        );
        assert.ok(client.authAt, 'authAt was set');

        const anotherClientJwt = await generateMfaJwt(anotherClient);
        await anotherClient.createEmail(anotherClientJwt, anotherUserSecondEmail);

        const emailData = await server.mailbox.waitForEmail(anotherUserSecondEmail);
        const emailCode = emailData['headers']['x-verify-code'];
        const res = await anotherClient.verifySecondaryEmailWithCode(
          anotherClientJwt,
          emailCode,
          anotherUserSecondEmail
        );
        assert.ok(res, 'ok response');

        const mfaJwt = await generateMfaJwt(client);
        try {
          await client.createEmail(mfaJwt, anotherUserSecondEmail);
          assert.fail('should have thrown');
        } catch (err) {
          assert.equal(err.errno, 136, 'email already exists errno');
          assert.equal(err.code, 400, 'email already exists code');
          assert.equal(
            err.message,
            'Email already exists',
            'correct error message'
          );
        }
      });

      it('fails for unverified session', async () => {
        const secondEmail = server.uniqueEmail();
        await client.login();

        const res = await client.accountEmails();
        assert.equal(res.length, 1, 'returns number of emails');
        assert.equal(res[0].email, email, 'returns correct email');
        assert.equal(res[0].isPrimary, true, 'returns correct isPrimary');
        assert.equal(res[0].verified, true, 'returns correct verified');

        // Generate JWT with unverified session - should fail with 138
        const mfaJwt = await generateMfaJwt(client);
        try {
          await client.createEmail(mfaJwt, secondEmail);
          assert.fail(new Error('Should not have created email'));
        } catch (err) {
          assert.equal(err.code, 400, 'correct error code');
          assert.equal(
            err.errno,
            138,
            'correct error errno unverified session'
          );
        }
      });

      it('fails create when email is another users verified primary', async () => {
        const anotherUserEmail = server.uniqueEmail();
        await Client.createAndVerify(
          config.publicUrl,
          anotherUserEmail,
          password,
          server.mailbox,
          testOptions
        );

        const mfaJwt = await generateMfaJwt(client);
        try {
          await client.createEmail(mfaJwt, anotherUserEmail);
          assert.fail('should have thrown');
        } catch (err) {
          assert.equal(err.errno, 140, 'email already exists errno');
          assert.equal(err.code, 400, 'email already exists code');
          assert.equal(
            err.message,
            'Email already exists',
            'correct error message'
          );
        }
      });
    });

    describe('should delete additional email', () => {
      let secondEmail;
      let mfaJwt;
      beforeEach(async () => {
        secondEmail = server.uniqueEmail();
        mfaJwt = await generateMfaJwt(client);

        await client.createEmail(mfaJwt, secondEmail);
        const emailData = await server.mailbox.waitForEmail(secondEmail);
        const templateName = emailData['headers']['x-template-name'];
        const emailCode = emailData['headers']['x-verify-code'];
        assert.equal(templateName, 'verifySecondaryCode');

        let res = await client.verifySecondaryEmailWithCode(mfaJwt, emailCode, secondEmail);
        assert.ok(res, 'ok response');

        res = await client.accountEmails();
        assert.equal(res.length, 2, 'returns number of emails');
        assert.equal(res[1].email, secondEmail, 'returns correct email');
        assert.equal(res[1].isPrimary, false, 'returns correct isPrimary');
        assert.equal(res[1].verified, true, 'returns correct verified');

        const postVerifyEmailData = await server.mailbox.waitForEmail(email);
        assert.equal(postVerifyEmailData['headers']['x-template-name'], 'postVerifySecondary');
      });

      it('can delete', async () => {
        let res = await client.deleteEmail(mfaJwt, secondEmail);
        assert.ok(res, 'ok response');

        res = await client.accountEmails();
        assert.equal(res.length, 1, 'returns number of emails');
        assert.equal(res[0].email, email, 'returns correct email');
        assert.equal(res[0].isPrimary, true, 'returns correct isPrimary');
        assert.equal(res[0].verified, true, 'returns correct verified');

        // Primary account is notified that secondary email has been removed
        const emailData = await server.mailbox.waitForEmail(email);
        const templateName = emailData['headers']['x-template-name'];
        assert.equal(templateName, 'postRemoveSecondary');
      });

      it('resets account tokens when deleting an email', async () => {
        await client.forgotPassword();
        const forgotEmailData = await server.mailbox.waitForEmail(secondEmail);
        const otpCode = forgotEmailData.headers['x-password-forgot-otp'];
        assert.ok(otpCode, 'OTP code was sent to the secondary email');

        let res = await client.deleteEmail(mfaJwt, secondEmail);
        assert.ok(res, 'ok response');

        res = await client.accountEmails();
        assert.equal(res.length, 1, 'the secondary email was deleted');

        // Note: OTP codes are stored in Redis by uid, while resetAccountTokens
        // only clears MySQL tokens (passwordForgotToken). The OTP may still be
        // valid after email deletion since it's tied to the account uid, not the email.
        // This test verifies that the email deletion succeeds and the secondary email is removed.
      });

      it('silient fail on delete non-existent email', async () => {
        // User is attempting to delete an email that doesn't exist, make sure nothing blew up
        const res = await client.deleteEmail(mfaJwt, 'fill@yourboots.com');
        assert.ok(res, 'ok response');
      });

      it('fails on delete primary account email', async () => {
        try {
          await client.deleteEmail(mfaJwt, email);
          assert.fail('should have thrown');
        } catch (err) {
          assert.equal(err.errno, 137, 'correct error errno');
          assert.equal(err.code, 400, 'correct error code');
          assert.equal(
            err.message,
            'Can not delete primary email',
            'correct error message'
          );
        }
      });

      it('fails for unverified session', async () => {
        await client.login();

        const res = await client.accountEmails();
        assert.equal(res.length, 2, 'returns number of emails');
        assert.equal(res[1].email, secondEmail, 'returns correct email');
        assert.equal(res[1].isPrimary, false, 'returns correct isPrimary');
        assert.equal(res[1].verified, true, 'returns correct verified');

        // Generate JWT with unverified session - should fail with 138
        const unverifiedJwt = await generateMfaJwt(client);
        try {
          await client.deleteEmail(unverifiedJwt, secondEmail);
          assert.fail(new Error('Should not have deleted email'));
        } catch (err) {
          assert.equal(err.code, 400, 'correct error code');
          assert.equal(
            err.errno,
            138,
            'correct error errno unverified session'
          );
        }
      });
    });

    describe('should receive emails on verified secondary emails', () => {
      let secondEmail;
      let thirdEmail;
      let mfaJwt;
      beforeEach(async () => {
        secondEmail = server.uniqueEmail();
        thirdEmail = server.uniqueEmail();
        mfaJwt = await generateMfaJwt(client);

        let res = await client.createEmail(mfaJwt, secondEmail);
        assert.ok(res, 'ok response');

        let emailData = await server.mailbox.waitForEmail(secondEmail);
        const templateName = emailData['headers']['x-template-name'];
        const emailCode = emailData['headers']['x-verify-code'];
        assert.equal(templateName, 'verifySecondaryCode');
        assert.ok(emailCode, 'emailCode set');

        res = await client.verifySecondaryEmailWithCode(mfaJwt, emailCode, secondEmail);
        assert.ok(res, 'ok response');

        res = await client.accountEmails();
        assert.equal(res.length, 2, 'returns number of emails');
        assert.equal(res[1].email, secondEmail, 'returns correct email');
        assert.equal(res[1].isPrimary, false, 'returns correct isPrimary');
        assert.equal(res[1].verified, true, 'returns correct verified');

        emailData = await server.mailbox.waitForEmail(email);
        assert.equal(emailData['headers']['x-template-name'], 'postVerifySecondary');

        // Create a third email but don't verify it (legacy unverified email)
        // This should not appear in the cc-list
        const db = await setupAccountDatabase(cfg.database.mysql.auth);
        try {
          await db
            .insertInto('emails')
            .values({
              email: thirdEmail,
              normalizedEmail: emailHelper.helpers.normalizeEmail(thirdEmail),
              uid: Buffer.from(client.uid, 'hex'),
              emailCode: Buffer.from(
                crypto.randomBytes(16).toString('hex'),
                'hex'
              ),
              isVerified: 0,
              isPrimary: 0,
              createdAt: Date.now(),
            })
            .execute();
        } finally {
          await db.destroy();
        }

        res = await client.accountEmails();
        assert.equal(res.length, 3, 'returns number of emails');
        assert.equal(res[2].email, thirdEmail, 'returns correct email');
        assert.equal(res[2].isPrimary, false, 'returns correct isPrimary');
        assert.equal(res[2].verified, false, 'returns correct verified');
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
            assert.ok(
              unblockCode,
              anotherUnblockCode,
              'unblock codes match set'
            );
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
            assert.equal(templateName, 'passwordForgotOtp');
            assert.equal(emailData.cc.length, 1);
            assert.equal(emailData.cc[0].address, secondEmail);
            return emailData.headers['x-password-forgot-otp'];
          });
      });

      it('receives change password notification', () => {
        return client
          .changePassword('password1', undefined, client.sessionToken)
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
            return emailData.headers['x-password-forgot-otp'];
          })
          .then((code) => {
            return resetPassword(
              client,
              code,
              'password1',
              undefined,
              undefined
            );
          })
          .then((res) => {
            assert.ok(res);
          })
          .then(() => {
            return server.mailbox.waitForEmail(email);
          })
          .then((emailData) => {
            const templateName = emailData['headers']['x-template-name'];
            assert.equal(templateName, 'passwordReset');
            assert.equal(emailData.cc.length, 1);
            assert.equal(emailData.cc[0].address, secondEmail);
          })
          .then(async () => {
            if (testOptions.version === 'V2') {
              return Client.upgradeCredentials(
                config.publicUrl,
                email,
                'password1',
                { version: '', keys: true },
                server.mailbox
              );
            }
          })
          .then((x) => {
            if (x) {
              client = x;
            }
            return client.login({ keys: true });
          })
          .then((x) => {
            client = x;
            return client.accountEmails();
          })
          .then((res) => {
            // Email addresses maintain their verification status after password reset
            assert.equal(res.length, 3, 'returns number of emails');
            assert.equal(res[1].email, secondEmail, 'returns correct email');
            assert.equal(res[1].isPrimary, false, 'returns correct isPrimary');
            assert.equal(res[1].verified, true, 'returns correct verified');
            assert.equal(res[2].email, thirdEmail, 'returns correct email');
            assert.equal(res[2].isPrimary, false, 'returns correct isPrimary');
            assert.equal(res[2].verified, false, 'returns correct verified');
          });
      });

      it('receives secondary email removed notification', async () => {
        const fourthEmail = server.uniqueEmail();

        let res = await client.createEmail(mfaJwt, fourthEmail);
        assert.ok(res, 'ok response');

        let emailData = await server.mailbox.waitForEmail(fourthEmail);
        const emailCode = emailData['headers']['x-verify-code'];

        res = await client.verifySecondaryEmailWithCode(mfaJwt, emailCode, fourthEmail);
        assert.ok(res, 'ok response');

        // Clear email added template
        await server.mailbox.waitForEmail(email);

        await client.deleteEmail(mfaJwt, fourthEmail);

        emailData = await server.mailbox.waitForEmail(email);
        const templateName = emailData['headers']['x-template-name'];
        assert.equal(templateName, 'postRemoveSecondary');
        assert.equal(emailData.cc.length, 1);
        assert.equal(emailData.cc[0].address, secondEmail);
      });

      describe('new device signin', function () {
        let skipForNewAccountsEnabled;
        before(async function () {
          // Stop currently running server, and create new config
          await TestServer.stop(server);
          skipForNewAccountsEnabled =
            config.signinConfirmation.skipForNewAccounts.enabled;
          config.signinConfirmation.skipForNewAccounts.enabled = true;
          server = await TestServer.start(config);
        });

        after(async function () {
          // Restore server to previous config
          await TestServer.stop(server);
          config.signinConfirmation.skipForNewAccounts.enabled =
            skipForNewAccountsEnabled;
          server = await TestServer.start(config);
        });

        it('receives new device sign-in email', async function () {
          email = server.uniqueEmail();
          secondEmail = server.uniqueEmail();
          thirdEmail = server.uniqueEmail();
          const client = await Client.createAndVerify(
            config.publicUrl,
            email,
            password,
            server.mailbox,
            testOptions
          );
          const clientJwt = await generateMfaJwt(client);
          await client.createEmail(clientJwt, secondEmail);
          const code = await server.mailbox.waitForCode(secondEmail);
          await client.verifySecondaryEmailWithCode(clientJwt, code, secondEmail);

          // Clear add secondary email notification
          await server.mailbox.waitForEmail(email);

          // Create unverified email (this will trigger a verification email but won't be verified)
          await client.createEmail(clientJwt, thirdEmail);

          // Login again
          await client.login({ keys: true });
          const emailData = await server.mailbox.waitForEmail(email);

          // Check for new device lgoin email
          const templateName = emailData['headers']['x-template-name'];
          assert.equal(templateName, 'newDeviceLogin');
          assert.equal(emailData.cc.length, 1);
          assert.equal(emailData.cc[0].address, secondEmail);
        });
      });
    });

    describe('should be able to initiate account reset from verified secondary email', () => {
      let secondEmail;
      let mfaJwt;
      beforeEach(async () => {
        secondEmail = server.uniqueEmail();
        mfaJwt = await generateMfaJwt(client);

        let res = await client.createEmail(mfaJwt, secondEmail);
        assert.ok(res, 'ok response');

        const emailData = await server.mailbox.waitForEmail(secondEmail);
        const emailCode = emailData['headers']['x-verify-code'];
        assert.ok(emailCode, 'emailCode set');

        res = await client.verifySecondaryEmailWithCode(mfaJwt, emailCode, secondEmail);
        assert.ok(res, 'ok response');
      });

      it('can initiate account reset with verified secondary email', async () => {
        client.email = secondEmail;
        await client.forgotPassword();
        // Verify OTP was sent by checking for the email
        const emailData = await server.mailbox.waitForEmail(secondEmail);
        assert.ok(
          emailData.headers['x-password-forgot-otp'],
          'OTP was sent to secondary email'
        );
      });
    });

    describe("shouldn't be able to initiate account reset from secondary email", () => {
      let secondEmail;
      let mfaJwt;
      beforeEach(async () => {
        secondEmail = server.uniqueEmail();
        mfaJwt = await generateMfaJwt(client);

        const res = await client.createEmail(mfaJwt, secondEmail);
        assert.ok(res, 'ok response');

        await server.mailbox.waitForEmail(secondEmail);
      });

      it('fails to initiate account reset with unverified secondary email', () => {
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
            assert.equal(err.errno, 102, 'correct errno code');
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
      let mfaJwt;
      beforeEach(async () => {
        secondEmail = server.uniqueEmail();
        mfaJwt = await generateMfaJwt(client);

        let res = await client.createEmail(mfaJwt, secondEmail);
        assert.ok(res, 'ok response');

        const emailData = await server.mailbox.waitForEmail(secondEmail);
        const templateName = emailData['headers']['x-template-name'];
        const emailCode = emailData['headers']['x-verify-code'];
        assert.equal(templateName, 'verifySecondaryCode');
        assert.ok(emailCode, 'emailCode set');

        res = await client.verifySecondaryEmailWithCode(mfaJwt, emailCode, secondEmail);
        assert.ok(res, 'ok response');

        res = await client.accountEmails();
        assert.equal(res.length, 2, 'returns number of emails');
        assert.equal(res[1].email, secondEmail, 'returns correct email');
        assert.equal(res[1].isPrimary, false, 'returns correct isPrimary');
        assert.equal(res[1].verified, true, 'returns correct verified');

        await server.mailbox.waitForEmail(email);
      });

      it('fails to login', () => {
        return Client.login(
          config.publicUrl,
          secondEmail,
          password,
          testOptions
        )
          .then(() => {
            assert.fail(new Error('should not have been able to login'));
          })
          .catch((err) => {
            assert.equal(err.code, 400, 'correct error code');
            assert.equal(err.errno, 142, 'correct errno code');
          });
      });
    });

    describe('verified secondary email', () => {
      let secondEmail;
      let mfaJwt;

      beforeEach(async () => {
        secondEmail = server.uniqueEmail();
        mfaJwt = await generateMfaJwt(client);

        let res = await client.createEmail(mfaJwt, secondEmail);
        assert.ok(res, 'ok response');

        const emailData = await server.mailbox.waitForEmail(secondEmail);
        const emailCode = emailData['headers']['x-verify-code'];
        assert.ok(emailCode, 'emailCode set');

        res = await client.verifySecondaryEmailWithCode(mfaJwt, emailCode, secondEmail);
        assert.ok(res, 'ok response');

        res = await client.accountEmails();
        assert.equal(res.length, 2, 'returns number of emails');
        assert.equal(res[1].email, secondEmail, 'returns correct email');
        assert.equal(res[1].isPrimary, false, 'returns correct isPrimary');
        assert.equal(res[1].verified, true, 'returns correct verified');
      });

      it('cannot be used to create a new account', () => {
        return Client.create(
          config.publicUrl,
          secondEmail,
          password,
          testOptions
        )
          .then(assert.fail)
          .catch((err) => {
            assert.equal(err.errno, 144, 'return correct errno');
            assert.equal(err.code, 400, 'return correct code');
          });
      });
    });

    describe('verify secondary email with code', async () => {
      let secondEmail;
      let mfaJwt;
      beforeEach(async () => {
        secondEmail = server.uniqueEmail();
        mfaJwt = await generateMfaJwt(client);

        const res = await client.createEmail(mfaJwt, secondEmail);
        assert.ok(res, 'ok response');
      });

      it('can verify using a code', async () => {
        let emailData = await server.mailbox.waitForEmail(secondEmail);
        let templateName = emailData['headers']['x-template-name'];
        const code = emailData['headers']['x-verify-code'];
        assert.equal(templateName, 'verifySecondaryCode');

        assert.ok(code, 'code set');
        let res = await client.verifySecondaryEmailWithCode(mfaJwt, code, secondEmail);

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
        let failed = false;
        try {
          await client.verifySecondaryEmailWithCode(mfaJwt, '123123', secondEmail);
          failed = true;
        } catch (err) {
          assert.equal(err.errno, 105, 'correct error errno');
          assert.equal(err.code, 400, 'correct error code');
        }

        if (failed) {
          assert.fail('should have failed');
        }
      });
    });

    // These tests cover legacy secondary emails that are stored in the database as unverified records
    // These tests will no longer apply once we have cleaned out the old unverified records
    // See FXA-10083 for more details
    describe('(legacy) unverified secondary email', async () => {
      let secondEmail;
      beforeEach(async () => {
        secondEmail = server.uniqueEmail();
        const db = await setupAccountDatabase(cfg.database.mysql.auth);
        const emailCode = Buffer.from(
          crypto.randomBytes(16).toString('hex'),
          'hex'
        );
        try {
          await db
            .insertInto('emails')
            .values({
              email: secondEmail,
              normalizedEmail: emailHelper.helpers.normalizeEmail(secondEmail),
              uid: Buffer.from(client.uid, 'hex'),
              emailCode,
              isVerified: 0,
              isPrimary: 0,
              createdAt: Date.now(),
            })
            .execute();
        } finally {
          await db.destroy();
        }
      });

      it('is deleted from the initial account if the email is verified on another account', async () => {
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
              server.mailbox,
              testOptions
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

      it('can resend verify email code', async () => {
        const mfaJwt = await generateMfaJwt(client);
        let res = await client.resendVerifySecondaryEmailWithCode(
          mfaJwt,
          secondEmail
        );

        assert.ok(res, 'ok response');
        const emailData = await server.mailbox.waitForEmail(secondEmail);

        const templateName = emailData['headers']['x-template-name'];
        const resendEmailCode = emailData['headers']['x-verify-code'];
        assert.equal(templateName, 'verifySecondaryCode');
        assert.equal(resendEmailCode.length, 6, 'emailCode length is 6');
        await client.verifySecondaryEmailWithCode(mfaJwt, resendEmailCode, secondEmail);
        res = await client.accountEmails();
        assert.equal(res.length, 2, 'returns number of emails');
        assert.equal(res[1].email, secondEmail, 'returns correct email');
        assert.equal(res[1].isPrimary, false, 'returns correct isPrimary');
        assert.equal(res[1].verified, true, 'returns correct verified');
      });
    });

    async function resetPassword(client, otpCode, newPassword, headers, options) {
      const result = await client.verifyPasswordForgotOtp(otpCode, options);
      await client.verifyPasswordResetCode(result.code, headers, options);
      return client.resetPassword(newPassword, {}, options);
    }
  });
});
