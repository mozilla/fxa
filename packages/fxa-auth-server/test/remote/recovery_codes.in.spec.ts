/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createTestServer, TestServerInstance } from '../support/helpers/test-server';

const Client = require('../client')();
const otplib = require('otplib');
const random = require('../../lib/crypto/random');
const jwt = require('jsonwebtoken');
const uuid = require('uuid');
const tokens = require('../../lib/tokens')({ trace: function () {} });
const baseConfig = require('../../config').default.getProperties();

const recoveryCodeCount = 9;

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

async function generateRecoveryCodes(): Promise<string[]> {
  const codes: string[] = [];
  const gen = random.base32(baseConfig.totp.recoveryCodes.length);
  while (codes.length < recoveryCodeCount) {
    const rc = (await gen()).toLowerCase();
    if (codes.indexOf(rc) === -1) {
      codes.push(rc);
    }
  }
  return codes;
}

let server: TestServerInstance;
let recoveryCodes: string[];

beforeAll(async () => {
  server = await createTestServer({
    configOverrides: {
      totp: { recoveryCodes: { count: recoveryCodeCount, notifyLowCount: recoveryCodeCount - 2 } },
    },
  });
  recoveryCodes = await generateRecoveryCodes();
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
  encoding: 'hex',
  window: 10,
};

describe.each(testVersions)(
  '#integration$tag - remote backup authentication codes',
  ({ version, tag }) => {
    const testOptions = { version };
    let client: any;
    let email: string;

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

      const result = await client.createTotpToken({ metricsContext });
      otplib.authenticator.options = Object.assign(
        {},
        otplib.authenticator.options,
        { secret: result.secret }
      );

      const code = otplib.authenticator.generate();
      const verifyResponse = await client.verifyTotpSetupCode(code, { metricsContext });
      expect(verifyResponse.success).toBe(true);

      const setResponse = await client.setRecoveryCodes(recoveryCodes);
      expect(setResponse.success).toBe(true);

      await client.completeTotpSetup({ metricsContext });

      const emailData = await server.mailbox.waitForEmail(email);
      expect(emailData.headers['x-template-name']).toBe('postAddTwoStepAuthentication');
    });

    it('should replace backup authentication codes', async () => {
      const result = await client.replaceRecoveryCodes();
      expect(result.recoveryCodes.length).toBe(recoveryCodeCount);
      expect(result.recoveryCodes).not.toEqual(recoveryCodes);

      const emailData = await server.mailbox.waitForEmail(email);
      expect(emailData.headers['x-template-name']).toBe('postNewRecoveryCodes');
    });

    describe('backup authentication code verification', () => {
      beforeEach(async () => {
        client = await Client.login(
          server.publicUrl,
          email,
          password,
          testOptions
        );
        const res = await client.emailStatus();
        expect(res.sessionVerified).toBe(false);
      });

      it('should fail to consume unknown backup authentication code', async () => {
        try {
          await client.consumeRecoveryCode('1234abcd', { metricsContext });
          fail('should have thrown');
        } catch (err: any) {
          expect(err.code).toBe(400);
          expect(err.errno).toBe(156);
        }
      });

      it('should consume backup authentication code and verify session', async () => {
        const res = await client.consumeRecoveryCode(recoveryCodes[0], { metricsContext });
        expect(res.remaining).toBe(recoveryCodeCount - 1);

        const status = await client.emailStatus();
        expect(status.sessionVerified).toBe(true);

        const emailData = await server.mailbox.waitForEmail(email);
        expect(emailData.headers['x-template-name']).toBe('postSigninRecoveryCode');
      });

      it('should consume backup authentication code and can remove TOTP token', async () => {
        const res = await client.consumeRecoveryCode(recoveryCodes[0], { metricsContext });
        expect(res.remaining).toBe(recoveryCodeCount - 1);

        const emailData = await server.mailbox.waitForEmail(email);
        expect(emailData.headers['x-template-name']).toBe('postSigninRecoveryCode');

        const mfaJwt = await generateMfaJwt(client);
        const result = await client.deleteTotpToken(mfaJwt);
        expect(result).toBeTruthy();

        const deleteEmailData = await server.mailbox.waitForEmail(email);
        expect(deleteEmailData.headers['x-template-name']).toBe('postRemoveTwoStepAuthentication');
      });
    });

    describe('should notify user when backup authentication codes are low', () => {
      beforeEach(async () => {
        client = await Client.login(
          server.publicUrl,
          email,
          password,
          testOptions
        );
        const res = await client.emailStatus();
        expect(res.sessionVerified).toBe(false);
      });

      it('should consume backup authentication code and verify session', async () => {
        const res1 = await client.consumeRecoveryCode(recoveryCodes[0], { metricsContext });
        expect(res1.remaining).toBe(recoveryCodeCount - 1);

        const emailData1 = await server.mailbox.waitForEmail(email);
        expect(emailData1.headers['x-template-name']).toBe('postSigninRecoveryCode');

        const res2 = await client.consumeRecoveryCode(recoveryCodes[1], { metricsContext });
        expect(res2.remaining).toBe(recoveryCodeCount - 2);

        const emails = await server.mailbox.waitForEmails(email, 2);
        const templates = emails.map((e) => e.headers['x-template-name']);
        expect(templates).toContain('postSigninRecoveryCode');
        expect(templates).toContain('lowRecoveryCodes');
      });
    });
  }
);
