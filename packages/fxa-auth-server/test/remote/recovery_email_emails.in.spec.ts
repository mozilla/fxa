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

const password = 'allyourbasearebelongtous';

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

let server: TestServerInstance;

beforeAll(async () => {
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

describe.each(testVersions)(
  '#integration$tag - remote emails',
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

      const status = await client.emailStatus();
      expect(status.verified).toBe(true);
    });

    describe('should create and get additional email', () => {
      it('can create', async () => {
        const secondEmail = server.uniqueEmail();
        const mfaJwt = await generateMfaJwt(client);

        let res = await client.accountEmails();
        expect(res.length).toBe(1);
        expect(res[0].email).toBe(email);
        expect(res[0].isPrimary).toBe(true);
        expect(res[0].verified).toBe(true);

        res = await client.createEmail(mfaJwt, secondEmail);
        expect(res).toBeTruthy();

        res = await client.accountEmails();
        expect(res.length).toBe(1);

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
      });

      it('can create account with an email that is an unverified secondary email on another account', async () => {
        const secondEmail = server.uniqueEmail();
        const db = await setupAccountDatabase(baseConfig.database.mysql.auth);
        try {
          await db
            .insertInto('emails')
            .values({
              email: secondEmail,
              normalizedEmail: emailHelper.helpers.normalizeEmail(secondEmail),
              uid: Buffer.from(client.uid, 'hex'),
              emailCode: Buffer.from(crypto.randomBytes(16).toString('hex'), 'hex'),
              isVerified: 0,
              isPrimary: 0,
              createdAt: Date.now(),
            })
            .execute();
        } finally {
          await db.destroy();
        }

        let res = await client.accountEmails();
        expect(res.length).toBe(2);
        expect(res[1].email).toBe(secondEmail);
        expect(res[1].isPrimary).toBe(false);
        expect(res[1].verified).toBe(false);

        const client2 = await Client.createAndVerify(
          server.publicUrl,
          secondEmail,
          password,
          server.mailbox,
          testOptions
        );
        expect(client2.email).toBe(secondEmail);

        res = await client.accountEmails();
        expect(res.length).toBe(1);
        expect(res[0].email).toBe(client.email);
        expect(res[0].isPrimary).toBe(true);
        expect(res[0].verified).toBe(true);
      });

      it('can transfer an unverified secondary email from one account to another', async () => {
        const clientEmail = server.uniqueEmail();
        const secondEmail = server.uniqueEmail();
        const db = await setupAccountDatabase(baseConfig.database.mysql.auth);
        try {
          await db
            .insertInto('emails')
            .values({
              email: secondEmail,
              normalizedEmail: emailHelper.helpers.normalizeEmail(secondEmail),
              uid: Buffer.from(client.uid, 'hex'),
              emailCode: Buffer.from(crypto.randomBytes(16).toString('hex'), 'hex'),
              isVerified: 0,
              isPrimary: 0,
              createdAt: Date.now(),
            })
            .execute();
        } finally {
          await db.destroy();
        }

        let res = await client.accountEmails();
        expect(res.length).toBe(2);
        expect(res[1].email).toBe(secondEmail);
        expect(res[1].isPrimary).toBe(false);
        expect(res[1].verified).toBe(false);

        const client2 = await Client.createAndVerify(
          server.publicUrl,
          clientEmail,
          password,
          server.mailbox,
          testOptions
        );
        expect(client2.email).toBe(clientEmail);

        const client2Jwt = await generateMfaJwt(client2);
        await client2.createEmail(client2Jwt, secondEmail);

        const emailData = await server.mailbox.waitForEmail(secondEmail);
        expect(emailData['headers']['x-template-name']).toBe('verifySecondaryCode');
        const emailCode = emailData['headers']['x-verify-code'];
        expect(emailCode).toBeTruthy();

        res = await client2.verifySecondaryEmailWithCode(client2Jwt, emailCode, secondEmail);
        expect(res).toBeTruthy();

        res = await client.accountEmails();
        expect(res.length).toBe(1);
        expect(res[0].email).toBe(client.email);
        expect(res[0].isPrimary).toBe(true);
        expect(res[0].verified).toBe(true);

        res = await client2.accountEmails();
        expect(res.length).toBe(2);
        expect(res[1].email).toBe(secondEmail);
        expect(res[1].isPrimary).toBe(false);
        expect(res[1].verified).toBe(true);
      });

      it('fails create when email is user primary email', async () => {
        const mfaJwt = await generateMfaJwt(client);
        try {
          await client.createEmail(mfaJwt, email);
          fail('should have thrown');
        } catch (err: any) {
          expect(err.errno).toBe(139);
          expect(err.code).toBe(400);
          expect(err.message).toBe(
            'Can not add secondary email that is same as your primary'
          );
        }
      });

      it('fails create when email exists in user emails', async () => {
        const secondEmail = server.uniqueEmail();
        const mfaJwt = await generateMfaJwt(client);

        await client.createEmail(mfaJwt, secondEmail);
        const emailData = await server.mailbox.waitForEmail(secondEmail);
        expect(emailData['headers']['x-template-name']).toBe('verifySecondaryCode');
        const emailCode = emailData['headers']['x-verify-code'];
        expect(emailCode).toBeTruthy();

        const res = await client.verifySecondaryEmailWithCode(mfaJwt, emailCode, secondEmail);
        expect(res).toBeTruthy();

        try {
          await client.createEmail(mfaJwt, secondEmail);
          fail('should have thrown');
        } catch (err: any) {
          expect(err.errno).toBe(189);
          expect(err.code).toBe(400);
          expect(err.message).toBe('This email already exists on your account');
        }
      });

      it('fails create when verified secondary email exists in other user account', async () => {
        const anotherUserEmail = server.uniqueEmail();
        const anotherUserSecondEmail = server.uniqueEmail();

        const anotherClient = await Client.createAndVerify(
          server.publicUrl,
          anotherUserEmail,
          password,
          server.mailbox,
          testOptions
        );

        const anotherClientJwt = await generateMfaJwt(anotherClient);
        await anotherClient.createEmail(anotherClientJwt, anotherUserSecondEmail);

        const emailData = await server.mailbox.waitForEmail(anotherUserSecondEmail);
        const emailCode = emailData['headers']['x-verify-code'];
        const res = await anotherClient.verifySecondaryEmailWithCode(
          anotherClientJwt,
          emailCode,
          anotherUserSecondEmail
        );
        expect(res).toBeTruthy();

        const mfaJwt = await generateMfaJwt(client);
        try {
          await client.createEmail(mfaJwt, anotherUserSecondEmail);
          fail('should have thrown');
        } catch (err: any) {
          expect(err.errno).toBe(136);
          expect(err.code).toBe(400);
          expect(err.message).toBe('Email already exists');
        }
      });

      it('fails for unverified session', async () => {
        const secondEmail = server.uniqueEmail();
        await client.login();

        const res = await client.accountEmails();
        expect(res.length).toBe(1);
        expect(res[0].email).toBe(email);
        expect(res[0].isPrimary).toBe(true);
        expect(res[0].verified).toBe(true);

        const mfaJwt = await generateMfaJwt(client);
        try {
          await client.createEmail(mfaJwt, secondEmail);
          fail('Should not have created email');
        } catch (err: any) {
          expect(err.code).toBe(400);
          expect(err.errno).toBe(138);
        }
      });

      it('fails create when email is another users verified primary', async () => {
        const anotherUserEmail = server.uniqueEmail();
        await Client.createAndVerify(
          server.publicUrl,
          anotherUserEmail,
          password,
          server.mailbox,
          testOptions
        );

        const mfaJwt = await generateMfaJwt(client);
        try {
          await client.createEmail(mfaJwt, anotherUserEmail);
          fail('should have thrown');
        } catch (err: any) {
          expect(err.errno).toBe(140);
          expect(err.code).toBe(400);
          expect(err.message).toBe('Email already exists');
        }
      });
    });

    describe('should delete additional email', () => {
      let secondEmail: string;
      let mfaJwt: string;

      beforeEach(async () => {
        secondEmail = server.uniqueEmail();
        mfaJwt = await generateMfaJwt(client);

        await client.createEmail(mfaJwt, secondEmail);
        const emailData = await server.mailbox.waitForEmail(secondEmail);
        expect(emailData['headers']['x-template-name']).toBe('verifySecondaryCode');
        const emailCode = emailData['headers']['x-verify-code'];

        let res = await client.verifySecondaryEmailWithCode(mfaJwt, emailCode, secondEmail);
        expect(res).toBeTruthy();

        res = await client.accountEmails();
        expect(res.length).toBe(2);
        expect(res[1].email).toBe(secondEmail);
        expect(res[1].isPrimary).toBe(false);
        expect(res[1].verified).toBe(true);

        const postVerifyEmailData = await server.mailbox.waitForEmail(email);
        expect(postVerifyEmailData['headers']['x-template-name']).toBe('postVerifySecondary');
      });

      it('can delete', async () => {
        let res = await client.deleteEmail(mfaJwt, secondEmail);
        expect(res).toBeTruthy();

        res = await client.accountEmails();
        expect(res.length).toBe(1);
        expect(res[0].email).toBe(email);
        expect(res[0].isPrimary).toBe(true);
        expect(res[0].verified).toBe(true);

        const emailData = await server.mailbox.waitForEmail(email);
        expect(emailData['headers']['x-template-name']).toBe('postRemoveSecondary');
      });

      it('resets account tokens when deleting an email', async () => {
        await client.forgotPassword();
        const forgotEmailData = await server.mailbox.waitForEmail(secondEmail);
        const otpCode = forgotEmailData.headers['x-password-forgot-otp'];
        expect(otpCode).toBeTruthy();

        let res = await client.deleteEmail(mfaJwt, secondEmail);
        expect(res).toBeTruthy();

        res = await client.accountEmails();
        expect(res.length).toBe(1);
      });

      it('silent fail on delete non-existent email', async () => {
        const res = await client.deleteEmail(mfaJwt, 'fill@yourboots.com');
        expect(res).toBeTruthy();
      });

      it('fails on delete primary account email', async () => {
        try {
          await client.deleteEmail(mfaJwt, email);
          fail('should have thrown');
        } catch (err: any) {
          expect(err.errno).toBe(137);
          expect(err.code).toBe(400);
          expect(err.message).toBe('Can not delete primary email');
        }
      });

      it('fails for unverified session', async () => {
        await client.login();

        const res = await client.accountEmails();
        expect(res.length).toBe(2);
        expect(res[1].email).toBe(secondEmail);
        expect(res[1].isPrimary).toBe(false);
        expect(res[1].verified).toBe(true);

        const unverifiedJwt = await generateMfaJwt(client);
        try {
          await client.deleteEmail(unverifiedJwt, secondEmail);
          fail('Should not have deleted email');
        } catch (err: any) {
          expect(err.code).toBe(400);
          expect(err.errno).toBe(138);
        }
      });
    });

    describe('should receive emails on verified secondary emails', () => {
      let secondEmail: string;
      let thirdEmail: string;
      let mfaJwt: string;

      beforeEach(async () => {
        secondEmail = server.uniqueEmail();
        thirdEmail = server.uniqueEmail();
        mfaJwt = await generateMfaJwt(client);

        let res = await client.createEmail(mfaJwt, secondEmail);
        expect(res).toBeTruthy();

        let emailData = await server.mailbox.waitForEmail(secondEmail);
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

        emailData = await server.mailbox.waitForEmail(email);
        expect(emailData['headers']['x-template-name']).toBe('postVerifySecondary');

        // Create a third email but don't verify it (legacy unverified email)
        const db = await setupAccountDatabase(baseConfig.database.mysql.auth);
        try {
          await db
            .insertInto('emails')
            .values({
              email: thirdEmail,
              normalizedEmail: emailHelper.helpers.normalizeEmail(thirdEmail),
              uid: Buffer.from(client.uid, 'hex'),
              emailCode: Buffer.from(crypto.randomBytes(16).toString('hex'), 'hex'),
              isVerified: 0,
              isPrimary: 0,
              createdAt: Date.now(),
            })
            .execute();
        } finally {
          await db.destroy();
        }

        res = await client.accountEmails();
        expect(res.length).toBe(3);
        expect(res[2].email).toBe(thirdEmail);
        expect(res[2].isPrimary).toBe(false);
        expect(res[2].verified).toBe(false);
      });

      it('receives sign-in confirmation email', async () => {
        const res = await client.login({ keys: true });
        expect(res).toBeTruthy();

        const emailData = await server.mailbox.waitForEmail(email);
        expect(emailData['headers']['x-template-name']).toBe('verifyLogin');
        const emailCode = emailData['headers']['x-verify-code'];
        expect(emailCode).toBeTruthy();
        expect(emailData.cc.length).toBe(1);
        expect(emailData.cc[0].address).toBe(secondEmail);

        await client.requestVerifyEmail();

        const emailData2 = await server.mailbox.waitForEmail(email);
        expect(emailData2['headers']['x-template-name']).toBe('verifyLogin');
        expect(emailData2['headers']['x-verify-code']).toBe(emailCode);
        expect(emailData2.cc.length).toBe(1);
        expect(emailData2.cc[0].address).toBe(secondEmail);
      });

      it('receives sign-in unblock email', async () => {
        await client.sendUnblockCode(email);

        let emailData = await server.mailbox.waitForEmail(email);
        expect(emailData['headers']['x-template-name']).toBe('unblockCode');
        const unblockCode = emailData['headers']['x-unblock-code'];
        expect(unblockCode).toBeTruthy();
        expect(emailData.cc.length).toBe(1);
        expect(emailData.cc[0].address).toBe(secondEmail);

        await client.sendUnblockCode(email);

        emailData = await server.mailbox.waitForEmail(email);
        expect(emailData['headers']['x-template-name']).toBe('unblockCode');
        expect(emailData.cc.length).toBe(1);
        expect(emailData.cc[0].address).toBe(secondEmail);
      });

      it('receives password reset email', async () => {
        await client.forgotPassword();

        const emailData = await server.mailbox.waitForEmail(email);
        expect(emailData['headers']['x-template-name']).toBe('passwordForgotOtp');
        expect(emailData.cc.length).toBe(1);
        expect(emailData.cc[0].address).toBe(secondEmail);
      });

      it('receives change password notification', async () => {
        const res = await client.changePassword(
          'password1',
          undefined,
          client.sessionToken
        );
        expect(res).toBeTruthy();

        const emailData = await server.mailbox.waitForEmail(email);
        expect(emailData['headers']['x-template-name']).toBe('passwordChanged');
        expect(emailData.cc.length).toBe(1);
        expect(emailData.cc[0].address).toBe(secondEmail);
      });

      it('receives password reset notification', async () => {
        await client.forgotPassword();

        let emailData = await server.mailbox.waitForEmail(email);
        const code = emailData.headers['x-password-forgot-otp'];

        const res = await resetPassword(client, code, 'password1', undefined, undefined);
        expect(res).toBeTruthy();

        emailData = await server.mailbox.waitForEmail(email);
        expect(emailData['headers']['x-template-name']).toBe('passwordReset');
        expect(emailData.cc.length).toBe(1);
        expect(emailData.cc[0].address).toBe(secondEmail);

        if (testOptions.version === 'V2') {
          client = await Client.upgradeCredentials(
            server.publicUrl,
            email,
            'password1',
            { version: '', keys: true },
            server.mailbox
          );
        }

        const loginClient = await client.login({ keys: true });
        client = loginClient;

        const accountEmails = await client.accountEmails();
        expect(accountEmails.length).toBe(3);
        expect(accountEmails[1].email).toBe(secondEmail);
        expect(accountEmails[1].isPrimary).toBe(false);
        expect(accountEmails[1].verified).toBe(true);
        expect(accountEmails[2].email).toBe(thirdEmail);
        expect(accountEmails[2].isPrimary).toBe(false);
        expect(accountEmails[2].verified).toBe(false);
      });

      it('receives secondary email removed notification', async () => {
        const fourthEmail = server.uniqueEmail();

        let res = await client.createEmail(mfaJwt, fourthEmail);
        expect(res).toBeTruthy();

        let emailData = await server.mailbox.waitForEmail(fourthEmail);
        const emailCode = emailData['headers']['x-verify-code'];

        res = await client.verifySecondaryEmailWithCode(mfaJwt, emailCode, fourthEmail);
        expect(res).toBeTruthy();

        // Clear email added template
        await server.mailbox.waitForEmail(email);

        await client.deleteEmail(mfaJwt, fourthEmail);

        emailData = await server.mailbox.waitForEmail(email);
        expect(emailData['headers']['x-template-name']).toBe('postRemoveSecondary');
        expect(emailData.cc.length).toBe(1);
        expect(emailData.cc[0].address).toBe(secondEmail);
      });
    });

    describe('should be able to initiate account reset from verified secondary email', () => {
      let secondEmail: string;

      beforeEach(async () => {
        secondEmail = server.uniqueEmail();
        const mfaJwt = await generateMfaJwt(client);

        let res = await client.createEmail(mfaJwt, secondEmail);
        expect(res).toBeTruthy();

        const emailData = await server.mailbox.waitForEmail(secondEmail);
        const emailCode = emailData['headers']['x-verify-code'];
        expect(emailCode).toBeTruthy();

        res = await client.verifySecondaryEmailWithCode(mfaJwt, emailCode, secondEmail);
        expect(res).toBeTruthy();
      });

      it('can initiate account reset with verified secondary email', async () => {
        client.email = secondEmail;
        await client.forgotPassword();

        const emailData = await server.mailbox.waitForEmail(secondEmail);
        expect(emailData.headers['x-password-forgot-otp']).toBeTruthy();
      });
    });

    describe("shouldn't be able to initiate account reset from secondary email", () => {
      let secondEmail: string;

      beforeEach(async () => {
        secondEmail = server.uniqueEmail();
        const mfaJwt = await generateMfaJwt(client);

        const res = await client.createEmail(mfaJwt, secondEmail);
        expect(res).toBeTruthy();

        await server.mailbox.waitForEmail(secondEmail);
      });

      it('fails to initiate account reset with unverified secondary email', async () => {
        client.email = secondEmail;
        try {
          await client.forgotPassword();
          fail('should not have been able to initiate reset password');
        } catch (err: any) {
          expect(err.code).toBe(400);
          expect(err.errno).toBe(102);
        }
      });

      it('returns account unknown error when using unknown email', async () => {
        client.email = 'unknown@email.com';
        try {
          await client.forgotPassword();
          fail('should not have been able to initiate reset password');
        } catch (err: any) {
          expect(err.code).toBe(400);
          expect(err.errno).toBe(102);
        }
      });
    });

    describe("shouldn't be able to login with secondary email", () => {
      let secondEmail: string;

      beforeEach(async () => {
        secondEmail = server.uniqueEmail();
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

      it('fails to login', async () => {
        try {
          await Client.login(
            server.publicUrl,
            secondEmail,
            password,
            testOptions
          );
          fail('should not have been able to login');
        } catch (err: any) {
          expect(err.code).toBe(400);
          expect(err.errno).toBe(142);
        }
      });
    });

    describe('verified secondary email', () => {
      let secondEmail: string;

      beforeEach(async () => {
        secondEmail = server.uniqueEmail();
        const mfaJwt = await generateMfaJwt(client);

        let res = await client.createEmail(mfaJwt, secondEmail);
        expect(res).toBeTruthy();

        const emailData = await server.mailbox.waitForEmail(secondEmail);
        const emailCode = emailData['headers']['x-verify-code'];
        expect(emailCode).toBeTruthy();

        res = await client.verifySecondaryEmailWithCode(mfaJwt, emailCode, secondEmail);
        expect(res).toBeTruthy();

        res = await client.accountEmails();
        expect(res.length).toBe(2);
        expect(res[1].email).toBe(secondEmail);
        expect(res[1].isPrimary).toBe(false);
        expect(res[1].verified).toBe(true);
      });

      it('cannot be used to create a new account', async () => {
        try {
          await Client.create(
            server.publicUrl,
            secondEmail,
            password,
            testOptions
          );
          fail('should have thrown');
        } catch (err: any) {
          expect(err.errno).toBe(144);
          expect(err.code).toBe(400);
        }
      });
    });

    describe('verify secondary email with code', () => {
      let secondEmail: string;
      let mfaJwt: string;

      beforeEach(async () => {
        secondEmail = server.uniqueEmail();
        mfaJwt = await generateMfaJwt(client);

        const res = await client.createEmail(mfaJwt, secondEmail);
        expect(res).toBeTruthy();
      });

      it('can verify using a code', async () => {
        let emailData = await server.mailbox.waitForEmail(secondEmail);
        expect(emailData['headers']['x-template-name']).toBe('verifySecondaryCode');
        const code = emailData['headers']['x-verify-code'];
        expect(code).toBeTruthy();

        let res = await client.verifySecondaryEmailWithCode(mfaJwt, code, secondEmail);
        expect(res).toBeTruthy();

        res = await client.accountEmails();
        expect(res.length).toBe(2);
        expect(res[1].email).toBe(secondEmail);
        expect(res[1].isPrimary).toBe(false);
        expect(res[1].verified).toBe(true);

        emailData = await server.mailbox.waitForEmail(email);
        expect(emailData['headers']['x-template-name']).toBe('postVerifySecondary');
      });

      it('does not verify on random email code', async () => {
        try {
          await client.verifySecondaryEmailWithCode(mfaJwt, '123123', secondEmail);
          fail('should have failed');
        } catch (err: any) {
          expect(err.errno).toBe(105);
          expect(err.code).toBe(400);
        }
      });
    });

    describe('(legacy) unverified secondary email', () => {
      let secondEmail: string;

      beforeEach(async () => {
        secondEmail = server.uniqueEmail();
        const db = await setupAccountDatabase(baseConfig.database.mysql.auth);
        const emailCode = Buffer.from(crypto.randomBytes(16).toString('hex'), 'hex');
        try {
          await db
            .insertInto('emails')
            .values({
              email: secondEmail,
              normalizedEmail: emailHelper.helpers.normalizeEmail(secondEmail),
              uid: Buffer.from(client.uid, 'hex'),
              emailCode,
              isVerified: 0,
              isPrimary: 0,
              createdAt: Date.now(),
            })
            .execute();
        } finally {
          await db.destroy();
        }
      });

      it('is deleted from the initial account if the email is verified on another account', async () => {
        let res = await client.accountEmails();
        expect(res.length).toBe(2);
        expect(res[1].email).toBe(secondEmail);
        expect(res[1].isPrimary).toBe(false);
        expect(res[1].verified).toBe(false);

        const client2 = await Client.createAndVerify(
          server.publicUrl,
          secondEmail,
          password,
          server.mailbox,
          testOptions
        );
        expect(client2.email).toBe(secondEmail);

        res = await client.accountEmails();
        expect(res.length).toBe(1);
        expect(res[0].email).toBe(client.email);
        expect(res[0].isPrimary).toBe(true);
        expect(res[0].verified).toBe(true);
      });

      it('can resend verify email code', async () => {
        const mfaJwt = await generateMfaJwt(client);
        let res = await client.resendVerifySecondaryEmailWithCode(
          mfaJwt,
          secondEmail
        );
        expect(res).toBeTruthy();

        const emailData = await server.mailbox.waitForEmail(secondEmail);
        expect(emailData['headers']['x-template-name']).toBe('verifySecondaryCode');
        const resendEmailCode = emailData['headers']['x-verify-code'];
        expect(resendEmailCode.length).toBe(6);

        await client.verifySecondaryEmailWithCode(mfaJwt, resendEmailCode, secondEmail);

        res = await client.accountEmails();
        expect(res.length).toBe(2);
        expect(res[1].email).toBe(secondEmail);
        expect(res[1].isPrimary).toBe(false);
        expect(res[1].verified).toBe(true);
      });
    });
  }
);
