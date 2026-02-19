/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createTestServer, TestServerInstance } from '../support/helpers/test-server';
import { AuthServerError } from '../support/helpers/test-utils';
import crypto from 'crypto';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Client = require('../client')();

let server: TestServerInstance;

beforeAll(async () => {
  server = await createTestServer({
    configOverrides: {
      securityHistory: { ipProfiling: { allowedRecency: 0 } },
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
  '#integration$tag - remote account login',
  ({ version, tag }) => {
    const testOptions = { version };

    it('the email is returned in the error on Incorrect password errors', async () => {
      const email = server.uniqueEmail();
      const password = 'abcdef';
      await Client.createAndVerify(
        server.publicUrl,
        email,
        password,
        server.mailbox,
        testOptions
      );

      try {
        await Client.login(
          server.publicUrl,
          email,
          `${password}x`,
          testOptions
        );
        fail('should have thrown');
      } catch (err: unknown) {
        expect((err as AuthServerError).code).toBe(400);
        expect((err as AuthServerError).errno).toBe(103);
        expect((err as AuthServerError).email).toBe(email);
      }
    });

    it('the email is returned in the error on Incorrect email case errors with correct password', async () => {
      if (version === 'V2') {
        // V2 passwords do not use the user's email as salt,
        // and therefore are not affected by this edge case.
        return;
      }

      const signupEmail = server.uniqueEmail();
      const loginEmail = signupEmail.toUpperCase();
      const password = 'abcdef';
      await Client.createAndVerify(
        server.publicUrl,
        signupEmail,
        password,
        server.mailbox,
        testOptions
      );

      try {
        await Client.login(
          server.publicUrl,
          loginEmail,
          password,
          testOptions
        );
        fail('should have thrown');
      } catch (err: unknown) {
        expect((err as AuthServerError).code).toBe(400);
        expect((err as AuthServerError).errno).toBe(120);
        expect((err as AuthServerError).email).toBe(signupEmail);
      }
    });

    it('Unknown account should not exist', async () => {
      const client = new Client(server.publicUrl, testOptions);
      client.email = server.uniqueEmail();
      client.authPW = crypto.randomBytes(32);
      client.authPWVersion2 = crypto.randomBytes(32);

      try {
        await client.login();
        fail('account should not exist');
      } catch (err: unknown) {
        expect((err as AuthServerError).errno).toBe(102);
      }
    });

    it('No keyFetchToken without keys=true', async () => {
      const email = server.uniqueEmail();
      const password = 'abcdef';
      await Client.createAndVerify(
        server.publicUrl,
        email,
        password,
        server.mailbox,
        testOptions
      );

      const c = await Client.login(server.publicUrl, email, password, {
        ...testOptions,
        keys: false,
      });
      expect(c.keyFetchToken).toBeNull();
    });

    it('login works with unicode email address', async () => {
      const email = server.uniqueUnicodeEmail();
      const password = 'wibble';
      await Client.createAndVerify(
        server.publicUrl,
        email,
        password,
        server.mailbox,
        testOptions
      );

      const client = await Client.login(
        server.publicUrl,
        email,
        password,
        testOptions
      );
      expect(client).toBeTruthy();
    });

    it('account login works with minimal metricsContext metadata', async () => {
      const email = server.uniqueEmail();
      await Client.createAndVerify(
        server.publicUrl,
        email,
        'foo',
        server.mailbox,
        testOptions
      );

      const client = await Client.login(server.publicUrl, email, 'foo', {
        ...testOptions,
        metricsContext: {
          flowId:
            '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
          flowBeginTime: Date.now(),
        },
      });
      expect(client).toBeTruthy();
    });

    it('account login fails with invalid metricsContext flowId', async () => {
      const email = server.uniqueEmail();
      await Client.createAndVerify(
        server.publicUrl,
        email,
        'foo',
        server.mailbox,
        testOptions
      );

      try {
        await Client.login(server.publicUrl, email, 'foo', {
          ...testOptions,
          metricsContext: {
            flowId:
              '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0',
            flowBeginTime: Date.now(),
          },
        });
        fail('account login should have failed');
      } catch (err: unknown) {
        expect((err as AuthServerError).errno).toBe(107);
      }
    });

    it('account login fails with invalid metricsContext flowBeginTime', async () => {
      const email = server.uniqueEmail();
      await Client.createAndVerify(
        server.publicUrl,
        email,
        'foo',
        server.mailbox,
        testOptions
      );

      try {
        await Client.login(server.publicUrl, email, 'foo', {
          ...testOptions,
          metricsContext: {
            flowId:
              '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
            flowBeginTime: 'wibble',
          },
        });
        fail('account login should have failed');
      } catch (err: unknown) {
        expect((err as AuthServerError).errno).toBe(107);
      }
    });

    describe('can use verificationMethod', () => {
      let email: string;
      const password = 'foo';

      beforeEach(async () => {
        email = server.uniqueEmail('@mozilla.com');
        await Client.createAndVerify(
          server.publicUrl,
          email,
          password,
          server.mailbox,
          testOptions
        );
      });

      it('fails with invalid verification method', async () => {
        try {
          await Client.login(server.publicUrl, email, password, {
            ...testOptions,
            verificationMethod: 'notvalid',
            keys: true,
          });
          fail('should not have succeeded');
        } catch (err: unknown) {
          expect((err as AuthServerError).errno).toBe(107);
        }
      });

      it('can use `email` verification', async () => {
        const client = await Client.login(
          server.publicUrl,
          email,
          password,
          {
            ...testOptions,
            verificationMethod: 'email',
            keys: true,
          }
        );

        expect(client.verificationMethod).toBe('email');

        let status = await client.emailStatus();
        expect(status.verified).toBe(false);
        expect(status.emailVerified).toBe(true);
        expect(status.sessionVerified).toBe(false);

        const emailData = await server.mailbox.waitForEmail(email);
        expect(emailData.headers['x-template-name']).toBe('verifyLogin');
        const code = emailData.headers['x-verify-code'];
        expect(code).toBeTruthy();

        await client.verifyEmail(code);

        status = await client.emailStatus();
        expect(status.verified).toBe(true);
        expect(status.emailVerified).toBe(true);
        expect(status.sessionVerified).toBe(true);
      });

      it('can use `email-2fa` verification', async () => {
        const client = await Client.login(
          server.publicUrl,
          email,
          password,
          {
            ...testOptions,
            verificationMethod: 'email-2fa',
            keys: true,
          }
        );

        expect(client.verificationMethod).toBe('email-2fa');

        const status = await client.emailStatus();
        expect(status.verified).toBe(false);
        expect(status.emailVerified).toBe(true);
        expect(status.sessionVerified).toBe(false);

        const emailData = await server.mailbox.waitForEmail(email);
        expect(emailData.headers['x-template-name']).toBe('verifyLoginCode');
        const code = emailData.headers['x-signin-verify-code'];
        expect(code).toBeTruthy();
      });

      it('can use `totp-2fa` verification', async () => {
        const totpEmail = server.uniqueEmail();
        await Client.createAndVerifyAndTOTP(
          server.publicUrl,
          totpEmail,
          password,
          server.mailbox,
          { ...testOptions, keys: true }
        );

        const client = await Client.login(
          server.publicUrl,
          totpEmail,
          password,
          {
            ...testOptions,
            verificationMethod: 'totp-2fa',
            keys: true,
          }
        );

        expect(client.verificationMethod).toBe('totp-2fa');

        const status = await client.emailStatus();
        expect(status.verified).toBe(false);
        expect(status.emailVerified).toBe(true);
        expect(status.sessionVerified).toBe(false);
      });

      it('should include verificationMethod if session is unverified', async () => {
        const client = await Client.login(
          server.publicUrl,
          email,
          password,
          {
            ...testOptions,
            verificationMethod: 'email',
            keys: false,
          }
        );

        expect(client.verificationMethod).toBe('email');

        const status = await client.emailStatus();
        expect(status.emailVerified).toBe(true);
        expect(status.sessionVerified).toBe(false);
      });
    });
  }
);
