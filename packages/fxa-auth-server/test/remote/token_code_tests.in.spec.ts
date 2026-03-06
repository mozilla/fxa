/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  createTestServer,
  TestServerInstance,
} from '../support/helpers/test-server';
import { AuthServerError } from '../support/helpers/test-utils';

// eslint-disable-next-line @typescript-eslint/no-require-imports
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
  '#integration$tag - remote tokenCodes',
  ({ version, tag }) => {
    const testOptions = { version };
    const password = 'pssssst';
    let client;
    let email: string;

    beforeEach(async () => {
      email = server.uniqueEmail('@mozilla.com');
      client = await Client.createAndVerify(
        server.publicUrl,
        email,
        password,
        server.mailbox,
        testOptions
      );
      expect(client.authAt).toBeTruthy();
    });

    it('should error with invalid code', async () => {
      client = await Client.login(server.publicUrl, email, password, {
        ...testOptions,
        verificationMethod: 'email-2fa',
        keys: true,
      });
      expect(client.verificationMethod).toBe('email-2fa');

      try {
        await client.verifyShortCodeEmail('011001');
        fail('consumed invalid code');
      } catch (err: unknown) {
        const error = err as AuthServerError;
        expect(error.errno).toBe(183);
      }

      const status = await client.emailStatus();
      expect(status.verified).toBe(false);
      expect(status.emailVerified).toBe(true);
      expect(status.sessionVerified).toBe(false);
    });

    it('should error with invalid request param when using wrong code format', async () => {
      client = await Client.login(server.publicUrl, email, password, {
        ...testOptions,
        verificationMethod: 'email-2fa',
        keys: true,
      });
      expect(client.verificationMethod).toBe('email-2fa');

      try {
        await client.verifyShortCodeEmail('Cool Runnings 4 u');
        fail('consumed invalid code');
      } catch (err: unknown) {
        const error = err as AuthServerError;
        expect(error.errno).toBe(107);
      }

      const status = await client.emailStatus();
      expect(status.verified).toBe(false);
      expect(status.emailVerified).toBe(true);
      expect(status.sessionVerified).toBe(false);
    });

    it('should consume valid code', async () => {
      client = await Client.login(server.publicUrl, email, password, {
        ...testOptions,
        verificationMethod: 'email-2fa',
        keys: true,
      });
      expect(client.verificationMethod).toBe('email-2fa');

      let status = await client.emailStatus();
      expect(status.verified).toBe(false);
      expect(status.emailVerified).toBe(true);
      expect(status.sessionVerified).toBe(false);

      const emailData = await server.mailbox.waitForEmail(email);
      expect(emailData.headers['x-template-name']).toBe('verifyLoginCode');
      const code = emailData.headers['x-signin-verify-code'];
      expect(code).toBeTruthy();

      const verifyRes = await client.verifyShortCodeEmail(code);
      expect(verifyRes).toBeTruthy();

      status = await client.emailStatus();
      expect(status.verified).toBe(true);
      expect(status.emailVerified).toBe(true);
      expect(status.sessionVerified).toBe(true);
    });

    it('should accept optional uid parameter in request body', async () => {
      client = await Client.login(server.publicUrl, email, password, {
        ...testOptions,
        verificationMethod: 'email-2fa',
        keys: true,
      });

      const emailData = await server.mailbox.waitForEmail(email);
      expect(emailData.headers['x-template-name']).toBe('verifyLoginCode');
      const code = emailData.headers['x-signin-verify-code'];
      expect(code).toBeTruthy();

      const verifyRes = await client.verifyShortCodeEmail(code, {
        uid: client.uid,
      });
      expect(verifyRes).toBeTruthy();

      const status = await client.emailStatus();
      expect(status.verified).toBe(true);
      expect(status.emailVerified).toBe(true);
      expect(status.sessionVerified).toBe(true);
    });

    it('should retrieve account keys', async () => {
      client = await Client.login(server.publicUrl, email, password, {
        ...testOptions,
        verificationMethod: 'email-2fa',
        keys: true,
      });

      const emailData = await server.mailbox.waitForEmail(email);
      expect(emailData.headers['x-template-name']).toBe('verifyLoginCode');
      const code = emailData.headers['x-signin-verify-code'];
      expect(code).toBeTruthy();

      const verifyRes = await client.verifyShortCodeEmail(code);
      expect(verifyRes).toBeTruthy();

      const keys = await client.keys();
      expect(keys.kA).toBeTruthy();
      expect(keys.kB).toBeTruthy();
      expect(keys.wrapKb).toBeTruthy();
    });

    it('should resend authentication code', async () => {
      await Client.login(server.publicUrl, email, password, {
        ...testOptions,
        verificationMethod: 'email-2fa',
        keys: true,
      });

      let emailData = await server.mailbox.waitForEmail(email);
      const originalMessageId = emailData['messageId'];
      const originalCode = emailData.headers['x-verify-short-code'];

      expect(emailData.headers['x-template-name']).toBe('verifyLoginCode');

      await client.resendVerifyShortCodeEmail();

      emailData = await server.mailbox.waitForEmail(email);
      expect(emailData.headers['x-template-name']).toBe('verifyLoginCode');

      expect(originalMessageId).not.toBe(emailData['messageId']);
      expect(originalCode).toBe(emailData.headers['x-verify-short-code']);
    });
  }
);
