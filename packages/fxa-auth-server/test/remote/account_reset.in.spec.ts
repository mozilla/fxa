/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createTestServer, TestServerInstance } from '../support/helpers/test-server';
import { AuthServerError } from '../support/helpers/test-utils';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Client = require('../client')();

let server: TestServerInstance;

beforeAll(async () => {
  server = await createTestServer({
    configOverrides: {
      signinConfirmation: { skipForNewAccounts: { enabled: true } },
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

async function resetPassword(
  client: any,
  otpCode: string,
  newPassword: string,
  options?: any
) {
  const result = await client.verifyPasswordForgotOtp(otpCode);
  await client.verifyPasswordResetCode(result.code);
  return await client.resetPassword(newPassword, {}, options);
}

describe.each(testVersions)(
  '#integration$tag - remote account reset',
  ({ version, tag }) => {
    const testOptions = { version };

    it('account reset w/o sessionToken', async () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';
      const newPassword = 'ez';

      let client = await Client.createAndVerify(
        server.publicUrl,
        email,
        password,
        server.mailbox,
        { ...testOptions, keys: true }
      );
      const keys1 = await client.keys();

      await client.forgotPassword();
      const code = await server.mailbox.waitForCode(email);
      await expect(client.resetPassword(newPassword)).rejects.toBeDefined();
      const response = await resetPassword(client, code, newPassword, {
        sessionToken: false,
      });
      expect(response.sessionToken).toBeFalsy();
      expect(response.keyFetchToken).toBeFalsy();
      expect(response.verified).toBeFalsy();

      const emailData = await server.mailbox.waitForEmail(email);
      const link = emailData.headers['x-link'];
      const query = Object.fromEntries(new URL(link).searchParams);
      expect(query.email).toBeTruthy();

      if (testOptions.version === 'V2') {
        const newClient = await Client.login(
          server.publicUrl,
          email,
          newPassword,
          { version: '', keys: true }
        );
        await newClient.upgradeCredentials(newPassword);
      }

      client = await Client.login(server.publicUrl, email, newPassword, {
        ...testOptions,
        keys: true,
      });
      const keys2 = await client.keys();
      expect(keys1.wrapKb).not.toBe(keys2.wrapKb);
      expect(keys1.kA).toBe(keys2.kA);
      expect(typeof client.getState().kB).toBe('string');
      expect(client.getState().kB.length).toBe(64);
    });

    it('account reset with keys', async () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';
      const newPassword = 'ez';

      let client = await Client.createAndVerify(
        server.publicUrl,
        email,
        password,
        server.mailbox,
        { ...testOptions, keys: true }
      );
      const keys1 = await client.keys();

      await client.forgotPassword();
      const code = await server.mailbox.waitForCode(email);
      await expect(client.resetPassword(newPassword)).rejects.toBeDefined();
      const response = await resetPassword(client, code, newPassword, {
        keys: true,
      });
      expect(response.sessionToken).toBeTruthy();
      expect(response.keyFetchToken).toBeTruthy();
      expect(response.emailVerified).toBe(true);
      expect(response.sessionVerified).toBe(true);

      const emailData = await server.mailbox.waitForEmail(email);
      const link = emailData.headers['x-link'];
      const query = Object.fromEntries(new URL(link).searchParams);
      expect(query.email).toBeTruthy();

      if (testOptions.version === 'V2') {
        const newClient = await Client.login(
          server.publicUrl,
          email,
          newPassword,
          { version: '', keys: true }
        );
        const status = await newClient.getCredentialsStatus(email);
        expect(status.upgradeNeeded).toBeTruthy();
        await newClient.upgradeCredentials(newPassword);
      }

      client = await Client.login(server.publicUrl, email, newPassword, {
        ...testOptions,
        keys: true,
      });
      const keys2 = await client.keys();
      expect(keys1.wrapKb).not.toBe(keys2.wrapKb);
      expect(keys1.kA).toBe(keys2.kA);
      expect(typeof client.getState().kB).toBe('string');
      expect(client.getState().kB.length).toBe(64);
    });

    it('account reset w/o keys, with sessionToken', async () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';
      const newPassword = 'ez';

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
    });

    it('account reset deletes tokens', async () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';
      const newPassword = 'ez';
      const options = { ...testOptions, keys: true };

      const client = await Client.createAndVerify(
        server.publicUrl,
        email,
        password,
        server.mailbox,
        options
      );

      await client.forgotPassword();
      const originalCode = await server.mailbox.waitForCode(email);

      await client.forgotPassword();
      const code = await server.mailbox.waitForCode(email);
      await expect(client.resetPassword(newPassword)).rejects.toBeDefined();
      await resetPassword(client, code, newPassword, undefined);

      const emailData = await server.mailbox.waitForEmail(email);
      const templateName = emailData.headers['x-template-name'];
      expect(templateName).toBe('passwordReset');

      try {
        await resetPassword(client, originalCode, newPassword, undefined);
        fail('Should not have succeeded password reset');
      } catch (err: unknown) {
        const error = err as AuthServerError;
        expect(error.code).toBe(400);
        expect(error.errno).toBe(105);
      }
    });

    it('account reset updates keysChangedAt', async () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';
      const newPassword = 'ez';

      const client = await Client.createAndVerify(
        server.publicUrl,
        email,
        password,
        server.mailbox,
        { ...testOptions, keys: true }
      );

      const profileBefore = await client.accountProfile();

      await client.forgotPassword();
      const code = await server.mailbox.waitForCode(email);
      await resetPassword(client, code, newPassword);
      await server.mailbox.waitForEmail(email);

      const profileAfter = await client.accountProfile();

      expect(profileBefore['keysChangedAt']).toBeLessThan(
        profileAfter['keysChangedAt']
      );
    });
  }
);
