/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createTestServer, TestServerInstance } from '../support/helpers/test-server';
const otplib = require('otplib');

interface AuthServerError extends Error {
  code: number;
  errno: number;
}

const Client = require('../client')();

let server: TestServerInstance;

beforeAll(async () => {
  server = await createTestServer();
}, 120000);

afterAll(async () => {
  await server.stop();
});

const testVersions = [
  { version: '', tag: '' },
  { version: 'V2', tag: 'V2' },
];

describe.each(testVersions)(
  '#integration$tag - remote account create with sign-up code',
  ({ version, tag }) => {
    const testOptions = { version };
    const password = '4L6prUdlLNfxGIoj';

    it('create and verify sync account', async () => {
      const email = server.uniqueEmail();
      const client = await Client.create(server.publicUrl, email, password, {
        ...testOptions,
        service: 'sync',
        verificationMethod: 'email-otp',
      });
      expect(client.authAt).toBeTruthy();

      let emailStatus = await client.emailStatus();
      expect(emailStatus.verified).toBe(false);

      let emailData = await server.mailbox.waitForEmail(email);
      expect(emailData.headers['x-template-name']).toBe('verifyShortCode');

      await client.verifyShortCodeEmail(
        emailData.headers['x-verify-short-code'],
        { service: 'sync' }
      );

      emailData = await server.mailbox.waitForEmail(email);
      expect(emailData.headers['x-link']).toContain(
        (server.config as any).smtp.syncUrl
      );

      emailStatus = await client.emailStatus();
      expect(emailStatus.verified).toBe(true);
    });

    it('create and verify account', async () => {
      const email = server.uniqueEmail();
      const client = await Client.create(server.publicUrl, email, password, {
        ...testOptions,
        verificationMethod: 'email-otp',
      });
      expect(client.authAt).toBeTruthy();

      let emailStatus = await client.emailStatus();
      expect(emailStatus.verified).toBe(false);

      const emailData = await server.mailbox.waitForEmail(email);
      expect(emailData.headers['x-template-name']).toBe('verifyShortCode');

      await client.verifyShortCodeEmail(
        emailData.headers['x-verify-short-code']
      );

      emailStatus = await client.emailStatus();
      expect(emailStatus.verified).toBe(true);

      // It's hard to test for "an email didn't arrive".
      // Instead trigger sending of another email and test
      // that there wasn't anything in the queue before it.
      await client.forgotPassword();
      const code = await server.mailbox.waitForCode(email);
      expect(code).toBeTruthy();
    });

    it('throws for expired code', async () => {
      const email = server.uniqueEmail();
      const client = await Client.create(server.publicUrl, email, password, {
        ...testOptions,
        verificationMethod: 'email-otp',
      });
      expect(client.authAt).toBeTruthy();

      let emailData = await server.mailbox.waitForEmail(email);
      expect(emailData.headers['x-template-name']).toBe('verifyShortCode');

      await client.requestVerifyEmail();
      emailData = await server.mailbox.waitForEmail(email);
      expect(emailData.headers['x-template-name']).toBe('verify');

      const secret = emailData.headers['x-verify-code'];
      const futureAuthenticator = new otplib.authenticator.Authenticator();
      futureAuthenticator.options = Object.assign(
        {},
        otplib.authenticator.options,
        (server.config as any).otp,
        { secret, epoch: Date.now() / 1000 - 60 * 60 } // Code 60mins old
      );
      const expiredCode = futureAuthenticator.generate();

      await expect(
        client.verifyShortCodeEmail(expiredCode)
      ).rejects.toMatchObject({ code: 400, errno: 183 });
    });

    it('throws for invalid code', async () => {
      const email = server.uniqueEmail();
      const client = await Client.create(server.publicUrl, email, password, {
        ...testOptions,
        verificationMethod: 'email-otp',
      });
      expect(client.authAt).toBeTruthy();

      const emailData = await server.mailbox.waitForEmail(email);
      expect(emailData.headers['x-template-name']).toBe('verifyShortCode');

      const invalidCode = emailData.headers['x-verify-short-code'] + 1;

      await expect(
        client.verifyShortCodeEmail(invalidCode)
      ).rejects.toMatchObject({ code: 400, errno: 183 });
    });

    it('create and resend authentication code', async () => {
      const email = server.uniqueEmail();
      const client = await Client.create(server.publicUrl, email, password, {
        ...testOptions,
        verificationMethod: 'email-otp',
      });

      let emailData = await server.mailbox.waitForEmail(email);
      const originalMessageId = emailData['messageId'];
      const originalCode = emailData.headers['x-verify-short-code'];

      expect(emailData.headers['x-template-name']).toBe('verifyShortCode');

      await client.resendVerifyShortCodeEmail();

      emailData = await server.mailbox.waitForEmail(email);
      expect(emailData.headers['x-template-name']).toBe('verifyShortCode');
      expect(emailData['messageId']).not.toBe(originalMessageId);
      expect(emailData.headers['x-verify-short-code']).toBe(originalCode);
    });

    it('should verify code from previous code window', async () => {
      const email = server.uniqueEmail();
      const client = await Client.create(server.publicUrl, email, password, {
        ...testOptions,
        verificationMethod: 'email-otp',
      });

      let emailData = await server.mailbox.waitForEmail(email);
      expect(emailData.headers['x-template-name']).toBe('verifyShortCode');

      await client.requestVerifyEmail();
      emailData = await server.mailbox.waitForEmail(email);

      // Each code window is 10 minutes
      const secret = emailData.headers['x-verify-code'];
      const futureAuthenticator = new otplib.authenticator.Authenticator();
      futureAuthenticator.options = Object.assign(
        {},
        otplib.authenticator.options,
        (server.config as any).otp,
        { secret, epoch: Date.now() / 1000 - 60 * 10 } // Code 10mins old
      );

      const previousWindowCode = futureAuthenticator.generate(secret);
      const response = await client.verifyShortCodeEmail(previousWindowCode);
      expect(response).toBeTruthy();
    });

    it('should not verify code from future code window', async () => {
      const email = server.uniqueEmail();
      const client = await Client.create(server.publicUrl, email, password, {
        ...testOptions,
        verificationMethod: 'email-otp',
      });

      let emailData = await server.mailbox.waitForEmail(email);
      expect(emailData.headers['x-template-name']).toBe('verifyShortCode');

      await client.requestVerifyEmail();
      emailData = await server.mailbox.waitForEmail(email);

      // Each code window is 10 minutes
      const secret = emailData.headers['x-verify-code'];
      const futureAuthenticator = new otplib.authenticator.Authenticator();
      futureAuthenticator.options = Object.assign(
        {},
        otplib.authenticator.options,
        (server.config as any).otp,
        { secret, epoch: Date.now() / 1000 + 60 * 30 } // Code 30mins in future
      );

      const futureWindowCode = futureAuthenticator.generate(secret);

      await expect(
        client.verifyShortCodeEmail(futureWindowCode)
      ).rejects.toMatchObject({ code: 400, errno: 183 });
    });
  }
);
