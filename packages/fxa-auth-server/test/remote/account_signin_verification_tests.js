/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const TestServer = require('../test_server');
const Client = require('../client')();
const config = require('../../config').default.getProperties();
const url = require('url');
const mocks = require('../mocks');

// Note, intentionally not indenting for code review.
[{ version: '' }, { version: 'V2' }].forEach((testOptions) => {
  /**
   * Note, these tests are run in #serial because they modify the
   * config from it's defaults and require the unique config when
   * starting the test server.
   */
  describe(`#integration${testOptions.version} - #serial - remote account signin verification`, function () {
    let server;

    before(async () => {
      config.redis.sessionTokens.enabled = false;
      config.securityHistory.ipProfiling.allowedRecency = 0;
      config.signinConfirmation.skipForNewAccounts.enabled = false;
      server = await TestServer.start(config);
    });

    after(async () => {
      await TestServer.stop(server);
    });

    it('account signin without keys does not set challenge', () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';
      let client = null;
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
        })
        .then(() => {
          return client.login({ keys: false });
        })
        .then((response) => {
          assert(!response.verificationMethod, 'no challenge method set');
          assert(!response.verificationReason, 'no challenge reason set');
          assert.equal(response.verified, true, 'verified set true');
        });
    });

    it('account signin with keys does set challenge', () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';
      let client = null;
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
        })
        .then(() => {
          return client.login({ keys: true });
        })
        .then((response) => {
          assert.equal(
            response.verificationMethod,
            'email',
            'challenge method set'
          );
          assert.equal(
            response.verificationReason,
            'login',
            'challenge reason set'
          );
          assert.equal(response.verified, false, 'verified set to false');
        });
    });

    it('account can verify new sign-in from email', () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';
      let client = null;
      let uid;
      let code;
      const loginOpts = {
        keys: true,
        metricsContext: mocks.generateMetricsContext(),
      };
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
          assert.equal(status.verified, true, 'new account is verified');
        })
        .then(() => {
          return client.login(loginOpts);
        })
        .then((response) => {
          assert.equal(
            response.verificationMethod,
            'email',
            'challenge method set to email'
          );
          assert.equal(
            response.verificationReason,
            'login',
            'challenge reason set to signin'
          );
          assert.equal(response.verified, false, 'verified set to false');
        })
        .then(() => {
          return server.mailbox.waitForEmail(email);
        })
        .then((emailData) => {
          uid = emailData.headers['x-uid'];
          code = emailData.headers['x-verify-code'];
          assert.equal(emailData.subject, 'Confirm sign-in');
          assert.ok(uid, 'sent uid');
          assert.ok(code, 'sent verify code');

          assert.equal(
            emailData.headers['x-flow-begin-time'],
            loginOpts.metricsContext.flowBeginTime,
            'flow begin time set'
          );
          assert.equal(
            emailData.headers['x-flow-id'],
            loginOpts.metricsContext.flowId,
            'flow id set'
          );
        })
        .then(() => {
          return client.emailStatus();
        })
        .then((status) => {
          assert.equal(
            status.verified,
            false,
            'account is not verified, unverified sign-in'
          );
        })
        .then(() => {
          return client.verifyEmail(code);
        })
        .then(() => {
          return client.emailStatus();
        })
        .then((status) => {
          assert.equal(
            status.verified,
            true,
            'account is verified confirming email'
          );
        });
    });

    it('Account verification links still work after session verification', () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';
      let client = null;
      let emailCode, tokenCode, uid;

      // Create unverified account
      return Client.create(config.publicUrl, email, password, testOptions)
        .then((x) => {
          client = x;
        })
        .then(() => {
          return server.mailbox.waitForEmail(email);
        })
        .then((emailData) => {
          // Ensure correct email sent
          assert.equal(emailData.subject, 'Finish creating your account');
          emailCode = emailData.headers['x-verify-code'];
          assert.ok(emailCode, 'sent verify code');
          return client.verifyEmail(emailCode);
        })
        .then(() => {
          // Trigger sign-in confirm email
          return client.login({ keys: true });
        })
        .then(() => {
          return server.mailbox.waitForEmail(email);
        })
        .then((emailData) => {
          // Verify sign-confirm email
          uid = emailData.headers['x-uid'];
          tokenCode = emailData.headers['x-verify-code'];
          assert.equal(emailData.subject, 'Confirm sign-in');
          assert.ok(uid, 'sent uid');
          assert.ok(tokenCode, 'sent verify code');
          assert.notEqual(
            tokenCode,
            emailCode,
            'email and token codes are different'
          );

          return client.emailStatus();
        })
        .then((status) => {
          // Verify account is unverified because of sign-in attempt
          assert.equal(status.verified, false, 'account is not verified,');
          assert.equal(
            status.sessionVerified,
            false,
            'account is not verified, unverified sign-in session'
          );

          // Attempt to verify account reusing original email code
          return client.verifyEmail(emailCode);
        });
    });

    it('sign-in verification email link', () => {
      const email = server.uniqueEmail();
      const password = 'something';
      let client = null;
      const options = {
        ...testOptions,
        redirectTo: `https://sync.${config.smtp.redirectDomain}`,
        service: 'sync',
        resume: 'resumeToken',
        keys: true,
      };
      return Client.createAndVerify(
        config.publicUrl,
        email,
        password,
        server.mailbox,
        options
      )
        .then((c) => {
          client = c;
        })
        .then(() => {
          return client.login(options);
        })
        .then(() => {
          return server.mailbox.waitForEmail(email);
        })
        .then((emailData) => {
          const link = emailData.headers['x-link'];
          const query = url.parse(link, true).query;
          assert.ok(query.uid, 'uid is in link');
          assert.ok(query.code, 'code is in link');
          assert.equal(query.service, options.service, 'service is in link');
          assert.equal(query.resume, options.resume, 'resume is in link');
          assert.equal(emailData.subject, 'Confirm sign-in');
        });
    });

    it('sign-in verification from different client', () => {
      const email = server.uniqueEmail();
      const password = 'something';
      let client = null;
      let client2 = null;
      const options = {
        ...testOptions,
        redirectTo: `https://sync.${config.smtp.redirectDomain}`,
        service: 'sync',
        resume: 'resumeToken',
        keys: true,
      };
      return Client.createAndVerify(
        config.publicUrl,
        email,
        password,
        server.mailbox,
        options
      )
        .then((c) => {
          client = c;
        })
        .then(() => {
          return client.login(options);
        })
        .then(() => {
          return server.mailbox.waitForEmail(email);
        })
        .then((emailData) => {
          const link = emailData.headers['x-link'];
          const query = url.parse(link, true).query;
          assert.ok(query.uid, 'uid is in link');
          assert.ok(query.code, 'code is in link');
          assert.equal(query.service, options.service, 'service is in link');
          assert.equal(query.resume, options.resume, 'resume is in link');
          assert.equal(emailData.subject, 'Confirm sign-in');
        })
        .then(() => {
          // Attempt to login from new location
          return Client.login(config.publicUrl, email, password, options);
        })
        .then((c) => {
          client2 = c;
        })
        .then(() => {
          // Clears inbox of new signin email
          return server.mailbox.waitForEmail(email);
        })
        .then(() => {
          return client2.login(options);
        })
        .then(() => {
          return server.mailbox.waitForCode(email);
        })
        .then((code) => {
          // Verify account from client2
          return client2.verifyEmail(code, options);
        })
        .then(() => {
          return client2.emailStatus();
        })
        .then((status) => {
          assert.equal(status.verified, true, 'account is verified');
          assert.equal(status.emailVerified, true, 'account email is verified');
          assert.equal(
            status.sessionVerified,
            true,
            'account session is  verified'
          );
        })
        .then(() => {
          return client.emailStatus();
        })
        .then((status) => {
          assert.equal(status.verified, false, 'account is not verified');
          assert.equal(status.emailVerified, true, 'account email is verified');
          assert.equal(
            status.sessionVerified,
            false,
            'account session is not verified'
          );
        });
    });

    it('account keys, return keys on verified account', () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';
      let client = null;
      let tokenCode;

      return Client.create(config.publicUrl, email, password, {
        ...testOptions,
        keys: true,
      })
        .then((c) => {
          client = c;
          return client.emailStatus();
        })
        .then((status) => {
          assert.equal(status.verified, false, 'account is not verified');
          assert.equal(
            status.emailVerified,
            false,
            'account email is not verified'
          );
          assert.equal(
            status.sessionVerified,
            false,
            'account session is not verified'
          );
        })
        .then(() => {
          return server.mailbox.waitForEmail(email);
        })
        .then((emailData) => {
          assert.equal(emailData.subject, 'Finish creating your account');
          tokenCode = emailData.headers['x-verify-code'];
          assert.ok(tokenCode, 'sent verify code');
        })
        .then(() => {
          // Unverified accounts can not retrieve keys
          return client.keys();
        })
        .catch((err) => {
          assert.equal(err.errno, 104, 'Correct error number');
          assert.equal(err.code, 400, 'Correct error code');
          assert.equal(
            err.message,
            'Unconfirmed account',
            'Correct error message'
          );
        })

        .then(() => {
          // Verify the account will set emails and tokens verified, which
          // will user to retrieve keys.
          return client.verifyEmail(tokenCode);
        })
        .then(() => {
          return client.emailStatus();
        })
        .then((status) => {
          assert.equal(status.verified, true, 'account is verified');
          assert.equal(status.emailVerified, true, 'account email is verified');
          assert.equal(
            status.sessionVerified,
            true,
            'account session is  verified'
          );
        })
        .then(() => {
          // Once verified, keys can be returned
          return client.keys();
        })
        .then((keys) => {
          assert.ok(keys.kA, 'has kA keys');
          assert.ok(keys.kB, 'has kB keys');
          assert.ok(keys.wrapKb, 'has wrapKb keys');
        });
    });

    it('account keys, return keys on verified login', () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';
      let client = null;
      let tokenCode;

      return Client.createAndVerify(
        config.publicUrl,
        email,
        password,
        server.mailbox,
        { ...testOptions, keys: true }
      )
        .then((c) => {
          // Trigger confirm sign-in
          client = c;
          return client.login({ keys: true });
        })
        .then((c) => {
          client = c;
          return server.mailbox.waitForEmail(email);
        })
        .then((emailData) => {
          assert.equal(emailData.subject, 'Confirm sign-in');
          tokenCode = emailData.headers['x-verify-code'];
          assert.ok(tokenCode, 'sent verify code');
        })
        .then(() => {
          return client.keys();
        })
        .then(
          () => assert(false),
          (err) => {
            // Because of unverified sign-in, requests for keys will fail
            assert.equal(err.errno, 104, 'Correct error number');
            assert.equal(err.code, 400, 'Correct error code');
            assert.equal(
              err.message,
              'Unconfirmed account',
              'Correct error message'
            );
          }
        )
        .then(() => {
          return client.emailStatus();
        })
        .then((status) => {
          // Verify status of account, only email should be verified
          assert.equal(status.verified, false, 'account is not verified');
          assert.equal(status.emailVerified, true, 'account email is verified');
          assert.equal(
            status.sessionVerified,
            false,
            'account session is not verified'
          );
        })
        .then(() => {
          // Verify the account will set tokens verified.
          return client.verifyEmail(tokenCode);
        })
        .then(() => {
          return client.emailStatus();
        })
        .then((status) => {
          assert.equal(status.verified, true, 'account is verified');
          assert.equal(status.emailVerified, true, 'account email is verified');
          assert.equal(
            status.sessionVerified,
            true,
            'account session is  verified'
          );
        })
        .then(() => {
          // Can retrieve keys now that account tokens verified
          return client.keys();
        })
        .then((keys) => {
          assert.ok(keys.kA, 'has kA keys');
          assert.ok(keys.kB, 'has kB keys');
          assert.ok(keys.wrapKb, 'has wrapKb keys');
        });
    });

    it('unverified account is verified on sign-in confirmation', () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';
      let client = null;
      let tokenCode;

      return Client.create(config.publicUrl, email, password, {
        ...testOptions,
        keys: true,
      })
        .then((c) => {
          client = c;
          return server.mailbox.waitForEmail(email);
        })
        .then((emailData) => {
          assert.equal(emailData.headers['x-template-name'], 'verify');
          tokenCode = emailData.headers['x-verify-code'];
          assert.ok(tokenCode, 'sent verify code');
        })
        .then(() => {
          return client.login({ keys: true });
        })
        .then((c) => {
          client = c;
          return server.mailbox.waitForEmail(email);
        })
        .then((emailData) => {
          assert.equal(emailData.headers['x-template-name'], 'verify');
          const signinToken = emailData.headers['x-verify-code'];
          assert.notEqual(
            tokenCode,
            signinToken,
            'login codes should not match'
          );

          return client.verifyEmail(signinToken);
        })
        .then(() => {
          return client.emailStatus();
        })
        .then((status) => {
          assert.equal(status.verified, true, 'account is verified');
          assert.equal(status.emailVerified, true, 'account email is verified');
          assert.equal(
            status.sessionVerified,
            true,
            'account session is  verified'
          );
        })
        .then(() => {
          // Can retrieve keys now that account tokens verified
          return client.keys();
        })
        .then((keys) => {
          assert.ok(keys.kA, 'has kA keys');
          assert.ok(keys.kB, 'has kB keys');
          assert.ok(keys.wrapKb, 'has wrapKb keys');
        });
    });
  });
});
