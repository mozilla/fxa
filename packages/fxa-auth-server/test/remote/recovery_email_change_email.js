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

let config, server, client, email, secondEmail;
const password = 'allyourbasearebelongtous',
  newPassword = 'newpassword';

[{ version: '' }, { version: 'V2' }].forEach((testOptions) => {
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

    beforeEach(async () => {
      email = server.uniqueEmail();
      secondEmail = server.uniqueEmail('@notrestmail.com');

      client = await Client.createAndVerify(
        config.publicUrl,
        email,
        password,
        server.mailbox,
        testOptions
      );
      assert.ok(client.authAt, 'authAt was set');

      const status = await client.emailStatus();
      assert.equal(status.verified, true, 'account is verified');

      const mfaJwt = await generateMfaJwt(client);
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

    describe('should change primary email', () => {
      it('fails to change email to an that is not owned by user', async () => {
        const userEmail2 = server.uniqueEmail();
        const anotherEmail = server.uniqueEmail();
        const client2 = await Client.createAndVerify(
          config.publicUrl,
          userEmail2,
          password,
          server.mailbox,
          testOptions
        );

        const client2Jwt = await generateMfaJwt(client2);
        await client2.createEmail(client2Jwt, anotherEmail);
        const emailData = await server.mailbox.waitForEmail(anotherEmail);
        const code = emailData.headers['x-verify-code'];
        assert.ok(code, 'email code set');
        await client2.verifySecondaryEmailWithCode(client2Jwt, code, anotherEmail);

        const mfaJwt = await generateMfaJwt(client);
        try {
          await client.setPrimaryEmail(mfaJwt, anotherEmail);
          assert.fail('Should not have set email that belongs to another account');
        } catch (err) {
          assert.equal(err.errno, 148, 'returns correct errno');
          assert.equal(err.code, 400, 'returns correct error code');
        }
      });

      it('fails to change email to unverified email', async () => {
        const someEmail = server.uniqueEmail();
        const mfaJwt = await generateMfaJwt(client);

        await client.createEmail(mfaJwt, someEmail);

        try {
          await client.setPrimaryEmail(mfaJwt, someEmail);
          assert.fail('Should not have set email to an unverified email');
        } catch (err) {
          // we expect the email to be unknown if the email has not been verified
          // the email is only stored in the database if it has been verified
          // until then, it is only reserved in Redis and can't be set as primary
          assert.equal(err.errno, 143, 'returns correct errno');
          assert.equal(err.code, 400, 'returns correct error code');
        }
      });

      it('fails to to change primary email to an unverified email stored in database (legacy)', async () => {
        const someEmail = server.uniqueEmail();
        // Pre-seed the DB with an unverified secondary email record for this uid
        const db = await setupAccountDatabase(cfg.database.mysql.auth);
        try {
          await db
            .insertInto('emails')
            .values({
              email: someEmail,
              normalizedEmail: emailHelper.helpers.normalizeEmail(someEmail),
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

        const mfaJwt = await generateMfaJwt(client);
        try {
          await client.setPrimaryEmail(mfaJwt, someEmail);
          assert.fail('Should not have set email to an unverified email');
        } catch (err) {
          assert.equal(err.errno, 147, 'returns correct errno');
          assert.equal(err.code, 400, 'returns correct error code');
        }
      });

      it('can change primary email', async () => {
        const mfaJwt = await generateMfaJwt(client);
        let res = await client.setPrimaryEmail(mfaJwt, secondEmail);
        assert.ok(res, 'ok response');

        res = await client.accountEmails();
        assert.equal(res.length, 2, 'returns number of emails');
        assert.equal(res[0].email, secondEmail, 'returns correct email');
        assert.equal(res[0].isPrimary, true, 'returns correct isPrimary');
        assert.equal(res[0].verified, true, 'returns correct verified');
        assert.equal(res[1].email, email, 'returns correct email');
        assert.equal(res[1].isPrimary, false, 'returns correct isPrimary');
        assert.equal(res[1].verified, true, 'returns correct verified');

        const emailData = await server.mailbox.waitForEmail(secondEmail);
        assert.equal(emailData.headers['to'], secondEmail, 'to email set');
        assert.equal(emailData.headers['cc'], email, 'cc emails set');
        assert.equal(
          emailData.headers['x-template-name'],
          'postChangePrimary'
        );
      });

      it('can login', async () => {
        const mfaJwt = await generateMfaJwt(client);
        let res = await client.setPrimaryEmail(mfaJwt, secondEmail);
        assert.ok(res, 'ok response');

        if (testOptions.version === 'V2') {
          // Note for V2 we can login with new primary email. The password is not encrypted with
          // the original email, so this now works!
          res = await Client.login(
            config.publicUrl,
            secondEmail,
            password,
            testOptions
          );
          assert.ok(res, 'ok response');
        } else {
          // Verify account can login with new primary email
          try {
            await Client.login(
              config.publicUrl,
              secondEmail,
              password,
              testOptions
            );
            assert.fail(
              new Error(
                'Should have returned correct email for user to login'
              )
            );
          } catch (err) {
            // Login should fail for this user and return the normalizedEmail used when
            // the account was created. We then attempt to re-login with this email and pass
            // the original email used to login
            assert.equal(err.code, 400, 'correct error code');
            assert.equal(err.errno, 120, 'correct errno code');
            assert.equal(err.email, email, 'correct hashed email returned');

            res = await Client.login(config.publicUrl, err.email, password, {
              originalLoginEmail: secondEmail,
              ...testOptions,
            });
            assert.ok(res, 'ok response');
          }
        }
      });

      it('can change password', async () => {
        const mfaJwt = await generateMfaJwt(client);
        let res = await client.setPrimaryEmail(mfaJwt, secondEmail);
        assert.ok(res, 'ok response');

        res = await Client.login(config.publicUrl, email, password, {
          originalLoginEmail: secondEmail,
          ...testOptions,
        });
        client = res;

        res = await client.changePassword(
          newPassword,
          undefined,
          client.sessionToken
        );
        assert.ok(res, 'ok response');

        res = await Client.login(config.publicUrl, email, newPassword, {
          originalLoginEmail: secondEmail,
          ...testOptions,
        });
        assert.ok(res, 'ok response');
      });

      it('can reset password', async () => {
        const mfaJwt = await generateMfaJwt(client);
        let res = await client.setPrimaryEmail(mfaJwt, secondEmail);
        assert.ok(res, 'ok response');

        const emailData = await server.mailbox.waitForEmail(secondEmail);
        assert.equal(emailData.headers['to'], secondEmail, 'to email set');
        assert.equal(emailData.headers['cc'], email, 'cc emails set');
        assert.equal(
          emailData.headers['x-template-name'],
          'postChangePrimary'
        );

        client.email = secondEmail;
        await client.forgotPassword();

        const code = await server.mailbox.waitForCode(secondEmail);
        assert.ok(code, 'code is set');

        res = await resetPassword(client, code, newPassword, undefined, {
          emailToHashWith: email,
        });
        assert.ok(res, 'ok response');

        if (testOptions.version === 'V2') {
          await Client.upgradeCredentials(
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

        res = await Client.login(config.publicUrl, email, newPassword, {
          originalLoginEmail: secondEmail,
          ...testOptions,
        });
        assert.ok(res, 'ok response');
      });

      it('can delete account', async () => {
        const mfaJwt = await generateMfaJwt(client);
        const res = await client.setPrimaryEmail(mfaJwt, secondEmail);
        assert.ok(res, 'ok response');

        await client.destroyAccount();

        try {
          await Client.login(config.publicUrl, email, newPassword, {
            originalLoginEmail: secondEmail,
            ...testOptions,
          });
          assert.fail('Should not have been able to login after deleting account');
        } catch (err) {
          assert.equal(err.errno, 102, 'unknown account error code');
          assert.equal(err.email, secondEmail, 'returns correct email');
        }
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

      // Generate JWTs for both clients
      const client1Jwt = await generateMfaJwt(client1);
      const client2Jwt = await generateMfaJwt(client2);

      // Update client1's email and verify
      await client1.createEmail(client1Jwt, client1SecondEmail);
      emailData = await server.mailbox.waitForEmail(client1SecondEmail);
      emailCode = emailData['headers']['x-verify-code'];
      await client1.verifySecondaryEmailWithCode(client1Jwt, emailCode, client1SecondEmail);

      // Update client2
      await client2.createEmail(client2Jwt, client2SecondEmail);
      emailData = await server.mailbox.waitForEmail(client2SecondEmail);
      emailCode = emailData['headers']['x-verify-code'];
      await client2.verifySecondaryEmailWithCode(client2Jwt, emailCode, client2SecondEmail);

      await client1.setPrimaryEmail(client1Jwt, client1SecondEmail);
      await client1.deleteEmail(client1Jwt, client1Email);

      await client2.setPrimaryEmail(client2Jwt, client2SecondEmail);
      await client2.deleteEmail(client2Jwt, client2Email);

      await client1.createEmail(client1Jwt, client2Email);
      emailData = await server.mailbox.waitForEmail(client2Email);
      emailCode = emailData[2]['headers']['x-verify-code'];
      await client1.verifySecondaryEmailWithCode(client1Jwt, emailCode, client2Email);
      await client1.setPrimaryEmail(client1Jwt, client2Email);
      await client1.deleteEmail(client1Jwt, client1SecondEmail);

      await client2.createEmail(client2Jwt, client1Email);
      emailData = await server.mailbox.waitForEmail(client1Email);
      emailCode = emailData[2]['headers']['x-verify-code'];
      await client2.verifySecondaryEmailWithCode(client2Jwt, emailCode, client1Email);
      await client2.setPrimaryEmail(client2Jwt, client1Email);
      await client2.deleteEmail(client2Jwt, client2SecondEmail);

      const res = await Client.login(config.publicUrl, client1Email, password, {
        originalLoginEmail: client2Email,
        ...testOptions,
      });

      assert.ok(res, 'ok response');
    });

    describe('change primary email, deletes old primary', () => {
      beforeEach(async () => {
        const mfaJwt = await generateMfaJwt(client);

        let res = await client.setPrimaryEmail(mfaJwt, secondEmail);
        assert.ok(res, 'ok response');

        let emailData = await server.mailbox.waitForEmail(secondEmail);
        assert.equal(emailData.headers['to'], secondEmail, 'to email set');
        assert.equal(emailData.headers['cc'], email, 'cc emails set');
        assert.equal(
          emailData.headers['x-template-name'],
          'postChangePrimary'
        );

        res = await client.deleteEmail(mfaJwt, email);
        assert.ok(res, 'ok response');

        res = await client.accountEmails();
        assert.equal(res.length, 1, 'returns number of emails');
        assert.equal(res[0].email, secondEmail, 'returns correct email');
        assert.equal(res[0].isPrimary, true, 'returns correct isPrimary');
        assert.equal(res[0].verified, true, 'returns correct verified');

        // Primary account is notified that secondary email has been removed
        emailData = await server.mailbox.waitForEmail(secondEmail);
        const templateName = emailData['headers']['x-template-name'];
        assert.equal(templateName, 'postRemoveSecondary');
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
        return Client.login(
          config.publicUrl,
          secondEmail,
          password,
          testOptions
        )
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
            return client.changePassword(
              newPassword,
              undefined,
              client.sessionToken
            );
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

    async function resetPassword(client, otpCode, newPassword, headers, options) {
      const result = await client.verifyPasswordForgotOtp(otpCode, options);
      await client.verifyPasswordResetCode(result.code, headers, options);
      return client.resetPassword(newPassword, {}, options);
    }
  });
});
