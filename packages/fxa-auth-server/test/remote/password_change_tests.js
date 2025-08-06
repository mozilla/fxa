/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const Client = require('../client')();
const config = require('../../config').default.getProperties();
const TestServer = require('../test_server');
const url = require('url');
const tokens = require('../../lib/tokens')({ trace: function () {} });

function getSessionTokenId(sessionTokenHex) {
  return tokens.SessionToken.fromHex(sessionTokenHex).then((token) => {
    return token.id;
  });
}

[{ version: '' }, { version: 'V2' }].forEach((testOptions) => {
  describe(`#integration${testOptions.version} - remote password change`, function () {
    this.timeout(60000);
    let server;
    before(async () => {
      config.securityHistory.ipProfiling.allowedRecency = 0;
      config.signinConfirmation.skipForNewAccounts.enabled = false;

      server = await TestServer.start(config);
    });

    after(async () => {
      await TestServer.stop(server);
    });

    it('password change, with unverified session', () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';
      const newPassword = 'foobar';
      let client;

      return Client.createAndVerify(
        config.publicUrl,
        email,
        password,
        server.mailbox,
        {
          ...testOptions,
          keys: true,
        }
      )
        .then((x) => {
          client = x;
          return client.emailStatus();
        })
        .then((status) => {
          assert.equal(status.verified, true, 'account is verified');
        })
        .then(() => {
          // Login from different location to created unverified session
          return Client.login(config.publicUrl, email, password, {
            ...testOptions,
            keys: true,
          });
        })
        .then((c) => {
          client = c;
          return client.emailStatus();
        })
        .then((status) => {
          // Verify correct status
          assert.equal(status.verified, false, 'account is unverified');
          assert.equal(status.emailVerified, true, 'account email is verified');
          assert.equal(
            status.sessionVerified,
            false,
            'account session is unverified'
          );
        })
        .then(() => {
          return client.changePassword(
            newPassword,
            undefined,
            client.sessionToken
          );
        })
        .catch((err) => {
          assert.equal(err.errno, 138);
          assert.equal(err.error, 'Bad Request');
          assert.equal(err.message, 'Unconfirmed session');
        });
    });

    it('password change, with verified session', () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';
      const newPassword = 'foobar';
      let kB, kA, client, firstAuthPW, originalSessionToken;

      return Client.createAndVerify(
        config.publicUrl,
        email,
        password,
        server.mailbox,
        {
          ...testOptions,
          keys: true,
        }
      )
        .then((x) => {
          client = x;
          originalSessionToken = client.sessionToken;
          firstAuthPW = x.authPW.toString('hex');
          return client.keys();
        })
        .then((keys) => {
          kB = keys.kB;
          kA = keys.kA;
        })
        .then(() => {
          return client.emailStatus();
        })
        .then((status) => {
          assert.equal(status.verified, true, 'account is verified');
        })
        .then(() => {
          return client.changePassword(
            newPassword,
            undefined,
            client.sessionToken
          );
        })
        .then((response) => {
          assert.notEqual(
            response.sessionToken,
            originalSessionToken,
            'session token has changed'
          );
          assert.ok(response.keyFetchToken, 'key fetch token returned');
          assert.notEqual(
            client.authPW.toString('hex'),
            firstAuthPW,
            'password has changed'
          );
        })
        .then(() => {
          return server.mailbox.waitForEmail(email);
        })
        .then((emailData) => {
          const subject = emailData.headers['subject'];
          assert.equal(subject, 'Password updated');
          const link = emailData.headers['x-link'];
          const query = url.parse(link, true).query;
          assert.ok(query.email, 'email is in the link');
        })
        .then(() => {
          return client.emailStatus();
        })
        .then((status) => {
          assert.equal(status.verified, true, 'account is verified');
        })
        .then(() => {
          return Client.loginAndVerify(
            config.publicUrl,
            email,
            newPassword,
            server.mailbox,
            {
              ...testOptions,
              keys: true,
            }
          );
        })
        .then((x) => {
          client = x;
          return client.keys();
        })
        .then((keys) => {
          assert.deepEqual(keys.kB, kB, 'kB is preserved');
          assert.deepEqual(keys.kA, kA, 'kA is preserved');
        });
    });

    it('cannot password change w/o sessionToken', () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';
      const newPassword = 'foobar';
      let client = undefined;

      return Client.createAndVerify(
        config.publicUrl,
        email,
        password,
        server.mailbox,
        {
          ...testOptions,
          keys: true,
        }
      )
        .then((x) => {
          client = x;
        })
        .then(() => {
          return client.changePassword(newPassword, undefined, undefined);
        })
        .catch((err) => {
          assert.equal(err.errno, 110);
          assert.equal(err.error, 'Unauthorized');
        });
    });

    it('password change does not update keysChangedAt', async () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';
      const newPassword = 'foobar';

      let client = await Client.createAndVerify(
        config.publicUrl,
        email,
        password,
        server.mailbox,
        testOptions
      );

      const profileBefore = await client.accountProfile();

      await client.changePassword(newPassword, undefined, client.sessionToken);
      await server.mailbox.waitForEmail(email);

      client = await Client.loginAndVerify(
        config.publicUrl,
        email,
        newPassword,
        server.mailbox,
        testOptions
      );

      const profileAfter = await client.accountProfile();
      assert.equal(
        profileBefore['keysChangedAt'],
        profileAfter['keysChangedAt']
      );
    });

    it('wrong password on change start', () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';
      let client = null;
      return Client.createAndVerify(
        config.publicUrl,
        email,
        password,
        server.mailbox,
        {
          ...testOptions,
          keys: true,
        }
      )
        .then((x) => {
          client = x;
          return client.keys();
        })
        .then(() => {
          client.authPW = Buffer.from(
            '0000000000000000000000000000000000000000000000000000000000000000',
            'hex'
          );
          return client.changePassword(
            'foobar',
            undefined,
            client.sessionToken
          );
        })
        .then(
          () => assert(false),
          (err) => {
            assert.equal(err.errno, 103, 'invalid password');
          }
        );
    });

    it("shouldn't change password on account with TOTP without passing sessionToken", () => {
      const email = server.uniqueEmail();
      const password = 'ok';
      let client;
      return Client.createAndVerifyAndTOTP(
        config.publicUrl,
        email,
        password,
        server.mailbox,
        {
          ...testOptions,
          keys: true,
        }
      )
        .then((res) => {
          client = res;

          // Doesn't specify a sessionToken to use
          return client.changePassword('foobar', undefined, undefined);
        })
        .then(assert.fail, (err) => {
          assert.equal(err.errno, 110);
          assert.equal(err.error, 'Unauthorized');
        });
    });

    it('should change password on account with TOTP with verified TOTP sessionToken', () => {
      const email = server.uniqueEmail();
      const password = 'ok';
      let client, firstAuthPW, secondAuthPW;
      return (
        Client.createAndVerifyAndTOTP(
          config.publicUrl,
          email,
          password,
          server.mailbox,
          {
            ...testOptions,
            keys: true,
          }
        )
          .then((res) => {
            client = res;
            firstAuthPW = client.authPW.toString('hex');
            return client.changePassword(
              'foobar',
              undefined,
              client.sessionToken
            );
          })
          .then((response) => {
            secondAuthPW = client.authPW.toString('hex');
            assert(response.sessionToken, 'session token returned');
            assert(response.keyFetchToken, 'key fetch token returned');
            assert.notEqual(secondAuthPW, firstAuthPW, 'password has changed');
            return response.sessionToken;
          })
          // Do it again to see if the new session is also verified
          .then((sessionToken) => {
            return getSessionTokenId(sessionToken);
          })
          .then((sessionTokenId) => {
            return client.changePassword(
              'fizzbuzz',
              undefined,
              client.sessionToken
            );
          })
          .then((response) => {
            assert.notEqual(
              client.authPW.toString('hex'),
              secondAuthPW,
              'password has changed'
            );
            assert(response.sessionToken, 'session token returned');
            assert(response.keyFetchToken, 'key fetch token returned');
          })
      );
    });

    it("shouldn't change password on account with TOTP with unverified sessionToken", () => {
      const email = server.uniqueEmail();
      const password = 'ok';
      let client;
      return (
        Client.createAndVerifyAndTOTP(
          config.publicUrl,
          email,
          password,
          server.mailbox,
          {
            ...testOptions,
            keys: true,
          }
        )
          // Create new unverified client
          .then(() =>
            Client.login(config.publicUrl, email, password, {
              ...testOptions,
              keys: true,
            })
          )
          .then((res) => {
            client = res;
            return client.changePassword(
              'foobar',
              undefined,
              client.sessionToken
            );
          })
          .then(assert.fail, (err) => {
            assert.equal(err.message, 'Unconfirmed session');
            assert.equal(err.errno, 138);
          })
      );
    });

    // See FXA-11960 and FXA-12107 for more context
    describe('extra password change checks', async () => {
      const defaultPassword = 'ok';

      async function createVerifiedUser() {
        return await Client.createAndVerify(
          config.publicUrl,
          server.uniqueEmail(),
          defaultPassword,
          server.mailbox,
          {
            ...testOptions,
            keys: true,
          }
        );
      }

      async function loginUser(email, password, options) {
        return await Client.login(config.publicUrl, email, password, {
          ...testOptions,
          ...options,
        });
      }

      async function createVerifiedUserWithVerifiedTOTP() {
        return await Client.createAndVerifyAndTOTP(
          config.publicUrl,
          server.uniqueEmail(),
          defaultPassword,
          server.mailbox,
          {
            ...testOptions,
            keys: true,
          }
        );
      }

      async function changePassword(victim, attacker) {
        let startResult = undefined;
        let startError = undefined;
        try {
          // Bad actor conducts a password change request on the victims email, using a leaked password!
          startResult = await attacker.api.passwordChangeStart(
            victim.email,
            victim.authPW,
            undefined, // headers
            attacker.sessionToken
          );
        } catch (err) {
          startError = err;
        }

        // This will change the victims password state and generate a new authPW!
        await victim.setupCredentials(victim.email, 'bogus');

        // Now try to finish the password change and alter the user's password!
        let finishResult = undefined;
        let finishError = undefined;
        if (startResult) {
          try {
            // Update the victims
            finishResult = await attacker.api.passwordChangeFinish(
              startResult.passwordChangeToken,
              victim.authPW,
              victim.unwrapBKey,
              undefined, // headers
              attacker.sessionToken
            );
          } catch (err) {
            finishError = err;
          }
        }

        // This will restore the original password
        await victim.setupCredentials(victim.email, 'ok');

        return {
          unwrapBKey: startResult?.unwrapBKey,
          keyFetchToken: startResult?.keyFetchToken,
          res: startResult || finishResult,
          error: startError || finishError,
        };
      }

      async function validatePasswordChanged(victim, res, error) {
        // The victim should be able to login with the original password, if this throws, then the attacker
        // successfully changed the victim's password.
        try {
          await victim.setupCredentials(victim.email, 'ok');
          await victim.auth();
        } catch {
          assert.fail("Victim's password changed!");
        }

        assert.isUndefined(res?.sessionToken);
        assert.match(error.error, /Unauthorized|Bad Request/);
      }

      it('requires session to call /password/change/start', async () => {
        const victim = await createVerifiedUserWithVerifiedTOTP();
        const badActor = await createVerifiedUserWithVerifiedTOTP();

        try {
          await badActor.api.passwordChangeStart(
            victim.email,
            victim.authPW,
            undefined,
            undefined
          );
          assert.fail('Should have failed.');
        } catch (err) {
          assert.equal(
            err.message,
            'Invalid authentication token: Missing authentication'
          );
        }
      });

      it('requires session to call /password/change/finish', async () => {
        const victim = await createVerifiedUserWithVerifiedTOTP();
        const badActor = await createVerifiedUserWithVerifiedTOTP();

        const startResult = await badActor.api.passwordChangeStart(
          victim.email,
          victim.authPW,
          undefined,
          victim.sessionToken
        );

        try {
          await victim.setupCredentials(victim.email, 'bogus');
          await badActor.api.passwordChangeFinish(
            startResult.passwordChangeToken,
            victim.authPW,
            victim.unwrapBKey,
            undefined, // headers
            undefined // sessionToken
          );
          assert.fail('Should have failed.');
        } catch (err) {
          assert.equal(
            err.message,
            'Missing parameter in request body: sessionToken'
          );
        }
      });

      it('can get keys after /password/change/start for verified user', async () => {
        const user = await createVerifiedUser();

        const result = await user.api.passwordChangeStart(
          user.email,
          user.authPW,
          undefined, // headers
          user.sessionToken
        );
        const keys = await user.api.accountKeys(result.keyFetchToken);
        assert.isDefined(keys.bundle);
      });

      it('can get keys after /password/change/start for verified 2FA user', async () => {
        const user = await createVerifiedUserWithVerifiedTOTP();
        const result = await user.api.passwordChangeStart(
          user.email,
          user.authPW,
          undefined, // headers
          user.sessionToken
        );
        const keys = await user.api.accountKeys(result.keyFetchToken);
        assert.isDefined(keys.bundle);
      });

      it('cannot get key fetch token from /password/change/start for unverified 2FA user', async () => {
        let user = await createVerifiedUserWithVerifiedTOTP();
        await user.destroySession();
        user = await loginUser(user.email, defaultPassword, {
          keys: true,
        });

        try {
          const result = await user.api.passwordChangeStart(
            user.email,
            user.authPW,
            undefined, // headers
            user.sessionToken // sessionToken, not actually required or checked by /password/change/start at the moment, so leaving undefined!);
          );
          await user.api.accountKeys(result.keyFetchToken);
          assert.fail('Should have failed.');
        } catch (err) {
          assert.equal(err.message, 'Unconfirmed session');
        }
      });

      it('cannot get key fetch token from /password/change/start without providing sessionToken', async () => {
        const victim = await createVerifiedUserWithVerifiedTOTP();
        const badActor = await createVerifiedUser();
        try {
          const result = await badActor.api.passwordChangeStart(
            victim.email,
            victim.authPW,
            undefined, // headers
            undefined // sessionToken
          );
          await badActor.api.accountKeys(result.keyFetchToken);
          assert.fail('Should have failed.');
        } catch (err) {
          assert.equal(
            err.message,
            'Invalid authentication token: Missing authentication'
          );
        }
      });

      it('cannot get keys after /password/change/start by providing verified session token from a different user', async () => {
        const victim = await createVerifiedUser();
        const badActor = await createVerifiedUser();

        try {
          await badActor.api.passwordChangeStart(
            victim.email,
            victim.authPW,
            undefined, // headers
            badActor.sessionToken
          );
          assert.fail('Should have failed.');
        } catch (err) {
          assert.equal(err.message, 'Invalid session token');
        }
      });

      it('cannot change password using session token from a different verified user', async () => {
        const victim = await createVerifiedUser();
        const badActor = await createVerifiedUser();

        const { error, res } = await changePassword(victim, badActor);

        // The attack should have failed! If the attacker provides a session token that
        // doesn't belong to the user's account, it should be rejected!
        await validatePasswordChanged(victim, res, error);
      });

      it('cannot change password using session token with verified 2FA from a different user', async () => {
        const victim = await createVerifiedUser();
        const badActor = await createVerifiedUserWithVerifiedTOTP();

        const { error, res } = await changePassword(victim, badActor);

        // The attack should have failed! If the attacker provides a session token that
        // doesn't belong to the user's account, it should be rejected!
        await validatePasswordChanged(victim, res, error);
      });

      it('cannot change password of 2FA user by using session token from a different verified user', async () => {
        const victim = await createVerifiedUserWithVerifiedTOTP();
        const badActor = await createVerifiedUser();
        const { error, res } = await changePassword(victim, badActor);

        // The attack should have failed! If the victim has 2FA enabled, the attacker MUST
        // provide a verified 2FA session token that belongs the victims account in oder
        // to alter the password.
        await validatePasswordChanged(victim, res, error);
      });

      it('cannot change password of 2FA user by using session token with verified 2FA from a different user', async () => {
        const victim = await createVerifiedUserWithVerifiedTOTP();
        const badActor = await createVerifiedUserWithVerifiedTOTP();
        const { error, res } = await changePassword(victim, badActor);

        // The attack should have failed! If the victim has 2FA enabled, the attacker MUST
        // provide a verified 2FA session token that belongs the victims account in oder
        // to alter the password.
        await validatePasswordChanged(victim, res, error);
      });
    });
  });
});
