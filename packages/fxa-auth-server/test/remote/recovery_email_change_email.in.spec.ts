/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createTestServer, TestServerInstance } from '../support/helpers/test-server';
import crypto from 'crypto';

const Client = require('../client')();
const jwt = require('jsonwebtoken');
const uuid = require('uuid');
const tokens = require('../../lib/tokens')({ trace: function () {} });
const { setupAccountDatabase } = require('@fxa/shared/db/mysql/account');
const { email: emailHelper } = require('fxa-shared');
const baseConfig = require('../../config').default.getProperties();

async function generateMfaJwt(client: any) {
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

  return jwt.sign(claims, baseConfig.mfa.jwt.secretKey, {
    algorithm: 'HS256',
    expiresIn: baseConfig.mfa.jwt.expiresInSec,
    audience: baseConfig.mfa.jwt.audience,
    issuer: baseConfig.mfa.jwt.issuer,
  });
}

async function resetPassword(
  client: any,
  otpCode: string,
  newPassword: string,
  headers?: any,
  options?: any
) {
  const result = await client.verifyPasswordForgotOtp(otpCode, options);
  await client.verifyPasswordResetCode(result.code, headers, options);
  return client.resetPassword(newPassword, {}, options);
}

const password = 'allyourbasearebelongtous';
const newPassword = 'newpassword';

let server: TestServerInstance;

beforeAll(async () => {
  server = await createTestServer({
    configOverrides: {
      securityHistory: { ipProfiling: {} },
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

describe.each(testVersions)(
  '#integration$tag - remote change email',
  ({ version, tag }) => {
    const testOptions = { version };
    let client: any;
    let email: string;
    let secondEmail: string;

    beforeEach(async () => {
      email = server.uniqueEmail();
      secondEmail = server.uniqueEmail('@notrestmail.com');

      client = await Client.createAndVerify(
        server.publicUrl,
        email,
        password,
        server.mailbox,
        testOptions
      );
      expect(client.authAt).toBeTruthy();

      const status = await client.emailStatus();
      expect(status.verified).toBe(true);

      const mfaJwt = await generateMfaJwt(client);
      let res = await client.createEmail(mfaJwt, secondEmail);
      expect(res).toBeTruthy();

      const emailData = await server.mailbox.waitForEmail(secondEmail);
      expect(emailData['headers']['x-template-name']).toBe('verifySecondaryCode');
      const emailCode = emailData['headers']['x-verify-code'];
      expect(emailCode).toBeTruthy();

      res = await client.verifySecondaryEmailWithCode(mfaJwt, emailCode, secondEmail);
      expect(res).toBeTruthy();

      res = await client.accountEmails();
      expect(res.length).toBe(2);
      expect(res[1].email).toBe(secondEmail);
      expect(res[1].isPrimary).toBe(false);
      expect(res[1].verified).toBe(true);

      await server.mailbox.waitForEmail(email);
    });

    describe('should change primary email', () => {
      it('fails to change email to an that is not owned by user', async () => {
        const userEmail2 = server.uniqueEmail();
        const anotherEmail = server.uniqueEmail();
        const client2 = await Client.createAndVerify(
          server.publicUrl,
          userEmail2,
          password,
          server.mailbox,
          testOptions
        );

        const client2Jwt = await generateMfaJwt(client2);
        await client2.createEmail(client2Jwt, anotherEmail);
        const emailData = await server.mailbox.waitForEmail(anotherEmail);
        const code = emailData.headers['x-verify-code'];
        expect(code).toBeTruthy();
        await client2.verifySecondaryEmailWithCode(client2Jwt, code, anotherEmail);

        const mfaJwt = await generateMfaJwt(client);
        try {
          await client.setPrimaryEmail(mfaJwt, anotherEmail);
          fail('Should not have set email that belongs to another account');
        } catch (err: any) {
          expect(err.errno).toBe(148);
          expect(err.code).toBe(400);
        }
      });

      it('fails to change email to unverified email', async () => {
        const someEmail = server.uniqueEmail();
        const mfaJwt = await generateMfaJwt(client);
        await client.createEmail(mfaJwt, someEmail);

        try {
          await client.setPrimaryEmail(mfaJwt, someEmail);
          fail('Should not have set email to an unverified email');
        } catch (err: any) {
          expect(err.errno).toBe(143);
          expect(err.code).toBe(400);
        }
      });

      it('fails to to change primary email to an unverified email stored in database (legacy)', async () => {
        const someEmail = server.uniqueEmail();
        const db = await setupAccountDatabase(baseConfig.database.mysql.auth);
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
          fail('Should not have set email to an unverified email');
        } catch (err: any) {
          expect(err.errno).toBe(147);
          expect(err.code).toBe(400);
        }
      });

      it('can change primary email', async () => {
        const mfaJwt = await generateMfaJwt(client);
        let res = await client.setPrimaryEmail(mfaJwt, secondEmail);
        expect(res).toBeTruthy();

        res = await client.accountEmails();
        expect(res.length).toBe(2);
        expect(res[0].email).toBe(secondEmail);
        expect(res[0].isPrimary).toBe(true);
        expect(res[0].verified).toBe(true);
        expect(res[1].email).toBe(email);
        expect(res[1].isPrimary).toBe(false);
        expect(res[1].verified).toBe(true);

        const emailData = await server.mailbox.waitForEmail(secondEmail);
        expect(emailData.headers['to']).toBe(secondEmail);
        expect(emailData.headers['cc']).toBe(email);
        expect(emailData.headers['x-template-name']).toBe('postChangePrimary');
      });

      it('can login', async () => {
        const mfaJwt = await generateMfaJwt(client);
        let res = await client.setPrimaryEmail(mfaJwt, secondEmail);
        expect(res).toBeTruthy();

        if (testOptions.version === 'V2') {
          res = await Client.login(
            server.publicUrl,
            secondEmail,
            password,
            testOptions
          );
          expect(res).toBeTruthy();
        } else {
          try {
            await Client.login(
              server.publicUrl,
              secondEmail,
              password,
              testOptions
            );
            fail('Should have returned correct email for user to login');
          } catch (err: any) {
            expect(err.code).toBe(400);
            expect(err.errno).toBe(120);
            expect(err.email).toBe(email);

            res = await Client.login(server.publicUrl, err.email, password, {
              originalLoginEmail: secondEmail,
              ...testOptions,
            });
            expect(res).toBeTruthy();
          }
        }
      });

      it('can change password', async () => {
        const mfaJwt = await generateMfaJwt(client);
        let res = await client.setPrimaryEmail(mfaJwt, secondEmail);
        expect(res).toBeTruthy();

        res = await Client.login(server.publicUrl, email, password, {
          originalLoginEmail: secondEmail,
          ...testOptions,
        });
        client = res;

        res = await client.changePassword(
          newPassword,
          undefined,
          client.sessionToken
        );
        expect(res).toBeTruthy();

        res = await Client.login(server.publicUrl, email, newPassword, {
          originalLoginEmail: secondEmail,
          ...testOptions,
        });
        expect(res).toBeTruthy();
      });

      it('can reset password', async () => {
        const mfaJwt = await generateMfaJwt(client);
        let res = await client.setPrimaryEmail(mfaJwt, secondEmail);
        expect(res).toBeTruthy();

        const emailData = await server.mailbox.waitForEmail(secondEmail);
        expect(emailData.headers['to']).toBe(secondEmail);
        expect(emailData.headers['cc']).toBe(email);
        expect(emailData.headers['x-template-name']).toBe('postChangePrimary');

        client.email = secondEmail;
        await client.forgotPassword();

        const code = await server.mailbox.waitForCode(secondEmail);
        expect(code).toBeTruthy();

        res = await resetPassword(client, code, newPassword, undefined, {
          emailToHashWith: email,
        });
        expect(res).toBeTruthy();

        if (testOptions.version === 'V2') {
          await Client.upgradeCredentials(
            server.publicUrl,
            email,
            newPassword,
            {
              originalLoginEmail: secondEmail,
              version: '',
              keys: true,
            }
          );
        }

        res = await Client.login(server.publicUrl, email, newPassword, {
          originalLoginEmail: secondEmail,
          ...testOptions,
        });
        expect(res).toBeTruthy();
      });

      it('can delete account', async () => {
        const mfaJwt = await generateMfaJwt(client);
        const res = await client.setPrimaryEmail(mfaJwt, secondEmail);
        expect(res).toBeTruthy();

        await client.destroyAccount();

        try {
          await Client.login(server.publicUrl, email, newPassword, {
            originalLoginEmail: secondEmail,
            ...testOptions,
          });
          fail('Should not have been able to login after deleting account');
        } catch (err: any) {
          expect(err.errno).toBe(102);
          expect(err.email).toBe(secondEmail);
        }
      });
    });

    it('change primary email with multiple accounts', async () => {
      let emailData, emailCode;
      const password2 = 'asdf';
      const client1Email = server.uniqueEmail();
      const client1SecondEmail = server.uniqueEmail();
      const client2Email = server.uniqueEmail();
      const client2SecondEmail = server.uniqueEmail();

      const client1 = await Client.createAndVerify(
        server.publicUrl,
        client1Email,
        password,
        server.mailbox,
        testOptions
      );

      const client2 = await Client.createAndVerify(
        server.publicUrl,
        client2Email,
        password2,
        server.mailbox,
        testOptions
      );

      const client1Jwt = await generateMfaJwt(client1);
      const client2Jwt = await generateMfaJwt(client2);

      await client1.createEmail(client1Jwt, client1SecondEmail);
      emailData = await server.mailbox.waitForEmail(client1SecondEmail);
      emailCode = emailData['headers']['x-verify-code'];
      await client1.verifySecondaryEmailWithCode(client1Jwt, emailCode, client1SecondEmail);

      await client2.createEmail(client2Jwt, client2SecondEmail);
      emailData = await server.mailbox.waitForEmail(client2SecondEmail);
      emailCode = emailData['headers']['x-verify-code'];
      await client2.verifySecondaryEmailWithCode(client2Jwt, emailCode, client2SecondEmail);

      await client1.setPrimaryEmail(client1Jwt, client1SecondEmail);
      await client1.deleteEmail(client1Jwt, client1Email);

      await client2.setPrimaryEmail(client2Jwt, client2SecondEmail);
      await client2.deleteEmail(client2Jwt, client2Email);

      await client1.createEmail(client1Jwt, client2Email);
      emailCode = await server.mailbox.waitForEmailByHeader(client2Email, 'x-verify-code');
      await client1.verifySecondaryEmailWithCode(client1Jwt, emailCode, client2Email);
      await client1.setPrimaryEmail(client1Jwt, client2Email);
      await client1.deleteEmail(client1Jwt, client1SecondEmail);

      await client2.createEmail(client2Jwt, client1Email);
      emailCode = await server.mailbox.waitForEmailByHeader(client1Email, 'x-verify-code');
      await client2.verifySecondaryEmailWithCode(client2Jwt, emailCode, client1Email);
      await client2.setPrimaryEmail(client2Jwt, client1Email);
      await client2.deleteEmail(client2Jwt, client2SecondEmail);

      const res = await Client.login(server.publicUrl, client1Email, password, {
        originalLoginEmail: client2Email,
        ...testOptions,
      });
      expect(res).toBeTruthy();
    });

    describe('change primary email, deletes old primary', () => {
      beforeEach(async () => {
        const mfaJwt = await generateMfaJwt(client);

        let res = await client.setPrimaryEmail(mfaJwt, secondEmail);
        expect(res).toBeTruthy();

        let emailData = await server.mailbox.waitForEmail(secondEmail);
        expect(emailData.headers['to']).toBe(secondEmail);
        expect(emailData.headers['cc']).toBe(email);
        expect(emailData.headers['x-template-name']).toBe('postChangePrimary');

        res = await client.deleteEmail(mfaJwt, email);
        expect(res).toBeTruthy();

        res = await client.accountEmails();
        expect(res.length).toBe(1);
        expect(res[0].email).toBe(secondEmail);
        expect(res[0].isPrimary).toBe(true);
        expect(res[0].verified).toBe(true);

        emailData = await server.mailbox.waitForEmail(secondEmail);
        expect(emailData['headers']['x-template-name']).toBe('postRemoveSecondary');
      });

      it('can login', async () => {
        if (testOptions.version === 'V2') {
          const res = await Client.login(
            server.publicUrl,
            secondEmail,
            password,
            testOptions
          );
          expect(res.sessionToken).toBeDefined();
          return;
        }

        try {
          await Client.login(
            server.publicUrl,
            secondEmail,
            password,
            testOptions
          );
          fail('Should have returned correct email for user to login');
        } catch (err: any) {
          expect(err.code).toBe(400);
          expect(err.errno).toBe(120);
          expect(err.email).toBe(email);

          const res = await Client.login(server.publicUrl, err.email, password, {
            originalLoginEmail: secondEmail,
            ...testOptions,
          });
          expect(res).toBeTruthy();
        }
      });

      it('can change password', async () => {
        let res = await Client.login(server.publicUrl, email, password, {
          originalLoginEmail: secondEmail,
          ...testOptions,
        });
        client = res;

        res = await client.changePassword(
          newPassword,
          undefined,
          client.sessionToken
        );
        expect(res).toBeTruthy();

        res = await Client.login(server.publicUrl, email, newPassword, {
          originalLoginEmail: secondEmail,
          ...testOptions,
        });
        expect(res).toBeTruthy();
      });

      it('can reset password', async () => {
        client.email = secondEmail;
        await client.forgotPassword();

        const code = await server.mailbox.waitForCode(secondEmail);
        expect(code).toBeTruthy();

        const res = await resetPassword(client, code, newPassword, undefined, {
          emailToHashWith: email,
        });
        expect(res).toBeTruthy();

        if (testOptions.version === 'V2') {
          await Client.upgradeCredentials(
            server.publicUrl,
            email,
            newPassword,
            {
              originalLoginEmail: secondEmail,
              version: '',
              keys: true,
            }
          );
        }

        const loginRes = await Client.login(server.publicUrl, email, newPassword, {
          originalLoginEmail: secondEmail,
          ...testOptions,
        });
        expect(loginRes).toBeTruthy();
      });

      it('can delete account', async () => {
        await client.destroyAccount();

        try {
          await Client.login(server.publicUrl, email, newPassword, {
            originalLoginEmail: secondEmail,
            ...testOptions,
          });
          fail('Should not have been able to login after deleting account');
        } catch (err: any) {
          expect(err.errno).toBe(102);
          expect(err.email).toBe(secondEmail);
        }
      });
    });
  }
);
