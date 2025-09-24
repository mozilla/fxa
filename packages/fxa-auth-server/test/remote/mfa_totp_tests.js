/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const crypto = require('crypto');
const config = require('../../config').default.getProperties();
const TestServer = require('../test_server');
const Client = require('../client')();
const otplib = require('otplib');
const { default: Container } = require('typedi');
const {
  PlaySubscriptions,
} = require('../../lib/payments/iap/google-play/subscriptions');
const {
  AppStoreSubscriptions,
} = require('../../lib/payments/iap/apple-app-store/subscriptions');

[{ version: '' }, { version: 'V2' }].forEach((testOptions) => {
  describe(`#integration${testOptions.version} - remote mfa totp`, function () {
    this.timeout(60000);

    let server, mfaEmail, mfaClient;
    const password = 'pssssst';
    const metricsContext = {
      flowBeginTime: Date.now(),
      flowId:
        '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    };

    // Ensure tests generate TOTP codes using the same encoding as the server
    otplib.authenticator.options = {
      crypto: crypto,
      encoding: 'hex',
      window: 10,
    };

    before(async () => {
      config.securityHistory.ipProfiling = {};
      config.signinConfirmation.skipForNewAccounts.enabled = false;

      // Ensure MFA is enabled for JWT-based TOTP routes used in these tests
      config.mfa = config.mfa || {};
      config.mfa.enabled = true;
      config.mfa.actions = config.mfa.actions || ['2fa', 'test'];
      config.mfa.otp = config.mfa.otp || { digits: 6, step: 1, window: 30 };
      config.mfa.jwt = config.mfa.jwt || {
        secretKey: 'foxes',
        expiresInSec: 300,
        audience: 'fxa',
        issuer: 'accounts.firefox.com',
      };

      Container.set(PlaySubscriptions, {});
      Container.set(AppStoreSubscriptions, {});

      server = await TestServer.start(config);
    });

    after(async () => {
      await TestServer.stop(server);
    });

    beforeEach(async () => {
      // Use a fresh account for each test
      mfaEmail = server.uniqueEmail();
      mfaClient = await Client.createAndVerify(
        config.publicUrl,
        mfaEmail,
        password,
        server.mailbox,
        testOptions
      );
    });

    async function getMfaAccessTokenFor2fa(clientInstance) {
      // Request an OTP for MFA action '2fa'
      await clientInstance.api.doRequest(
        'POST',
        `${clientInstance.api.baseURL}/mfa/otp/request`,
        await clientInstance.api.Token.SessionToken.fromHex(
          clientInstance.sessionToken
        ),
        { action: '2fa' }
      );

      // Read OTP code from mailbox (MFA uses x-account-change-verify-code)
      const code = await server.mailbox.waitForMfaCode(clientInstance.email);

      // Verify OTP and get back a JWT access token
      const verifyRes = await clientInstance.api.doRequest(
        'POST',
        `${clientInstance.api.baseURL}/mfa/otp/verify`,
        await clientInstance.api.Token.SessionToken.fromHex(
          clientInstance.sessionToken
        ),
        { action: '2fa', code }
      );
      return verifyRes.accessToken;
    }

    async function createSetupCompleteTOTPUsingJwt(
      clientInstance,
      accessToken
    ) {
      // Create (start) TOTP via JWT route
      const createRes = await clientInstance.api.doRequestWithBearerToken(
        'POST',
        `${clientInstance.api.baseURL}/mfa/totp/create`,
        accessToken,
        { metricsContext }
      );

      // Verify setup code using the returned secret
      const setupAuthenticator = new otplib.authenticator.Authenticator();
      setupAuthenticator.options = Object.assign(
        {},
        otplib.authenticator.options,
        { secret: createRes.secret }
      );
      const code = setupAuthenticator.generate();
      const verifySetupRes = await clientInstance.api.doRequestWithBearerToken(
        'POST',
        `${clientInstance.api.baseURL}/mfa/totp/setup/verify`,
        accessToken,
        { code, metricsContext }
      );

      // Complete setup
      const completeRes = await clientInstance.api.doRequestWithBearerToken(
        'POST',
        `${clientInstance.api.baseURL}/mfa/totp/setup/complete`,
        accessToken,
        { metricsContext }
      );

      return { createRes, verifySetupRes, completeRes };
    }

    it('should create/setup/complete TOTP using jwt', async () => {
      const accessToken = await getMfaAccessTokenFor2fa(mfaClient);
      const { createRes, verifySetupRes, completeRes } =
        await createSetupCompleteTOTPUsingJwt(mfaClient, accessToken);

      assert.ok(createRes.secret);
      assert.ok(createRes.qrCodeUrl);
      assert.equal(verifySetupRes.success, true);
      assert.equal(completeRes.success, true);

      const emailData = await server.mailbox.waitForEmail(mfaEmail);
      assert.equal(
        emailData.headers['x-template-name'],
        'postAddTwoStepAuthentication'
      );
    });

    it('should replace TOTP using jwt', async () => {
      const accessToken = await getMfaAccessTokenFor2fa(mfaClient);
      const { completeRes } = await createSetupCompleteTOTPUsingJwt(
        mfaClient,
        accessToken
      );
      assert.equal(completeRes.success, true);
      const email1 = await server.mailbox.waitForEmail(mfaEmail);
      assert.equal(
        email1.headers['x-template-name'],
        'postAddTwoStepAuthentication'
      );

      // Start replace
      const startRes = await mfaClient.api.doRequestWithBearerToken(
        'POST',
        `${mfaClient.api.baseURL}/mfa/totp/replace/start`,
        accessToken,
        { metricsContext }
      );
      assert.ok(startRes.secret);
      assert.ok(startRes.qrCodeUrl);

      // Confirm replace with valid code
      const replaceAuthenticator = new otplib.authenticator.Authenticator();
      replaceAuthenticator.options = Object.assign(
        {},
        otplib.authenticator.options,
        { secret: startRes.secret }
      );
      const code = replaceAuthenticator.generate();
      const confirmRes = await mfaClient.api.doRequestWithBearerToken(
        'POST',
        `${mfaClient.api.baseURL}/mfa/totp/replace/confirm`,
        accessToken,
        { code }
      );
      assert.equal(confirmRes.success, true);

      const email2 = await server.mailbox.waitForEmail(mfaEmail);
      assert.equal(
        email2.headers['x-template-name'],
        'postChangeTwoStepAuthentication'
      );
    });
  });
});
