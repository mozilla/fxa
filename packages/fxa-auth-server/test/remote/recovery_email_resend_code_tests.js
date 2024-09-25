/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const Client = require('../client')();
const TestServer = require('../test_server');

const config = require('../../config').default.getProperties();

[{version:""},{version:"V2"}].forEach((testOptions) => {

describe(`#integration${testOptions.version} - remote recovery email resend code`, function () {
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

  it('sign-in verification resend email verify code', () => {
    const email = server.uniqueEmail();
    const password = 'something';
    let verifyEmailCode = '';
    let client = null;
    const options = {
      ...testOptions,
      redirectTo: `https://sync.${config.smtp.redirectDomain}`,
      service: 'sync',
      resume: 'resumeToken',
      keys: true,
    };
    return Client.create(config.publicUrl, email, password, options)
      .then((c) => {
        client = c;
        // Clear first account create email and login again
        return server.mailbox
          .waitForEmail(email)
          .then(() => Client.login(config.publicUrl, email, password, options))
          .then((c) => (client = c));
      })
      .then(() => server.mailbox.waitForCode(email))
      .then((code) => {
        verifyEmailCode = code;
        return client.requestVerifyEmail();
      })
      .then(() => server.mailbox.waitForCode(email))
      .then((code) => {
        assert.equal(code, verifyEmailCode, 'code equal to verify email code');
        return client.verifyEmail(code);
      })
      .then(() => client.emailStatus())
      .then((status) => {
        assert.equal(status.verified, true, 'account is verified');
        assert.equal(status.emailVerified, true, 'account email is verified');
        assert.equal(
          status.sessionVerified,
          true,
          'account session is verified'
        );
      });
  });

  it('sign-in verification resend login verify code', () => {
    const email = server.uniqueEmail();
    const password = 'something';
    let verifyEmailCode = '';
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
        verifyEmailCode = code;
        return client2.requestVerifyEmail();
      })
      .then(() => {
        return server.mailbox.waitForCode(email);
      })
      .then((code) => {
        assert.equal(code, verifyEmailCode, 'code equal to verify email code');
        return client2.verifyEmail(code);
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
          'account session is verified'
        );
      });
  });

  it('fail when resending verification email when not owned by account', () => {
    const email = server.uniqueEmail();
    const secondEmail = server.uniqueEmail();
    const password = 'something';
    let client = null;
    const options = {
      ...testOptions,
      keys: true,
    };
    return Promise.all([
      Client.createAndVerify(
        config.publicUrl,
        email,
        password,
        server.mailbox,
        options
      ),
      Client.create(config.publicUrl, secondEmail, password, options),
    ])
      .then((res) => {
        // Login with `email` and attempt to resend verification code for `secondEmail`
        client = res[0];
        client.options = {
          ...client.options,
          email: secondEmail,
        };
        return client.requestVerifyEmail().then(() => {
          assert.fail('Should not have succeeded in sending verification code');
        });
      })
      .catch((err) => {
        assert.equal(err.code, 400);
        assert.equal(err.errno, 150);
      });
  });

  it('should be able to upgrade unverified session to verified session', () => {
    const email = server.uniqueEmail();
    const password = 'something';
    let client = null;
    const options = {
      ...testOptions,
      keys: false,
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
        // Create an unverified session
        return client
          .login()
          .then((c) => {
            client = c;
            // Clear the verify account email
            return server.mailbox.waitForCode(email);
          })
          .then(() => client.sessionStatus());
      })
      .then((result) => {
        assert.equal(result.state, 'unverified', 'session is unverified');
        // set the type of code to receive
        client.options.type = 'upgradeSession';
        return client.requestVerifyEmail();
      })
      .then(() => server.mailbox.waitForEmail(email))
      .then((emailData) => {
        assert.equal(emailData.headers['x-template-name'], 'verifyPrimary');
        const code = emailData.headers['x-verify-code'];
        assert.ok(code, 'code set');
        return client.verifyEmail(code);
      })
      .then(() => client.sessionStatus())
      .then((result) => {
        assert.equal(result.state, 'verified', 'session is verified');
      });
  });


});

})
