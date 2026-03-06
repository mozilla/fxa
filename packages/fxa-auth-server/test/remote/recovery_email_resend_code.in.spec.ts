/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createTestServer, TestServerInstance } from '../support/helpers/test-server';

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
  '#integration$tag - remote recovery email resend code',
  ({ version, tag }) => {
    const testOptions = { version };

    it('sign-in verification resend email verify code', async () => {
      const email = server.uniqueEmail();
      const password = 'something';
      const config = server.config as any;
      const options = {
        ...testOptions,
        redirectTo: `https://sync.${config.smtp.redirectDomain}`,
        service: 'sync',
        resume: 'resumeToken',
        keys: true,
      };

      let client = await Client.create(server.publicUrl, email, password, options);

      // Clear first account create email and login again
      await server.mailbox.waitForEmail(email);
      client = await Client.login(server.publicUrl, email, password, options);

      const verifyEmailCode = await server.mailbox.waitForCode(email);
      await client.requestVerifyEmail();

      const code = await server.mailbox.waitForCode(email);
      expect(code).toBe(verifyEmailCode);

      await client.verifyEmail(code);

      const status = await client.emailStatus();
      expect(status.verified).toBe(true);
      expect(status.emailVerified).toBe(true);
      expect(status.sessionVerified).toBe(true);
    });

    it('sign-in verification resend login verify code', async () => {
      const email = server.uniqueEmail();
      const password = 'something';
      const config = server.config as any;
      const options = {
        ...testOptions,
        redirectTo: `https://sync.${config.smtp.redirectDomain}`,
        service: 'sync',
        resume: 'resumeToken',
        keys: true,
      };

      await Client.createAndVerify(
        server.publicUrl,
        email,
        password,
        server.mailbox,
        options
      );

      // Attempt to login from new location
      let client2 = await Client.login(server.publicUrl, email, password, options);

      // Clears inbox of new signin email
      await server.mailbox.waitForEmail(email);

      client2 = await client2.login(options);

      const verifyEmailCode = await server.mailbox.waitForCode(email);
      await client2.requestVerifyEmail();

      const code = await server.mailbox.waitForCode(email);
      expect(code).toBe(verifyEmailCode);

      await client2.verifyEmail(code);

      const status = await client2.emailStatus();
      expect(status.verified).toBe(true);
      expect(status.emailVerified).toBe(true);
      expect(status.sessionVerified).toBe(true);
    });

    it('fail when resending verification email when not owned by account', async () => {
      const email = server.uniqueEmail();
      const secondEmail = server.uniqueEmail();
      const password = 'something';
      const options = { ...testOptions, keys: true };

      const [client] = await Promise.all([
        Client.createAndVerify(
          server.publicUrl,
          email,
          password,
          server.mailbox,
          options
        ),
        Client.create(server.publicUrl, secondEmail, password, options),
      ]);

      client.options = { ...client.options, email: secondEmail };

      try {
        await client.requestVerifyEmail();
        fail('Should not have succeeded in sending verification code');
      } catch (err: any) {
        expect(err.code).toBe(400);
        expect(err.errno).toBe(150);
      }
    });

    it('should be able to upgrade unverified session to verified session', async () => {
      const email = server.uniqueEmail();
      const password = 'something';
      const options = { ...testOptions, keys: false };

      let client = await Client.createAndVerify(
        server.publicUrl,
        email,
        password,
        server.mailbox,
        options
      );

      // Create an unverified session
      client = await client.login();

      // Clear the verify account email
      await server.mailbox.waitForCode(email);

      let result = await client.sessionStatus();
      expect(result.state).toBe('unverified');

      // Set the type of code to receive
      client.options.type = 'upgradeSession';
      await client.requestVerifyEmail();

      const emailData = await server.mailbox.waitForEmail(email);
      expect(emailData.headers['x-template-name']).toBe('verifyPrimary');
      const code = emailData.headers['x-verify-code'];
      expect(code).toBeTruthy();

      await client.verifyEmail(code);

      result = await client.sessionStatus();
      expect(result.state).toBe('verified');
    });
  }
);
