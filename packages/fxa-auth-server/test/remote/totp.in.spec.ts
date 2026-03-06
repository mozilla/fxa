/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createTestServer, TestServerInstance } from '../support/helpers/test-server';
import crypto from 'crypto';

const Client = require('../client')();
const otplib = require('otplib');
const jwt = require('jsonwebtoken');
const uuid = require('uuid');
const { default: Container } = require('typedi');
const {
  PlaySubscriptions,
} = require('../../lib/payments/iap/google-play/subscriptions');
const {
  AppStoreSubscriptions,
} = require('../../lib/payments/iap/apple-app-store/subscriptions');
const tokens = require('../../lib/tokens')({ trace: function () {} });
const baseConfig = require('../../config').default.getProperties();

async function generateMfaJwt(client: any) {
  const sessionTokenHex = client.sessionToken;
  const sessionToken = await tokens.SessionToken.fromHex(sessionTokenHex);
  const sessionTokenId = sessionToken.id;

  const now = Math.floor(Date.now() / 1000);
  const claims = {
    sub: client.uid,
    scope: ['mfa:2fa'],
    iat: now,
    jti: uuid.v4(),
    stid: sessionTokenId,
  };

  return jwt.sign(claims, baseConfig.mfa.jwt.secretKey, {
    algorithm: 'HS256',
    expiresIn: baseConfig.mfa.jwt.expiresInSec,
    audience: baseConfig.mfa.jwt.audience,
    issuer: baseConfig.mfa.jwt.issuer,
  });
}

let server: TestServerInstance;

beforeAll(async () => {
  Container.set(PlaySubscriptions, {});
  Container.set(AppStoreSubscriptions, {});

  server = await createTestServer({
    configOverrides: {
      securityHistory: { ipProfiling: {} },
      signinConfirmation: { skipForNewAccounts: { enabled: false } },
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

otplib.authenticator.options = {
  crypto: crypto,
  encoding: 'hex',
  window: 10,
};

describe.each(testVersions)(
  '#integration$tag - remote totp',
  ({ version, tag }) => {
    const testOptions = { version };
    let client: any;
    let email: string;
    let totpToken: any;
    let authenticator: any;

    function verifyTOTP(c: any) {
      return c
        .createTotpToken({ metricsContext })
        .then((result: any) => {
          authenticator = new otplib.authenticator.Authenticator();
          authenticator.options = Object.assign(
            {},
            otplib.authenticator.options,
            { secret: result.secret }
          );
          totpToken = result;

          const code = authenticator.generate();
          return c.verifyTotpSetupCode(code);
        })
        .then(() => {
          return c.completeTotpSetup({
            metricsContext,
            service: 'sync',
          });
        })
        .then((response: any) => {
          expect(response.success).toBe(true);
          return server.mailbox.waitForEmail(email);
        })
        .then((emailData: any) => {
          expect(emailData.headers['x-template-name']).toBe(
            'postAddTwoStepAuthentication'
          );
        });
    }

    beforeEach(async () => {
      email = server.uniqueEmail();
      client = await Client.createAndVerify(
        server.publicUrl,
        email,
        password,
        server.mailbox,
        testOptions
      );
      expect(client.authAt).toBeTruthy();
      await verifyTOTP(client);
    });

    it('should create totp token', () => {
      expect(totpToken).toBeTruthy();
      expect(totpToken.qrCodeUrl).toBeTruthy();
    });

    it('should check if totp token exists for user', async () => {
      const response = await client.checkTotpTokenExists();
      expect(response.exists).toBe(true);
    });

    it('should fail to create second totp token for same user', async () => {
      try {
        await client.createTotpToken();
        fail('should have thrown');
      } catch (err: any) {
        expect(err.code).toBe(400);
        expect(err.errno).toBe(154);
      }
    });

    it('should not fail to delete unknown totp token', async () => {
      const newEmail = server.uniqueEmail();
      const newClient = await Client.createAndVerify(
        server.publicUrl,
        newEmail,
        password,
        server.mailbox,
        testOptions
      );
      expect(newClient.authAt).toBeTruthy();
      const mfaJwt = await generateMfaJwt(newClient);
      const result = await newClient.deleteTotpToken(mfaJwt);
      expect(result).toBeTruthy();
    });

    it('should delete totp token', async () => {
      const mfaJwt = await generateMfaJwt(client);
      const result = await client.deleteTotpToken(mfaJwt);
      expect(result).toBeTruthy();

      const emailData = await server.mailbox.waitForEmail(email);
      expect(emailData.headers['x-template-name']).toBe(
        'postRemoveTwoStepAuthentication'
      );

      const tokenResult = await client.checkTotpTokenExists();
      expect(tokenResult.exists).toBe(false);
    });

    it('should not allow unverified sessions before totp enabled to delete totp token', async () => {
      const newEmail = server.uniqueEmail();
      const newClient = await Client.createAndVerify(
        server.publicUrl,
        newEmail,
        password,
        server.mailbox,
        testOptions
      );

      const response = await newClient.login({ keys: true });
      expect(response.verificationMethod).toBe('email');
      expect(response.verificationReason).toBe('login');
      expect(response.sessionVerified).toBe(false);

      await server.mailbox.waitForEmail(newEmail);

      // Login with a new client and enable TOTP
      const client2 = await Client.loginAndVerify(
        server.publicUrl,
        newEmail,
        password,
        server.mailbox,
        { ...testOptions, keys: true }
      );
      email = newEmail;
      await verifyTOTP(client2);

      // Attempt to delete totp from original unverified session
      const mfaJwt = await generateMfaJwt(newClient);
      try {
        await newClient.deleteTotpToken(mfaJwt);
        fail('should have thrown');
      } catch (err: any) {
        expect(err.errno).toBe(138);
      }
    });

    it('should request `totp-2fa` on login if user has verified totp token', async () => {
      const response = await Client.login(server.publicUrl, email, password, {
        ...testOptions,
        keys: true,
      });
      expect(response.verificationMethod).toBe('totp-2fa');
      expect(response.verificationReason).toBe('login');
    });

    it('should not have `totp-2fa` verification if user has unverified totp token', async () => {
      const mfaJwt = await generateMfaJwt(client);
      await client.deleteTotpToken(mfaJwt);
      await client.createTotpToken();

      const response = await Client.login(server.publicUrl, email, password, {
        ...testOptions,
        keys: true,
      });
      expect(response.verificationMethod).not.toBe('totp-2fa');
      expect(response.verificationReason).toBe('login');
    });

    it('should not bypass `totp-2fa` by resending sign-in confirmation code', async () => {
      const response = await Client.login(server.publicUrl, email, password, {
        ...testOptions,
        keys: true,
      });
      client = response;
      expect(response.verificationMethod).toBe('totp-2fa');
      expect(response.verificationReason).toBe('login');

      const res = await client.requestVerifyEmail();
      expect(res).toEqual({});
    });

    it('should not bypass `totp-2fa` by when using session reauth', async () => {
      const response = await Client.login(
        server.publicUrl,
        email,
        password,
        testOptions
      );
      client = response;
      expect(response.verificationMethod).toBe('totp-2fa');
      expect(response.verificationReason).toBe('login');

      const reauthResponse = await client.reauth();
      expect(reauthResponse.verificationMethod).toBe('totp-2fa');
      expect(reauthResponse.verificationReason).toBe('login');
    });

    it('should fail reset password without verifying totp', async () => {
      const newPassword = 'anotherPassword';

      const loginClient = await Client.login(
        server.publicUrl,
        email,
        password,
        { ...testOptions, keys: true }
      );
      expect(loginClient.verificationMethod).toBe('totp-2fa');
      expect(loginClient.verificationReason).toBe('login');

      await loginClient.forgotPassword();
      const otpCode = await server.mailbox.waitForCode(email);
      const result = await loginClient.verifyPasswordForgotOtp(otpCode);
      await loginClient.verifyPasswordResetCode(result.code);

      try {
        await loginClient.resetPassword(newPassword, {}, { keys: true });
        fail('should not have succeeded');
      } catch (err: any) {
        expect(err.errno).toBe(138);
      }
    });

    it('should reset password after verifying totp', async () => {
      const newPassword = 'anotherPassword';

      const loginClient = await Client.login(
        server.publicUrl,
        email,
        password,
        { ...testOptions, keys: true }
      );
      expect(loginClient.verificationMethod).toBe('totp-2fa');
      expect(loginClient.verificationReason).toBe('login');

      await loginClient.forgotPassword();
      const otpCode = await server.mailbox.waitForCode(email);
      const result = await loginClient.verifyPasswordForgotOtp(otpCode);

      const totpCode = authenticator.generate();
      await loginClient.verifyTotpCodeForPasswordReset(totpCode);

      await loginClient.verifyPasswordResetCode(result.code);

      const res = await loginClient.resetPassword(
        newPassword,
        {},
        { keys: true }
      );
      expect(res.verificationMethod).toBeUndefined();
      expect(res.verificationReason).toBeUndefined();
      expect(res.emailVerified).toBe(true);
      expect(res.sessionVerified).toBe(true);
      expect(res.keyFetchToken).toBeTruthy();
      expect(res.sessionToken).toBeTruthy();
      expect(res.authAt).toBeTruthy();
    });

    describe('totp code verification', () => {
      beforeEach(async () => {
        client = await Client.login(
          server.publicUrl,
          email,
          password,
          testOptions
        );
      });

      it('should fail to verify totp code', async () => {
        const code = authenticator.generate();
        const incorrectCode = code === '123456' ? '123455' : '123456';
        const result = await client.verifyTotpCode(incorrectCode, {
          metricsContext,
          service: 'sync',
        });
        expect(result.success).toBe(false);
      });

      it('should reject non-numeric codes', async () => {
        try {
          await client.verifyTotpCode('wrong', {
            metricsContext,
            service: 'sync',
          });
          fail('should have thrown');
        } catch (err: any) {
          expect(err.code).toBe(400);
          expect(err.errno).toBe(107);
        }
      });

      it('should fail to verify totp code that does not have totp token', async () => {
        const newEmail = server.uniqueEmail();
        const newClient = await Client.createAndVerify(
          server.publicUrl,
          newEmail,
          password,
          server.mailbox,
          testOptions
        );
        expect(newClient.authAt).toBeTruthy();

        try {
          await newClient.verifyTotpCode('123456', {
            metricsContext,
            service: 'sync',
          });
          fail('should have thrown');
        } catch (err: any) {
          expect(err.code).toBe(400);
          expect(err.errno).toBe(155);
        }
      });

      it('should verify totp code', async () => {
        const code = authenticator.generate();
        const response = await client.verifyTotpCode(code, {
          metricsContext,
          service: 'sync',
        });
        expect(response.success).toBe(true);

        const emailData = await server.mailbox.waitForEmail(email);
        expect(emailData.headers['x-template-name']).toBe('newDeviceLogin');
      });

      it('should verify totp code from previous code window', async () => {
        const futureAuthenticator = new otplib.authenticator.Authenticator();
        futureAuthenticator.options = Object.assign(
          {},
          authenticator.options,
          { epoch: Date.now() / 1000 - 30 }
        );
        const code = futureAuthenticator.generate();
        const response = await client.verifyTotpCode(code, {
          metricsContext,
          service: 'sync',
        });
        expect(response.success).toBe(true);

        const emailData = await server.mailbox.waitForEmail(email);
        expect(emailData.headers['x-template-name']).toBe('newDeviceLogin');
      });

      it('should not verify totp code from future code window', async () => {
        const futureAuthenticator = new otplib.authenticator.Authenticator();
        futureAuthenticator.options = Object.assign(
          {},
          authenticator.options,
          { epoch: Date.now() / 1000 + 3000 }
        );
        const code = futureAuthenticator.generate();
        const response = await client.verifyTotpCode(code, {
          metricsContext,
          service: 'sync',
        });
        expect(response.success).toBe(false);
      });
    });
  }
);
