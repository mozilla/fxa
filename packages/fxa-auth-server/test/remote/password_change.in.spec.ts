/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createTestServer, getSharedTestServer, TestServerInstance } from '../support/helpers/test-server';
import url from 'url';

const Client = require('../client')();
const tokens = require('../../lib/tokens')({ trace: function () {} });
const jwt = require('jsonwebtoken');
const uuid = require('uuid');

interface AuthServerError extends Error {
  errno: number;
  code: number;
  error: string;
  email?: string;
}

function getSessionTokenId(sessionTokenHex: string) {
  return tokens.SessionToken.fromHex(sessionTokenHex).then((token: any) => {
    return token.id;
  });
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
  '#integration$tag - remote password change',
  ({ version, tag }) => {
    const testOptions = { version };

    it('password change, with unverified session', async () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';
      const newPassword = 'foobar';

      await Client.createAndVerify(
        server.publicUrl,
        email,
        password,
        server.mailbox,
        { ...testOptions, keys: true }
      );

      // Login from different location to create unverified session
      const client = await Client.login(server.publicUrl, email, password, {
        ...testOptions,
        keys: true,
      });

      const status = await client.emailStatus();
      expect(status.verified).toBe(false);
      expect(status.emailVerified).toBe(true);
      expect(status.sessionVerified).toBe(false);

      try {
        await client.changePassword(newPassword, undefined, client.sessionToken);
        fail('should have thrown');
      } catch (err: unknown) {
        const error = err as AuthServerError;
        expect(error.errno).toBe(138);
        expect(error.error).toBe('Bad Request');
        expect(error.message).toBe('Unconfirmed session');
      }
    });

    it('password change, with verified session', async () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';
      const newPassword = 'foobar';

      let client = await Client.createAndVerify(
        server.publicUrl,
        email,
        password,
        server.mailbox,
        { ...testOptions, keys: true }
      );

      const originalSessionToken = client.sessionToken;
      const firstAuthPW = client.authPW.toString('hex');
      const keys = await client.keys();

      const status = await client.emailStatus();
      expect(status.verified).toBe(true);

      const response = await client.changePassword(
        newPassword,
        undefined,
        client.sessionToken
      );
      expect(response.sessionToken).not.toBe(originalSessionToken);
      expect(response.keyFetchToken).toBeTruthy();
      expect(client.authPW.toString('hex')).not.toBe(firstAuthPW);

      const emailData = await server.mailbox.waitForEmail(email);
      expect(emailData.headers['subject']).toBe('Password updated');
      const link = emailData.headers['x-link'];
      const query = url.parse(link, true).query;
      expect(query.email).toBeTruthy();

      const statusAfter = await client.emailStatus();
      expect(statusAfter.verified).toBe(true);

      client = await Client.loginAndVerify(
        server.publicUrl,
        email,
        newPassword,
        server.mailbox,
        { ...testOptions, keys: true }
      );
      const newKeys = await client.keys();
      expect(newKeys.kB).toBe(keys.kB);
      expect(newKeys.kA).toBe(keys.kA);
    });

    it('cannot password change w/o sessionToken', async () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';
      const newPassword = 'foobar';

      const client = await Client.createAndVerify(
        server.publicUrl,
        email,
        password,
        server.mailbox,
        { ...testOptions, keys: true }
      );

      try {
        await client.changePassword(newPassword, undefined, undefined);
        fail('should have thrown');
      } catch (err: unknown) {
        const error = err as AuthServerError;
        expect(error.errno).toBe(110);
        expect(error.error).toBe('Unauthorized');
      }
    });

    it('password change does not update keysChangedAt', async () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';
      const newPassword = 'foobar';

      let client = await Client.createAndVerify(
        server.publicUrl,
        email,
        password,
        server.mailbox,
        testOptions
      );

      const profileBefore = await client.accountProfile();

      await client.changePassword(newPassword, undefined, client.sessionToken);
      await server.mailbox.waitForEmail(email);

      client = await Client.loginAndVerify(
        server.publicUrl,
        email,
        newPassword,
        server.mailbox,
        testOptions
      );

      const profileAfter = await client.accountProfile();
      expect(profileBefore['keysChangedAt']).toBe(profileAfter['keysChangedAt']);
    });

    it('wrong password on change start', async () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';

      const client = await Client.createAndVerify(
        server.publicUrl,
        email,
        password,
        server.mailbox,
        { ...testOptions, keys: true }
      );
      await client.keys();

      client.authPW = Buffer.from(
        '0000000000000000000000000000000000000000000000000000000000000000',
        'hex'
      );

      try {
        await client.changePassword('foobar', undefined, client.sessionToken);
        fail('should have thrown');
      } catch (err: unknown) {
        const error = err as AuthServerError;
        expect(error.errno).toBe(103);
      }
    });

    it("shouldn't change password on account with TOTP without passing sessionToken", async () => {
      const email = server.uniqueEmail();
      const password = 'ok';

      const client = await Client.createAndVerifyAndTOTP(
        server.publicUrl,
        email,
        password,
        server.mailbox,
        { ...testOptions, keys: true }
      );

      try {
        await client.changePassword('foobar', undefined, undefined);
        fail('should have thrown');
      } catch (err: unknown) {
        const error = err as AuthServerError;
        expect(error.errno).toBe(110);
        expect(error.error).toBe('Unauthorized');
      }
    });

    it('should change password on account with TOTP with verified TOTP sessionToken', async () => {
      const email = server.uniqueEmail();
      const password = 'ok';

      const client = await Client.createAndVerifyAndTOTP(
        server.publicUrl,
        email,
        password,
        server.mailbox,
        { ...testOptions, keys: true }
      );

      const firstAuthPW = client.authPW.toString('hex');
      const response1 = await client.changePassword(
        'foobar',
        undefined,
        client.sessionToken
      );

      const secondAuthPW = client.authPW.toString('hex');
      expect(response1.sessionToken).toBeTruthy();
      expect(response1.keyFetchToken).toBeTruthy();
      expect(secondAuthPW).not.toBe(firstAuthPW);

      // Do it again to see if the new session is also verified
      await getSessionTokenId(response1.sessionToken);

      const response2 = await client.changePassword(
        'fizzbuzz',
        undefined,
        client.sessionToken
      );
      expect(client.authPW.toString('hex')).not.toBe(secondAuthPW);
      expect(response2.sessionToken).toBeTruthy();
      expect(response2.keyFetchToken).toBeTruthy();
    });

    it("shouldn't change password on account with TOTP with unverified sessionToken", async () => {
      const email = server.uniqueEmail();
      const password = 'ok';

      await Client.createAndVerifyAndTOTP(
        server.publicUrl,
        email,
        password,
        server.mailbox,
        { ...testOptions, keys: true }
      );

      // Create new unverified client
      const client = await Client.login(server.publicUrl, email, password, {
        ...testOptions,
        keys: true,
      });

      try {
        await client.changePassword('foobar', undefined, client.sessionToken);
        fail('should have thrown');
      } catch (err: unknown) {
        const error = err as AuthServerError;
        expect(error.message).toBe('Unconfirmed session');
        expect(error.errno).toBe(138);
      }
    });

    // See FXA-11960 and FXA-12107 for more context
    describe('extra password change checks', () => {
      const defaultPassword = 'ok';

      async function createVerifiedUser() {
        return await Client.createAndVerify(
          server.publicUrl,
          server.uniqueEmail(),
          defaultPassword,
          server.mailbox,
          { ...testOptions, keys: true }
        );
      }

      async function loginUser(loginEmail: string, loginPassword: string, options?: any) {
        return await Client.login(server.publicUrl, loginEmail, loginPassword, {
          ...testOptions,
          ...options,
        });
      }

      async function createVerifiedUserWithVerifiedTOTP() {
        return await Client.createAndVerifyAndTOTP(
          server.publicUrl,
          server.uniqueEmail(),
          defaultPassword,
          server.mailbox,
          { ...testOptions, keys: true }
        );
      }

      async function changePassword(victim: any, attacker: any) {
        let startResult: any = undefined;
        let startError: any = undefined;
        try {
          startResult = await attacker.api.passwordChangeStart(
            victim.email,
            victim.authPW,
            undefined,
            attacker.sessionToken
          );
        } catch (err) {
          startError = err;
        }

        await victim.setupCredentials(victim.email, 'bogus');

        let finishResult: any = undefined;
        let finishError: any = undefined;
        if (startResult) {
          try {
            finishResult = await attacker.api.passwordChangeFinish(
              startResult.passwordChangeToken,
              victim.authPW,
              victim.unwrapBKey,
              undefined,
              attacker.sessionToken
            );
          } catch (err) {
            finishError = err;
          }
        }

        await victim.setupCredentials(victim.email, 'ok');

        return {
          unwrapBKey: startResult?.unwrapBKey,
          keyFetchToken: startResult?.keyFetchToken,
          res: startResult || finishResult,
          error: startError || finishError,
        };
      }

      async function validatePasswordChanged(victim: any, res: any, error: any) {
        try {
          await victim.setupCredentials(victim.email, 'ok');
          await victim.auth();
        } catch {
          throw new Error("Victim's password changed!");
        }

        expect(res?.sessionToken).toBeUndefined();
        expect(error.error).toMatch(/Unauthorized|Bad Request/);
      }

      it('requires session to call /password/change/start', async () => {
        const victim = await createVerifiedUserWithVerifiedTOTP();
        const badActor = await createVerifiedUserWithVerifiedTOTP();

        try {
          await badActor.api.passwordChangeStart(
            victim.email,
            victim.authPW,
            undefined,
            undefined
          );
          fail('Should have failed.');
        } catch (err: any) {
          expect(err.message).toBe(
            'Invalid authentication token: Missing authentication'
          );
        }
      });

      it('requires session to call /password/change/finish', async () => {
        const victim = await createVerifiedUserWithVerifiedTOTP();
        const badActor = await createVerifiedUserWithVerifiedTOTP();

        const startResult = await badActor.api.passwordChangeStart(
          victim.email,
          victim.authPW,
          undefined,
          victim.sessionToken
        );

        try {
          await victim.setupCredentials(victim.email, 'bogus');
          await badActor.api.passwordChangeFinish(
            startResult.passwordChangeToken,
            victim.authPW,
            victim.unwrapBKey,
            undefined,
            undefined
          );
          fail('Should have failed.');
        } catch (err: any) {
          expect(err.message).toBe(
            'Missing parameter in request body: sessionToken'
          );
        }
      });

      it('can get keys after /password/change/start for verified user', async () => {
        const user = await createVerifiedUser();

        const result = await user.api.passwordChangeStart(
          user.email,
          user.authPW,
          undefined,
          user.sessionToken
        );
        const keys = await user.api.accountKeys(result.keyFetchToken);
        expect(keys.bundle).toBeDefined();
      });

      it('can get keys after /password/change/start for verified 2FA user', async () => {
        const user = await createVerifiedUserWithVerifiedTOTP();
        const result = await user.api.passwordChangeStart(
          user.email,
          user.authPW,
          undefined,
          user.sessionToken
        );
        const keys = await user.api.accountKeys(result.keyFetchToken);
        expect(keys.bundle).toBeDefined();
      });

      it('cannot get key fetch token from /password/change/start for unverified 2FA user', async () => {
        let user = await createVerifiedUserWithVerifiedTOTP();
        await user.destroySession();
        user = await loginUser(user.email, defaultPassword, { keys: true });

        try {
          const result = await user.api.passwordChangeStart(
            user.email,
            user.authPW,
            undefined,
            user.sessionToken
          );
          await user.api.accountKeys(result.keyFetchToken);
          fail('Should have failed.');
        } catch (err: any) {
          expect(err.message).toBe('Unconfirmed session');
        }
      });

      it('cannot get key fetch token from /password/change/start without providing sessionToken', async () => {
        const victim = await createVerifiedUserWithVerifiedTOTP();
        const badActor = await createVerifiedUser();
        try {
          const result = await badActor.api.passwordChangeStart(
            victim.email,
            victim.authPW,
            undefined,
            undefined
          );
          await badActor.api.accountKeys(result.keyFetchToken);
          fail('Should have failed.');
        } catch (err: any) {
          expect(err.message).toBe(
            'Invalid authentication token: Missing authentication'
          );
        }
      });

      it('cannot get keys after /password/change/start by providing verified session token from a different user', async () => {
        const victim = await createVerifiedUser();
        const badActor = await createVerifiedUser();

        try {
          await badActor.api.passwordChangeStart(
            victim.email,
            victim.authPW,
            undefined,
            badActor.sessionToken
          );
          fail('Should have failed.');
        } catch (err: any) {
          expect(err.message).toBe('Invalid session token');
        }
      });

      it('cannot change password using session token from a different verified user', async () => {
        const victim = await createVerifiedUser();
        const badActor = await createVerifiedUser();
        const { error, res } = await changePassword(victim, badActor);
        await validatePasswordChanged(victim, res, error);
      });

      it('cannot change password using session token with verified 2FA from a different user', async () => {
        const victim = await createVerifiedUser();
        const badActor = await createVerifiedUserWithVerifiedTOTP();
        const { error, res } = await changePassword(victim, badActor);
        await validatePasswordChanged(victim, res, error);
      });

      it('cannot change password of 2FA user by using session token from a different verified user', async () => {
        const victim = await createVerifiedUserWithVerifiedTOTP();
        const badActor = await createVerifiedUser();
        const { error, res } = await changePassword(victim, badActor);
        await validatePasswordChanged(victim, res, error);
      });

      it('cannot change password of 2FA user by using session token with verified 2FA from a different user', async () => {
        const victim = await createVerifiedUserWithVerifiedTOTP();
        const badActor = await createVerifiedUserWithVerifiedTOTP();
        const { error, res } = await changePassword(victim, badActor);
        await validatePasswordChanged(victim, res, error);
      });
    });
  }
);

describe.each(testVersions)(
  '#integration$tag - remote password change with JWT',
  ({ version, tag }) => {
    const testOptions = { version };
    let sharedServer: TestServerInstance;

    beforeAll(async () => {
      // Use the shared server (default config) so that new accounts
      // get verified sessions without needing signin confirmation
      sharedServer = await getSharedTestServer();
    });

    it('should change password with valid JWT', async () => {
      const email = sharedServer.uniqueEmail();
      const password = 'allyourbasearebelongtous';
      const newPassword = 'foobar';
      const config = sharedServer.config as any;

      const client = await Client.createAndVerify(
        sharedServer.publicUrl,
        email,
        password,
        sharedServer.mailbox,
        { ...testOptions, keys: true }
      );

      const oldAuthPW = client.authPW.toString('hex');
      const originalKeys = await client.keys();

      const sessionTokenHex = client.sessionToken;
      const sessionToken = await tokens.SessionToken.fromHex(sessionTokenHex);
      const sessionTokenId = sessionToken.id;

      const now = Math.floor(Date.now() / 1000);
      const claims = {
        sub: client.uid,
        scope: ['mfa:password'],
        iat: now,
        jti: uuid.v4(),
        stid: sessionTokenId,
      };

      const jwtToken = jwt.sign(claims, config.mfa.jwt.secretKey, {
        algorithm: 'HS256',
        expiresIn: config.mfa.jwt.expiresInSec,
        audience: config.mfa.jwt.audience,
        issuer: config.mfa.jwt.issuer,
      });

      const newCreds = await client.setupCredentials(email, newPassword);
      client.deriveWrapKbFromKb();

      const payload: any = {
        email,
        oldAuthPW,
        authPW: newCreds.authPW.toString('hex'),
        wrapKb: client.wrapKb,
        clientSalt: client.clientSalt,
      };

      if (testOptions.version === 'V2') {
        await client.setupCredentialsV2(email, newPassword);
        client.deriveWrapKbVersion2FromKb();
        payload.authPWVersion2 = newCreds.authPWVersion2.toString('hex');
        payload.wrapKbVersion2 = client.wrapKbVersion2;
      }

      const response = await client.changePasswordJWT(jwtToken, payload);

      expect(response.uid).toBeTruthy();
      expect(response.sessionToken).toBeTruthy();
      expect(response.authAt).toBeTruthy();

      const newClient = await Client.login(
        sharedServer.publicUrl,
        email,
        newPassword,
        { ...testOptions, keys: true }
      );
      expect(newClient.sessionToken).toBeTruthy();

      const newClientKeys = await newClient.keys();
      expect(newClientKeys.kA.toString('hex')).toBe(
        originalKeys.kA.toString('hex')
      );
      expect(newClientKeys.kB.toString('hex')).toBe(
        originalKeys.kB.toString('hex')
      );
    });
  }
);
