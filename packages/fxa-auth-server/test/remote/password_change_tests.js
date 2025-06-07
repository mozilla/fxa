/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const Client = require('../client')();
const config = require('../../config').default.getProperties();
const url = require('url');
const { TestUtilities } = require('../test_utilities');
const getMailbox = require('../mailbox');

const tokens = require('../../lib/tokens')({ trace: function () {} });
function getSessionTokenId(sessionTokenHex) {
  return tokens.SessionToken.fromHex(sessionTokenHex).then((token) => {
    return token.id;
  });
}

[{ version: '' }, { version: 'V2' }].forEach((testOptions) => {
  describe(`#integration${testOptions.version} - remote password change`, function () {
    let mailbox;
    before(async () => {
      // these might not work how we think... need to test.
      // config.securityHistory.ipProfiling.allowedRecency = 0;
      process.env.IP_PROFILING_RECENCY = 0;
      // config.signinConfirmation.skipForNewAccounts.enabled = false;
      process.env.SIGNIN_CONFIRMATION_SKIP_FOR_NEW_ACCOUNTS = false;
      mailbox = getMailbox(
        config.smtp.api.host,
        config.smtp.api.port,
        false
      );
    });

    after(async () => {
      process.env.SIGNIN_CONFIRMATION_SKIP_FOR_NEW_ACCOUNTS =
        config.signinConfirmation.skipForNewAccounts.enabled
      process.env.IP_PROFILING_RECENCY =
        config.securityHistory.ipProfiling.allowedRecency;
    });

    it('password change, with unverified session', () => {
      const email = TestUtilities.uniqueEmail();
      const password = 'allyourbasearebelongtous';
      const newPassword = 'foobar';
      let kB, kA, client, firstAuthPW, originalSessionToken;

      return Client.createAndVerify(
        config.publicUrl,
        email,
        password,
        mailbox,
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
          // Login from different location to created unverified session
          return Client.login(config.publicUrl, email, password, {
            ...testOptions,
            keys: true,
          });
        })
        .then((c) => {
          client = c;
        })
        .then(() => {
          // Ignore confirm login email
          return mailbox.waitForEmail(email);
        })
        .then(() => {
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
          return getSessionTokenId(client.sessionToken);
        })
        .then((sessionTokenId) => {
          return client.changePassword(newPassword, undefined, sessionTokenId);
        })
        .then((response) => {
          // Verify correct change password response
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
          return mailbox.waitForEmail(email);
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
          return Client.loginAndVerify(
            config.publicUrl,
            email,
            newPassword,
            mailbox,
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

    it('password change, with verified session', () => {
      const email = TestUtilities.uniqueEmail();
      const password = 'allyourbasearebelongtous';
      const newPassword = 'foobar';
      let kB, kA, client, firstAuthPW, originalSessionToken;

      return Client.createAndVerify(
        config.publicUrl,
        email,
        password,
        mailbox,
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
          return getSessionTokenId(client.sessionToken);
        })
        .then((sessionTokenId) => {
          return client.changePassword(newPassword, undefined, sessionTokenId);
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
          return mailbox.waitForEmail(email);
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
            mailbox,
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

    it('password change, with raw session data rather than session token id, return invalid token error', () => {
      const email = TestUtilities.uniqueEmail();
      const password = 'allyourbasearebelongtous';
      const newPassword = 'foobar';
      let client;

      return Client.createAndVerify(
        config.publicUrl,
        email,
        password,
        mailbox,
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
        .then(
          () => {
            assert(false);
          },
          (err) => {
            assert.equal(err.errno, 110, 'Invalid token error');
            assert.equal(
              err.message,
              'The authentication token could not be found'
            );
          }
        );
    });

    it('password change w/o sessionToken', () => {
      const email = TestUtilities.uniqueEmail();
      const password = 'allyourbasearebelongtous';
      const newPassword = 'foobar';
      let kB, kA, client, firstAuthPW;

      return Client.createAndVerify(
        config.publicUrl,
        email,
        password,
        mailbox,
        {
          ...testOptions,
          keys: true,
        }
      )
        .then((x) => {
          client = x;
          firstAuthPW = x.authPW.toString('hex');
          return client.keys();
        })
        .then((keys) => {
          kB = keys.kB;
          kA = keys.kA;
        })
        .then(() => {
          return client.changePassword(newPassword);
        })
        .then((response) => {
          assert(!response.sessionToken, 'no session token returned');
          assert(!response.keyFetchToken, 'no key fetch token returned');
          assert.notEqual(
            client.authPW.toString('hex'),
            firstAuthPW,
            'password has changed'
          );
        })
        .then(() => {
          return mailbox.waitForEmail(email);
        })
        .then((emailData) => {
          const subject = emailData.headers['subject'];
          assert.equal(subject, 'Password updated');
          const link = emailData.headers['x-link'];
          const query = url.parse(link, true).query;
          assert.ok(query.email, 'email is in the link');
        })
        .then(() => {
          return Client.loginAndVerify(
            config.publicUrl,
            email,
            newPassword,
            mailbox,
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

    it('password change does not update keysChangedAt', async () => {
      const email = TestUtilities.uniqueEmail();
      const password = 'allyourbasearebelongtous';
      const newPassword = 'foobar';

      let client = await Client.createAndVerify(
        config.publicUrl,
        email,
        password,
        mailbox,
        testOptions
      );

      const profileBefore = await client.accountProfile();

      await client.changePassword(newPassword);
      await mailbox.waitForEmail(email);

      client = await Client.loginAndVerify(
        config.publicUrl,
        email,
        newPassword,
        mailbox,
        testOptions
      );

      const profileAfter = await client.accountProfile();
      assert.equal(
        profileBefore['keysChangedAt'],
        profileAfter['keysChangedAt']
      );
    });

    it('wrong password on change start', () => {
      const email = TestUtilities.uniqueEmail();
      const password = 'allyourbasearebelongtous';
      let client = null;
      return Client.createAndVerify(
        config.publicUrl,
        email,
        password,
        mailbox,
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
          return client.changePassword('foobar');
        })
        .then(
          () => assert(false),
          (err) => {
            assert.equal(err.errno, 103, 'invalid password');
          }
        );
    });

    it("shouldn't change password on account with TOTP without passing sessionToken", () => {
      const email = TestUtilities.uniqueEmail();
      const password = 'ok';
      let client;
      return Client.createAndVerifyAndTOTP(
        config.publicUrl,
        email,
        password,
        mailbox,
        {
          ...testOptions,
          keys: true,
        }
      )
        .then((res) => {
          client = res;

          // Doesn't specify a sessionToken to use
          return client.changePassword('foobar');
        })
        .then(assert.fail, (err) => {
          assert.equal(err.errno, 138, 'unverified session');
        });
    });

    it('should change password on account with TOTP with verified TOTP sessionToken', () => {
      const email = TestUtilities.uniqueEmail();
      const password = 'ok';
      let client, firstAuthPW, secondAuthPW;
      return (
        Client.createAndVerifyAndTOTP(
          config.publicUrl,
          email,
          password,
          mailbox,
          {
            ...testOptions,
            keys: true,
          }
        )
          .then((res) => {
            client = res;
            firstAuthPW = client.authPW.toString('hex');
            return getSessionTokenId(client.sessionToken);
          })
          .then((sessionTokenId) => {
            return client.changePassword('foobar', undefined, sessionTokenId);
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
            return client.changePassword('fizzbuzz', undefined, sessionTokenId);
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
      const email = TestUtilities.uniqueEmail();
      const password = 'ok';
      let client;
      return (
        Client.createAndVerifyAndTOTP(
          config.publicUrl,
          email,
          password,
          mailbox,
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
            return getSessionTokenId(client.sessionToken);
          })
          .then((sessionTokenId) => {
            return client.changePassword('foobar', undefined, sessionTokenId);
          })
          .then(assert.fail, (err) => {
            assert.equal(err.errno, 138, 'unverified session');
          })
      );
    });
  });
});
