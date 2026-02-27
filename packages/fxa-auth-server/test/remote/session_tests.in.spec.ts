/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createTestServer, TestServerInstance } from '../support/helpers/test-server';

const Client = require('../client')();

let server: TestServerInstance;

beforeAll(async () => {
  server = await createTestServer({
    configOverrides: {
      signinConfirmation: {
        skipForNewAccounts: { enabled: false },
      },
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
  '#integration$tag - remote session',
  ({ version, tag }) => {
    const testOptions = { version };

    describe('destroy', () => {
      it('deletes a valid session', async () => {
        const email = server.uniqueEmail();
        const password = 'foobar';
        const client = await Client.createAndVerify(
          server.publicUrl, email, password, server.mailbox, testOptions
        );

        await client.sessionStatus();
        const sessionToken = client.sessionToken;
        await client.destroySession();
        expect(client.sessionToken).toBeNull();

        client.sessionToken = sessionToken;
        try {
          await client.sessionStatus();
          throw new Error('got status with destroyed session');
        } catch (err: any) {
          expect(err.errno).toBe(110);
        }
      });

      it('deletes a different custom token', async () => {
        const email = server.uniqueEmail();
        const password = 'foobar';
        const client = await Client.create(server.publicUrl, email, password, testOptions);

        const sessionTokenCreate = client.sessionToken;
        const sessions = await client.api.sessions(sessionTokenCreate);
        const tokenId = sessions[0].id;

        const c = await client.login();
        const sessionTokenLogin = c.sessionToken;

        const status = await client.api.sessionStatus(sessionTokenCreate);
        expect(status.uid).toBeTruthy();

        await client.api.sessionDestroy(sessionTokenLogin, {
          customSessionToken: tokenId,
        });

        try {
          await client.api.sessionStatus(sessionTokenCreate);
          throw new Error('got status with destroyed session');
        } catch (err: any) {
          expect(err.code).toBe(401);
          expect(err.errno).toBe(110);
        }
      });

      it('fails with a bad custom token', async () => {
        const email = server.uniqueEmail();
        const password = 'foobar';
        const client = await Client.create(server.publicUrl, email, password, testOptions);

        const sessionTokenCreate = client.sessionToken;
        const c = await client.login();
        const sessionTokenLogin = c.sessionToken;

        await client.api.sessionStatus(sessionTokenCreate);

        // In the original Mocha test, sessionDestroy may throw and the
        // rejection propagates to the final .then(null, errHandler).
        // With async/await we must catch errors from either call.
        try {
          await client.api.sessionDestroy(sessionTokenLogin, {
            customSessionToken:
              'eff779f59ab974f800625264145306ce53185bb22ee01fe80280964ff2766504',
          });
          await client.api.sessionStatus(sessionTokenCreate);
          throw new Error('got status with destroyed session');
        } catch (err: any) {
          expect(err.code).toBe(401);
          expect(err.errno).toBe(110);
          expect(err.error).toBe('Unauthorized');
          expect(err.message).toBe('The authentication token could not be found');
        }
      });
    });

    describe('duplicate', () => {
      it('duplicates a valid session into a new, independent session', async () => {
        const email = server.uniqueEmail();
        const password = 'foobar';
        const client1 = await Client.createAndVerify(
          server.publicUrl, email, password, server.mailbox, testOptions
        );

        const client2 = await client1.duplicate();
        expect(client1.sessionToken).not.toBe(client2.sessionToken);

        await client1.api.sessionDestroy(client1.sessionToken);

        try {
          await client1.sessionStatus();
          throw new Error('client1 session should have been destroyed');
        } catch (err: any) {
          expect(err.code).toBe(401);
          expect(err.errno).toBe(110);
        }

        const status = await client2.sessionStatus();
        expect(status).toBeTruthy();

        await client2.api.sessionDestroy(client2.sessionToken);

        try {
          await client2.sessionStatus();
          throw new Error('client2 session should have been destroyed');
        } catch (err: any) {
          expect(err.code).toBe(401);
          expect(err.errno).toBe(110);
        }
      });

      it('creates independent verification state for the new token', async () => {
        const email = server.uniqueEmail();
        const password = 'foobar';
        const client1 = await Client.create(server.publicUrl, email, password, testOptions);
        const client2 = await client1.duplicate();

        expect(client1.verified).toBeFalsy();
        expect(client2.verified).toBeFalsy();

        const code = await server.mailbox.waitForCode(email);
        await client1.verifyEmail(code);

        let status = await client1.sessionStatus();
        expect(status.state).toBe('verified');

        status = await client2.sessionStatus();
        expect(status.state).toBe('unverified');

        const client3 = await client2.duplicate();
        await client2.requestVerifyEmail();
        const code2 = await server.mailbox.waitForCode(email);
        await client2.verifyEmail(code2);

        status = await client2.sessionStatus();
        expect(status.state).toBe('verified');

        status = await client3.sessionStatus();
        expect(status.state).toBeTruthy();
      });
    });

    describe('reauth', () => {
      it('allocates a new keyFetchToken', async () => {
        const email = server.uniqueEmail();
        const password = 'foobar';
        const client = await Client.createAndVerify(
          server.publicUrl, email, password, server.mailbox,
          { ...testOptions, keys: true }
        );

        const keys = await client.keys();
        const kA = keys.kA;
        const kB = keys.kB;
        expect(client.getState().keyFetchToken).toBeNull();

        await client.reauth({ keys: true });
        expect(client.getState().keyFetchToken).toBeTruthy();

        const keys2 = await client.keys();
        expect(keys2.kA).toBe(kA);
        expect(keys2.kB).toBe(kB);
        expect(client.getState().keyFetchToken).toBeNull();
      });

      it('rejects incorrect passwords', async () => {
        const email = server.uniqueEmail();
        const password = 'foobar';
        const client = await Client.createAndVerify(
          server.publicUrl, email, password, server.mailbox, testOptions
        );

        await client.setupCredentials(email, 'fiibar');
        if (testOptions.version === 'V2') {
          await client.setupCredentialsV2(email, 'fiibar');
        }

        try {
          await client.reauth();
          throw new Error('password should have been rejected');
        } catch (err: any) {
          expect(err.code).toBe(400);
          expect(err.errno).toBe(103);
        }
      });

      it('has sane account-verification behaviour', async () => {
        const email = server.uniqueEmail();
        const password = 'foobar';
        const client = await Client.create(server.publicUrl, email, password, testOptions);
        expect(client.verified).toBeFalsy();

        // Clear the verification email, without verifying.
        await server.mailbox.waitForCode(email);

        await client.reauth();
        let status = await client.sessionStatus();
        expect(status.state).toBe('unverified');

        // The reauth should have triggered a second email.
        const code = await server.mailbox.waitForCode(email);
        await client.verifyEmail(code);

        status = await client.sessionStatus();
        expect(status.state).toBe('verified');
      });

      it('has sane session-verification behaviour', async () => {
        const email = server.uniqueEmail();
        const password = 'foobar';
        await Client.createAndVerify(
          server.publicUrl, email, password, server.mailbox,
          { ...testOptions, keys: false }
        );

        const client = await Client.login(server.publicUrl, email, password, {
          keys: false,
          ...testOptions,
        });

        // Clears inbox of new signin email
        await server.mailbox.waitForEmail(email);

        let status = await client.sessionStatus();
        expect(status.state).toBe('unverified');

        let emailStatus = await client.emailStatus();
        expect(emailStatus.verified).toBe(true);

        await client.reauth({ keys: true });

        status = await client.sessionStatus();
        expect(status.state).toBe('unverified');

        emailStatus = await client.emailStatus();
        expect(emailStatus.verified).toBe(false);

        // The reauth should have triggered a verification email.
        const code = await server.mailbox.waitForCode(email);
        await client.verifyEmail(code);

        status = await client.sessionStatus();
        expect(status.state).toBe('verified');

        emailStatus = await client.emailStatus();
        expect(emailStatus.verified).toBe(true);
      });

      it('does not send notification emails on verified sessions', async () => {
        const email = server.uniqueEmail();
        const password = 'foobar';
        const client = await Client.createAndVerify(
          server.publicUrl, email, password, server.mailbox,
          { ...testOptions, keys: true }
        );

        await client.reauth({ keys: true });

        // Send some other type of email, and assert that it's the one we get back.
        // If the above sent a "new login" notification, we would get that instead.
        await client.forgotPassword();
        const msg = await server.mailbox.waitForEmail(email);
        expect(msg.headers['x-password-forgot-otp']).toBeTruthy();
      });
    });

    describe('status', () => {
      it('succeeds with valid token', async () => {
        const email = server.uniqueEmail();
        const password = 'testx';
        const c = await Client.createAndVerify(
          server.publicUrl, email, password, server.mailbox, testOptions
        );
        const uid = c.uid;
        await c.login();
        const x = await c.api.sessionStatus(c.sessionToken);

        expect(x).toEqual({
          state: 'unverified',
          uid,
          details: {
            accountEmailVerified: true,
            sessionVerificationMeetsMinimumAAL: true,
            sessionVerificationMethod: null,
            sessionVerified: false,
            verified: false,
          },
        });
      });

      it('errors with invalid token', async () => {
        const client = new Client(server.publicUrl, testOptions);
        try {
          await client.api.sessionStatus(
            '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF'
          );
          throw new Error('should have failed');
        } catch (err: any) {
          expect(err.errno).toBe(110);
        }
      });
    });
  }
);
