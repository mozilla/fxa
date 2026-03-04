/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createTestServer, TestServerInstance } from '../support/helpers/test-server';

const Client = require('../client')();

function delay(seconds: number) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

async function resetPassword(client: any, otpCode: string, newPassword: string, options?: any) {
  const result = await client.verifyPasswordForgotOtp(otpCode);
  await client.verifyPasswordResetCode(result.code);
  return client.resetPassword(newPassword, {}, options);
}

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
  '#integration$tag - remote securityEvents',
  ({ version, tag }) => {
    const testOptions = { version };

    it('returns securityEvents on creating and login into an account', async () => {
      const email = server.uniqueEmail();
      const password = 'abcdef';

      const client = await Client.createAndVerify(
        server.publicUrl,
        email,
        password,
        server.mailbox,
        testOptions
      );

      // Login creates an unverified session
      await client.login();

      // Verify the login session to be able to call securityEvents endpoint
      const code = await server.mailbox.waitForCode(email);
      await client.verifyEmail(code);

      await delay(1);
      const events = await client.securityEvents();

      expect(events.length).toBe(2);
      expect(events[0].name).toBe('account.login');
      expect(events[0].createdAt).toBeLessThan(new Date().getTime());

      expect(events[1].name).toBe('account.create');
      expect(events[1].createdAt).toBeLessThan(new Date().getTime());
      expect(events[1].verified).toBe(true);
    });

    it('returns security events after account reset w/o keys, with sessionToken', async () => {
      const email = server.uniqueEmail();
      const password = 'oldPassword';
      const newPassword = 'newPassword';

      const client = await Client.createAndVerify(
        server.publicUrl,
        email,
        password,
        server.mailbox,
        testOptions
      );

      await client.forgotPassword();
      const code = await server.mailbox.waitForCode(email);

      await expect(client.resetPassword(newPassword)).rejects.toBeDefined();
      const response = await resetPassword(client, code, newPassword);

      expect(response.sessionToken).toBeTruthy();
      expect(response.keyFetchToken).toBeFalsy();
      expect(response.emailVerified).toBe(true);
      expect(response.sessionVerified).toBe(true);

      await delay(1);
      const events = await client.securityEvents();

      const resetEvent = events.find((e: any) => e.name === 'account.reset');
      const createEvent = events.find((e: any) => e.name === 'account.create');

      expect(resetEvent).toBeTruthy();
      expect(resetEvent.createdAt).toBeLessThan(new Date().getTime());
      expect(resetEvent.verified).toBe(true);

      expect(createEvent).toBeTruthy();
      expect(createEvent.createdAt).toBeLessThan(new Date().getTime());
      expect(createEvent.verified).toBe(true);
    });
  }
);
