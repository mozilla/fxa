/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createTestServer, TestServerInstance } from '../support/helpers/test-server';
import crypto from 'crypto';
import { AppError } from '@fxa/accounts/errors';
const otplib = require('otplib');

interface AuthServerError extends Error {
  code: number;
  errno: number;
  message: string;
}

const Client = require('../client')();

let server: TestServerInstance;

beforeAll(async () => {
  server = await createTestServer({
    configOverrides: {
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
  '#integration$tag - remote account destroy',
  ({ version, tag }) => {
    const testOptions = { version };

    it('can delete account by providing short code', async () => {
      const email = server.uniqueEmail();
      const password = 'ok';
      await Client.create(server.publicUrl, email, password, {
        ...testOptions,
        verificationMethod: 'email-2fa',
        keys: true,
      });
      const client = await Client.login(server.publicUrl, email, password, {
        ...testOptions,
        verificationMethod: 'email-2fa',
        keys: true,
      });

      await client.resendVerifyShortCodeEmail();
      const emailData = await server.mailbox.waitForEmail(email);
      let code: string | undefined;
      for (let i = 0; i < emailData.length; i++) {
        if (emailData[i].headers['x-verify-short-code']) {
          code = emailData[i].headers['x-verify-short-code'];
        }
      }
      expect(code).toBeDefined();
      await client.verifyShortCodeEmail(code);

      // Should not throw
      await client.destroyAccount();
    });

    it('can delete account by providing verify code', async () => {
      const email = server.uniqueEmail();
      const password = 'ok';
      await Client.create(server.publicUrl, email, password, {
        ...testOptions,
        verificationMethod: 'email-2fa',
        keys: true,
      });
      const client = await Client.login(server.publicUrl, email, password, {
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

    it('cannot delete account with invalid authPW', async () => {
      const email = server.uniqueEmail();
      const password = 'ok';
      const c = await Client.createAndVerify(
        server.publicUrl,
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
        fail('should not be able to destroy account with invalid password');
      } catch (err: unknown) {
        expect((err as AuthServerError).errno).toBe(103);
      }
    });

    it('cannot delete account without verifying TOTP', async () => {
      const email = server.uniqueEmail();
      const password = 'ok';

      await Client.createAndVerifyAndTOTP(
        server.publicUrl,
        email,
        password,
        server.mailbox,
        { ...testOptions, keys: true }
      );

      // Create a new unverified session
      const client = await Client.login(
        server.publicUrl,
        email,
        password,
        testOptions
      );
      const res = await client.emailStatus();
      expect(res.sessionVerified).toBe(false);

      try {
        await client.destroyAccount();
        fail('Should not be able to destroy account without verifying totp');
      } catch (err: unknown) {
        expect((err as AuthServerError).errno).toBe(
          AppError.ERRNO.INSUFFICIENT_AAL
        );
      }
    });

    it('cannot delete account with TOTP by supplying email otp code', async () => {
      const email = server.uniqueEmail();
      const password = 'ok';
      await Client.create(server.publicUrl, email, password, {
        ...testOptions,
        verificationMethod: 'email-2fa',
        keys: true,
      });
      let client = await Client.login(server.publicUrl, email, password, {
        ...testOptions,
        verificationMethod: 'email-2fa',
        keys: true,
      });

      await client.resendVerifyShortCodeEmail();
      const emailData = await server.mailbox.waitForEmail(email);
      let code: string | undefined;
      for (let i = 0; i < emailData.length; i++) {
        if (emailData[i].headers['x-verify-short-code']) {
          code = emailData[i].headers['x-verify-short-code'];
        }
      }
      expect(code).toBeDefined();
      await client.verifyShortCodeEmail(code);

      // Add totp to account.
      client.totpAuthenticator = new otplib.authenticator.Authenticator();
      const totpTokenResult = await client.createTotpToken();
      expect(totpTokenResult).toBeDefined();
      client.totpAuthenticator.options = {
        secret: totpTokenResult.secret,
        crypto: crypto,
      };
      const totpCode = client.totpAuthenticator.generate();
      await client.verifyTotpSetupCode(totpCode);
      await client.completeTotpSetup();

      // Log in again. This creates a new unverified session
      client = await Client.login(
        server.publicUrl,
        email,
        password,
        testOptions
      );
      const res = await client.emailStatus();
      expect(res.sessionVerified).toBe(false);

      // Try verifying the session with a short code. This should
      // not be enough to bypass 2FA.
      await client.verifyShortCodeEmail(code);
      expect((await client.emailStatus()).sessionVerified).toBe(true);

      // Destroying the account should not work. Despite the session being 'verified',
      // totp has not been provided.
      try {
        await client.destroyAccount();
        fail('Should not be able to destroy account without verifying totp');
      } catch (error: unknown) {
        expect((error as AuthServerError).errno).toBe(
          AppError.ERRNO.INSUFFICIENT_AAL
        );
      }
    });

    it('cannot delete without verifying session', async () => {
      const email = server.uniqueEmail();
      const password = 'ok';
      await Client.createAndVerify(
        server.publicUrl,
        email,
        password,
        server.mailbox,
        testOptions
      );

      // Login again requiring email-2fa for session verification.
      const client = await Client.login(server.publicUrl, email, password, {
        ...testOptions,
        verificationMethod: 'email-2fa',
      });

      try {
        await client.destroyAccount();
        fail('Should not be able allowed to destroy account.');
      } catch (err: unknown) {
        expect((err as AuthServerError).message).toBe('Unconfirmed session');
      }
    });

    it('cannot delete without verifying account', async () => {
      const email = server.uniqueEmail();
      const password = 'ok';
      await Client.create(server.publicUrl, email, password, {
        ...testOptions,
        verificationMethod: 'email-2fa',
        keys: true,
      });
      const client = await Client.login(
        server.publicUrl,
        email,
        password,
        testOptions
      );
      try {
        await client.destroyAccount();
        fail('Should not be able allowed to destroy account.');
      } catch (err: unknown) {
        expect((err as AuthServerError).message).toBe('Unconfirmed session');
      }
    });
  }
);
