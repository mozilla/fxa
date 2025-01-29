/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const TestServer = require('../test_server');
const Client = require('../client')();
const otplib = require('otplib');
const crypto = require('crypto');

const config = require('../../config').default.getProperties();

// Note, intentionally not indenting for code review.
[{ version: '' }, { version: 'V2' }].forEach((testOptions) => {
  describe(`#integration${testOptions.version} - remote account destroy`, function () {
    this.timeout(60000);
    let server;
    let tempConfigValue;

    before(async function () {
      // Important, this config impacts test logic. By default this is enabled
      // in development/test with a very large max time. In the real world the max time
      // is much lower, and confirmation is not skipped very often.The test cases in this
      // suite are looking at edge cases on unconfirmed accounts and sessions. Therefore,
      // this config will always be disabled here.
      tempConfigValue = config.signinConfirmation.skipForNewAccounts.enabled;
      config.signinConfirmation.skipForNewAccounts.enabled = false;
      server = await TestServer.start(config);
    });

    after(async function () {
      config.signinConfirmation.skipForNewAccounts.enabled = tempConfigValue;
      await TestServer.stop(server);
    });

    // Note that this test case most closely aligns with what most users experience.
    // In this case we have a user with a verified account, but unverified session
    // and no totp. When this occurs our UI will send an OTP email to user and prompt
    // them to enter the code prior to deleting the account.
    it('can delete account by providing short code', async function () {
      const email = server.uniqueEmail();
      const password = 'ok';
      await Client.create(config.publicUrl, email, password, {
        ...testOptions,
        verificationMethod: 'email-2fa',
        keys: true,
      });
      const client = await Client.login(config.publicUrl, email, password, {
        ...testOptions,
        verificationMethod: 'email-2fa',
        keys: true,
      });

      // Send a short code, this will validate the account and the session.
      // In the UI this happens when a user clicks on delete account, and
      // OTP message box pops up.
      await client.resendVerifyShortCodeEmail();
      const emailData = await server.mailbox.waitForEmail(email);
      let code;
      for (let i = 0; i < emailData.length; i++) {
        if (emailData[i].headers['x-verify-short-code']) {
          code = emailData[i].headers['x-verify-short-code'];
        }
      }
      assert.isDefined(code);
      await client.verifyShortCodeEmail(code);

      // Should not throw
      await client.destroyAccount();
    });

    it('can delete account by providing verify code', async function () {
      const email = server.uniqueEmail();
      const password = 'ok';
      await Client.create(config.publicUrl, email, password, {
        ...testOptions,
        verificationMethod: 'email-2fa',
        keys: true,
      });
      const client = await Client.login(config.publicUrl, email, password, {
        ...testOptions,
        verificationMethod: 'email-2fa',
        keys: true,
      });

      const emailData = await server.mailbox.waitForEmail(email);
      const code = emailData[emailData.length - 1].headers['x-verify-code'];
      await client.verifyEmail(code);

      // Should not throw
      await client.destroyAccount();
    });

    it('cannot delete account with invalid authPW', async function () {
      const email = server.uniqueEmail();
      const password = 'ok';
      const c = await Client.createAndVerify(
        config.publicUrl,
        email,
        password,
        server.mailbox,
        testOptions
      );

      c.authPW = Buffer.from(
        '0000000000000000000000000000000000000000000000000000000000000000',
        'hex'
      );
      c.authPWVersion2 = Buffer.from(
        '0000000000000000000000000000000000000000000000000000000000000000',
        'hex'
      );

      try {
        await c.destroyAccount();
        assert.fail(
          'should not be able to destroy account with invalid password'
        );
      } catch (err) {
        assert.equal(err.errno, 103);
      }
    });

    it('cannot delete account without verifying TOTP', async function () {
      const email = server.uniqueEmail();
      const password = 'ok';

      await Client.createAndVerifyAndTOTP(
        config.publicUrl,
        email,
        password,
        server.mailbox,
        {
          ...testOptions,
          keys: true,
        }
      );

      // Create a new unverified session
      const client = await Client.login(
        config.publicUrl,
        email,
        password,
        testOptions
      );
      const res = await await client.emailStatus();
      assert.equal(res.sessionVerified, false, 'session not verified');

      try {
        await client.destroyAccount();
        assert.fail(
          'Should not be able to destroy account without verifying totp'
        );
      } catch (err) {
        assert.equal(err.errno, 138, 'unverified session');
      }
    });

    it('cannot delete account with TOTP by supplying email otp code', async function () {
      const email = server.uniqueEmail();
      const password = 'ok';
      await Client.create(config.publicUrl, email, password, {
        ...testOptions,
        verificationMethod: 'email-2fa',
        keys: true,
      });
      let client = await Client.login(config.publicUrl, email, password, {
        ...testOptions,
        verificationMethod: 'email-2fa',
        keys: true,
      });

      // Send a short code, this will validate the account and the session.
      // In the UI this happens when a user clicks on delete account, and
      // OTP message box pops up.
      await client.resendVerifyShortCodeEmail();
      const emailData = await server.mailbox.waitForEmail(email);
      let code;
      for (let i = 0; i < emailData.length; i++) {
        if (emailData[i].headers['x-verify-short-code']) {
          code = emailData[i].headers['x-verify-short-code'];
        }
      }
      assert.isDefined(code);
      await client.verifyShortCodeEmail(code);

      // Add totp to account.
      client.totpAuthenticator = new otplib.authenticator.Authenticator();
      const totpTokenResult = await client.createTotpToken();
      assert.isDefined(totpTokenResult);
      60;
      client.totpAuthenticator.options = {
        secret: totpTokenResult.secret,
        crypto: crypto,
      };
      const totpCode = client.totpAuthenticator.generate();
      await client.verifyTotpCode(totpCode);

      // Log in again. This creates a new unverified session
      client = await Client.login(
        config.publicUrl,
        email,
        password,
        testOptions
      );
      const res = await client.emailStatus();
      assert.equal(res.sessionVerified, false, 'session not verified');

      // Try verifying the the session with a short code. This should
      // not be enough to bypass 2FA. This sort of mimics a valid email code
      // being stolen...
      await client.verifyShortCodeEmail(code);
      assert.equal(
        (await client.emailStatus()).sessionVerified,
        true,
        'session should be verified'
      );

      // Destroying the account should not work. Despite the session being 'verified',
      // totp has not been provided.
      try {
        await client.destroyAccount();
        assert.fail(
          'Should not be able to destroy account without verifying totp'
        );
      } catch (error) {
        assert.equal(error.errno, 138, 'unverified session');
      }
    });

    it('cannot delete without verifying session', async function () {
      const email = server.uniqueEmail();
      const password = 'ok';
      let client = await Client.createAndVerify(
        config.publicUrl,
        email,
        password,
        server.mailbox,
        testOptions
      );

      // Login again requiring email-2fa for session verification. The account is now verified but the session is not.
      client = await Client.login(config.publicUrl, email, password, {
        ...testOptions,
        verificationMethod: 'email-2fa',
      });

      try {
        await client.destroyAccount();
        assert.fail('Should not be able allowed to destroy account.');
      } catch (err) {
        assert.equal(err.message, 'Unconfirmed session');
      }
    });

    it('cannot delete without verifying account', async function () {
      const email = server.uniqueEmail();
      const password = 'ok';
      await Client.create(config.publicUrl, email, password, {
        ...testOptions,
        verificationMethod: 'email-2fa',
        keys: true,
      });
      const client = await Client.login(
        config.publicUrl,
        email,
        password,
        testOptions
      );
      try {
        await client.destroyAccount();
        assert.fail('Should not be able allowed to destroy account.');
      } catch (err) {
        assert.equal(err.message, 'Unconfirmed account');
      }
    });
  });
});
