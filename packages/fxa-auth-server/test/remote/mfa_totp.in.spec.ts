/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createTestServer, TestServerInstance } from '../support/helpers/test-server';
import crypto from 'crypto';

const Client = require('../client')();
const otplib = require('otplib');
const { default: Container } = require('typedi');
const {
  PlaySubscriptions,
} = require('../../lib/payments/iap/google-play/subscriptions');
const {
  AppStoreSubscriptions,
} = require('../../lib/payments/iap/apple-app-store/subscriptions');

let server: TestServerInstance;

// Ensure tests generate TOTP codes using the same encoding as the server
otplib.authenticator.options = {
  crypto: crypto,
  encoding: 'hex',
  window: 10,
};

beforeAll(async () => {
  Container.set(PlaySubscriptions, {});
  Container.set(AppStoreSubscriptions, {});

  server = await createTestServer({
    configOverrides: {
      securityHistory: { ipProfiling: {} },
      signinConfirmation: { skipForNewAccounts: { enabled: false } },
      mfa: {
        enabled: true,
        actions: ['2fa', 'test'],
      },
    },
  });
}, 120000);

afterAll(async () => {
  await server.stop();
});

const testVersions = [
  { version: '', tag: '' },
  { version: 'V2', tag: 'V2' },
];

const password = 'pssssst';
const metricsContext = {
  flowBeginTime: Date.now(),
  flowId: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
};

describe.each(testVersions)(
  '#integration$tag - remote mfa totp',
  ({ version, tag }) => {
    const testOptions = { version };
    let mfaEmail: string;
    let mfaClient: any;

    beforeEach(async () => {
      mfaEmail = server.uniqueEmail();
      mfaClient = await Client.createAndVerify(
        server.publicUrl,
        mfaEmail,
        password,
        server.mailbox,
        testOptions
      );
    });

    async function getMfaAccessTokenFor2fa(clientInstance: any) {
      // Request an OTP for MFA action '2fa'
      await clientInstance.api.doRequest(
        'POST',
        `${clientInstance.api.baseURL}/mfa/otp/request`,
        await clientInstance.api.Token.SessionToken.fromHex(
          clientInstance.sessionToken
        ),
        { action: '2fa' }
      );

      // Read OTP code from mailbox
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
      clientInstance: any,
      accessToken: string
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

      expect(createRes.secret).toBeTruthy();
      expect(createRes.qrCodeUrl).toBeTruthy();
      expect(verifySetupRes.success).toBe(true);
      expect(completeRes.success).toBe(true);

      const emailData = await server.mailbox.waitForEmail(mfaEmail);
      expect(emailData.headers['x-template-name']).toBe(
        'postAddTwoStepAuthentication'
      );
    });

    it('should replace TOTP using jwt', async () => {
      const accessToken = await getMfaAccessTokenFor2fa(mfaClient);
      const { completeRes } = await createSetupCompleteTOTPUsingJwt(
        mfaClient,
        accessToken
      );
      expect(completeRes.success).toBe(true);

      const email1 = await server.mailbox.waitForEmail(mfaEmail);
      expect(email1.headers['x-template-name']).toBe(
        'postAddTwoStepAuthentication'
      );

      // Start replace
      const startRes = await mfaClient.api.doRequestWithBearerToken(
        'POST',
        `${mfaClient.api.baseURL}/mfa/totp/replace/start`,
        accessToken,
        { metricsContext }
      );
      expect(startRes.secret).toBeTruthy();
      expect(startRes.qrCodeUrl).toBeTruthy();

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
      expect(confirmRes.success).toBe(true);

      const email2 = await server.mailbox.waitForEmail(mfaEmail);
      expect(email2.headers['x-template-name']).toBe(
        'postChangeTwoStepAuthentication'
      );
    });
  }
);
