/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createTestServer, TestServerInstance } from '../support/helpers/test-server';
import crypto from 'crypto';

const Client = require('../client')();
const mocks = require('../mocks');

let server: TestServerInstance;

beforeAll(async () => {
  server = await createTestServer({
    configOverrides: {
      redis: { sessionTokens: { enabled: false } },
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
  '#integration$tag - remote account signin verification',
  ({ version, tag }) => {
    const testOptions = { version };

    it('account signin with keys does set challenge', async () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';

      const client = await Client.createAndVerify(
        server.publicUrl,
        email,
        password,
        server.mailbox,
        testOptions
      );
      expect(client.authAt).toBeTruthy();

      const status = await client.emailStatus();
      expect(status.emailVerified).toBe(true);

      const response = await client.login({ keys: true });
      expect(response.verificationMethod).toBe('email');
      expect(response.verificationReason).toBe('login');
      expect(response.sessionVerified).toBe(false);
    });

    it('account can verify new sign-in from email', async () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';
      const loginOpts = {
        keys: true,
        metricsContext: mocks.generateMetricsContext(),
      };

      const client = await Client.createAndVerify(
        server.publicUrl,
        email,
        password,
        server.mailbox,
        testOptions
      );
      expect(client.authAt).toBeTruthy();

      let status = await client.emailStatus();
      expect(status.verified).toBe(true);

      const response = await client.login(loginOpts);
      expect(response.verificationMethod).toBe('email');
      expect(response.verificationReason).toBe('login');
      expect(response.sessionVerified).toBe(false);

      const emailData = await server.mailbox.waitForEmail(email);
      const singleEmail = Array.isArray(emailData) ? emailData[0] : emailData;
      const uid = singleEmail.headers['x-uid'];
      const code = singleEmail.headers['x-verify-code'];
      expect(singleEmail.subject).toBe('Confirm sign-in');
      expect(uid).toBeTruthy();
      expect(code).toBeTruthy();
      expect(singleEmail.headers['x-flow-begin-time']).toBe(
        String(loginOpts.metricsContext.flowBeginTime)
      );
      expect(singleEmail.headers['x-flow-id']).toBe(
        loginOpts.metricsContext.flowId
      );

      status = await client.emailStatus();
      expect(status.verified).toBe(false);

      await client.verifyEmail(code);

      status = await client.emailStatus();
      expect(status.emailVerified).toBe(true);
      expect(status.verificationMethod).toBeFalsy();
      expect(status.verificationReason).toBeFalsy();
    });

    it('Account verification links still work after session verification', async () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';

      const client = await Client.create(
        server.publicUrl,
        email,
        password,
        testOptions
      );

      let emailData = await server.mailbox.waitForEmail(email);
      let singleEmail = Array.isArray(emailData) ? emailData[0] : emailData;
      expect(singleEmail.subject).toBe('Finish creating your account');
      const emailCode = singleEmail.headers['x-verify-code'];
      expect(emailCode).toBeTruthy();

      await client.verifyEmail(emailCode);

      await client.login({ keys: true });

      emailData = await server.mailbox.waitForEmail(email);
      singleEmail = Array.isArray(emailData) ? emailData[0] : emailData;
      const tokenCode = singleEmail.headers['x-verify-code'];
      expect(singleEmail.subject).toBe('Confirm sign-in');
      expect(singleEmail.headers['x-uid']).toBeTruthy();
      expect(tokenCode).toBeTruthy();
      expect(tokenCode).not.toBe(emailCode);

      const status = await client.emailStatus();
      expect(status.verified).toBe(false);
      expect(status.sessionVerified).toBe(false);

      // Attempt to verify account reusing original email code
      await client.verifyEmail(emailCode);
    });

    it('sign-in verification email link', async () => {
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

      const client = await Client.createAndVerify(
        server.publicUrl,
        email,
        password,
        server.mailbox,
        options
      );

      await client.login(options);

      const emailData = await server.mailbox.waitForEmail(email);
      const singleEmail = Array.isArray(emailData) ? emailData[0] : emailData;
      const link = singleEmail.headers['x-link'];
      const query = new URL(link).searchParams;
      expect(query.get('uid')).toBeTruthy();
      expect(query.get('code')).toBeTruthy();
      expect(query.get('service')).toBe(options.service);
      expect(query.get('resume')).toBe(options.resume);
      expect(singleEmail.subject).toBe('Confirm sign-in');
    });

    it('sign-in verification from different client', async () => {
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

      const client = await Client.createAndVerify(
        server.publicUrl,
        email,
        password,
        server.mailbox,
        options
      );

      await client.login(options);

      let emailData = await server.mailbox.waitForEmail(email);
      let singleEmail = Array.isArray(emailData) ? emailData[0] : emailData;
      const link = singleEmail.headers['x-link'];
      const query = new URL(link).searchParams;
      expect(query.get('uid')).toBeTruthy();
      expect(query.get('code')).toBeTruthy();
      expect(query.get('service')).toBe(options.service);
      expect(query.get('resume')).toBe(options.resume);
      expect(singleEmail.subject).toBe('Confirm sign-in');

      // Attempt to login from new location
      const client2 = await Client.login(
        server.publicUrl,
        email,
        password,
        options
      );

      // Clears inbox of new signin email
      await server.mailbox.waitForEmail(email);

      await client2.login(options);

      const code = await server.mailbox.waitForCode(email);

      // Verify account from client2
      await client2.verifyEmail(code, options);

      let status = await client2.emailStatus();
      expect(status.verified).toBe(true);
      expect(status.emailVerified).toBe(true);
      expect(status.sessionVerified).toBe(true);

      status = await client.emailStatus();
      expect(status.verified).toBe(false);
      expect(status.emailVerified).toBe(true);
      expect(status.sessionVerified).toBe(false);
    });

    it('account keys, return keys on verified account', async () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';

      const client = await Client.create(server.publicUrl, email, password, {
        ...testOptions,
        keys: true,
      });

      let status = await client.emailStatus();
      expect(status.verified).toBe(false);
      expect(status.emailVerified).toBe(false);
      expect(status.sessionVerified).toBe(false);

      const emailData = await server.mailbox.waitForEmail(email);
      const singleEmail = Array.isArray(emailData) ? emailData[0] : emailData;
      expect(singleEmail.subject).toBe('Finish creating your account');
      const tokenCode = singleEmail.headers['x-verify-code'];
      expect(tokenCode).toBeTruthy();

      // Unverified accounts can not retrieve keys
      try {
        await client.keys();
        fail('should have thrown');
      } catch (err: any) {
        expect(err.errno).toBe(104);
        expect(err.code).toBe(400);
        expect(err.message).toBe('Unconfirmed account');
      }

      // Verify the account
      await client.verifyEmail(tokenCode);

      status = await client.emailStatus();
      expect(status.verified).toBe(true);
      expect(status.emailVerified).toBe(true);
      expect(status.sessionVerified).toBe(true);

      // Once verified, keys can be returned
      const keys = await client.keys();
      expect(keys.kA).toBeTruthy();
      expect(keys.kB).toBeTruthy();
      expect(keys.wrapKb).toBeTruthy();
    });

    it('account keys, return keys on verified login', async () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';

      let client = await Client.createAndVerify(
        server.publicUrl,
        email,
        password,
        server.mailbox,
        { ...testOptions, keys: true }
      );

      // Trigger confirm sign-in
      client = await client.login({ keys: true });

      const emailData = await server.mailbox.waitForEmail(email);
      const singleEmail = Array.isArray(emailData) ? emailData[0] : emailData;
      expect(singleEmail.subject).toBe('Confirm sign-in');
      const tokenCode = singleEmail.headers['x-verify-code'];
      expect(tokenCode).toBeTruthy();

      // Because of unverified sign-in, requests for keys will fail
      try {
        await client.keys();
        fail('should have thrown');
      } catch (err: any) {
        expect(err.errno).toBe(104);
        expect(err.code).toBe(400);
        expect(err.message).toBe('Unconfirmed account');
      }

      let status = await client.emailStatus();
      expect(status.verified).toBe(false);
      expect(status.emailVerified).toBe(true);
      expect(status.sessionVerified).toBe(false);

      // Verify the sign-in
      await client.verifyEmail(tokenCode);

      status = await client.emailStatus();
      expect(status.verified).toBe(true);
      expect(status.emailVerified).toBe(true);
      expect(status.sessionVerified).toBe(true);

      // Can retrieve keys now that account tokens verified
      const keys = await client.keys();
      expect(keys.kA).toBeTruthy();
      expect(keys.kB).toBeTruthy();
      expect(keys.wrapKb).toBeTruthy();
    });

    it('unverified account is verified on sign-in confirmation', async () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';

      let client = await Client.create(server.publicUrl, email, password, {
        ...testOptions,
        keys: true,
      });

      let emailData = await server.mailbox.waitForEmail(email);
      let singleEmail = Array.isArray(emailData) ? emailData[0] : emailData;
      expect(singleEmail.headers['x-template-name']).toBe('verify');
      const tokenCode = singleEmail.headers['x-verify-code'];
      expect(tokenCode).toBeTruthy();

      client = await client.login({ keys: true });

      emailData = await server.mailbox.waitForEmail(email);
      singleEmail = Array.isArray(emailData) ? emailData[0] : emailData;
      expect(singleEmail.headers['x-template-name']).toBe('verify');
      const signinToken = singleEmail.headers['x-verify-code'];
      expect(tokenCode).not.toBe(signinToken);

      await client.verifyEmail(signinToken);

      const status = await client.emailStatus();
      expect(status.verified).toBe(true);
      expect(status.emailVerified).toBe(true);
      expect(status.sessionVerified).toBe(true);

      // Can retrieve keys now that account tokens verified
      const keys = await client.keys();
      expect(keys.kA).toBeTruthy();
      expect(keys.kB).toBeTruthy();
      expect(keys.wrapKb).toBeTruthy();
    });
  }
);
