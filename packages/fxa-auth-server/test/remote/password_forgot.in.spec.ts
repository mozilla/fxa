/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createTestServer, TestServerInstance } from '../support/helpers/test-server';
import url from 'url';
import crypto from 'crypto';

const Client = require('../client')();
const base64url = require('base64url');
const mocks = require('../mocks');

let server: TestServerInstance;

beforeAll(async () => {
  server = await createTestServer({
    configOverrides: {
      securityHistory: { ipProfiling: { allowedRecency: 0 } },
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

describe.each(testVersions)(
  '#integration$tag - remote password forgot',
  ({ version, tag }) => {
    const testOptions = { version };

    async function resetPassword(
      client: any,
      otpCode: string,
      newPassword: string,
      headers?: any,
      options?: any
    ) {
      const result = await client.verifyPasswordForgotOtp(otpCode, options);
      await client.verifyPasswordResetCode(result.code, headers, options);
      await client.resetPassword(newPassword, {}, options);
    }

    async function upgradeCredentials(email: string, newPassword: string) {
      if (testOptions.version === 'V2') {
        await Client.upgradeCredentials(server.publicUrl, email, newPassword, {
          version: '',
          key: true,
        });
      }
    }

    it('forgot password', async () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';
      const newPassword = 'ez';
      const options = {
        ...testOptions,
        keys: true,
        metricsContext: mocks.generateMetricsContext(),
      };

      let client = await Client.createAndVerify(
        server.publicUrl,
        email,
        password,
        server.mailbox,
        options
      );
      const keys = await client.keys();

      await client.forgotPassword();

      const emailData = await server.mailbox.waitForEmail(email);
      expect(emailData.headers['x-template-name']).toBe('passwordForgotOtp');
      const code = emailData.headers['x-password-forgot-otp'];

      await expect(client.resetPassword(newPassword)).rejects.toBeDefined();
      await resetPassword(client, code, newPassword, undefined, options);

      const resetEmailData = await server.mailbox.waitForEmail(email);
      const link = resetEmailData.headers['x-link'];
      const query = url.parse(link, true).query;
      expect(query.email).toBeTruthy();
      expect(resetEmailData.headers['x-template-name']).toBe('passwordReset');

      await upgradeCredentials(email, newPassword);

      client = await Client.login(server.publicUrl, email, newPassword, {
        ...testOptions,
        keys: true,
      });
      const newKeys = await client.keys();
      expect(typeof newKeys.wrapKb).toBe('string');
      expect(newKeys.wrapKb).not.toBe(keys.wrapKb);
      expect(newKeys.kA).toBe(keys.kA);
      expect(typeof client.kB).toBe('string');
      expect(client.kB.length).toBe(64);
    });

    it('forgot password limits verify attempts', async () => {
      const email = server.uniqueEmail();
      const password = 'hothamburger';

      await Client.createAndVerify(
        server.publicUrl,
        email,
        password,
        server.mailbox,
        testOptions
      );

      const client = new Client(server.publicUrl, testOptions);
      client.email = email;

      await client.forgotPassword();
      const code = await server.mailbox.waitForCode(email);

      try {
        await client.verifyPasswordForgotOtp('00000000');
        fail('verify otp with bad code should fail');
      } catch (err: any) {
        expect(err.message).toBe('Invalid confirmation code');
      }

      try {
        await client.verifyPasswordForgotOtp('11111111');
        fail('verify otp with bad code should fail');
      } catch (err: any) {
        expect(err.message).toBe('Invalid confirmation code');
      }

      await resetPassword(client, code, 'newpassword');
    });

    it('recovery email contains OTP code', async () => {
      const email = server.uniqueEmail();
      const password = 'something';
      const options = { ...testOptions, service: 'sync' };

      const client = await Client.createAndVerify(
        server.publicUrl,
        email,
        password,
        server.mailbox,
        options
      );

      await client.forgotPassword();
      const emailData = await server.mailbox.waitForEmail(email);
      expect(emailData.headers['x-template-name']).toBe('passwordForgotOtp');
      const otpCode = emailData.headers['x-password-forgot-otp'];
      expect(otpCode).toBeTruthy();
      expect(otpCode).toMatch(/^\d{8}$/);
    });

    it.skip('password forgot status with valid token', async () => {});
    it.skip('password forgot status with invalid token', () => {});

    it('OTP flow rejects unverified accounts', async () => {
      const email = server.uniqueEmail();
      const password = 'something';

      const client = await Client.create(
        server.publicUrl,
        email,
        password,
        testOptions
      );

      const status = await client.emailStatus();
      expect(status.verified).toBe(false);

      await server.mailbox.waitForCode(email);

      try {
        await client.forgotPassword();
        fail('forgotPassword should fail for unverified account');
      } catch (err: any) {
        expect(err.errno).toBe(102);
      }
    });

    it('forgot password with service query parameter', async () => {
      const email = server.uniqueEmail();
      const options = { ...testOptions, serviceQuery: 'sync' };

      const client = await Client.createAndVerify(
        server.publicUrl,
        email,
        'wibble',
        server.mailbox,
        options
      );

      await client.forgotPassword();
      const emailData = await server.mailbox.waitForEmail(email);
      expect(emailData.headers['x-template-name']).toBe('passwordForgotOtp');
      expect(emailData.headers['x-password-forgot-otp']).toBeTruthy();
    });

    it('forgot password, then get device list', async () => {
      const email = server.uniqueEmail();
      const newPassword = 'foo';

      let client = await Client.createAndVerify(
        server.publicUrl,
        email,
        'bar',
        server.mailbox,
        testOptions
      );

      await client.updateDevice({
        name: 'baz',
        type: 'mobile',
        pushCallback: 'https://updates.push.services.mozilla.com/qux',
        pushPublicKey: mocks.MOCK_PUSH_KEY,
        pushAuthKey: base64url(crypto.randomBytes(16)),
      });

      let devices = await client.devices();
      expect(devices.length).toBe(1);

      await client.forgotPassword();
      const code = await server.mailbox.waitForCode(email);
      await resetPassword(client, code, newPassword);

      await upgradeCredentials(email, newPassword);

      client = await Client.login(
        server.publicUrl,
        email,
        newPassword,
        testOptions
      );
      devices = await client.devices();
      expect(devices.length).toBe(0);
    });
  }
);
