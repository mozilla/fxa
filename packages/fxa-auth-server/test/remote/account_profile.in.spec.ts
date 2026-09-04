/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  createTestServer,
  TestServerInstance,
} from '../support/helpers/test-server';
import crypto from 'crypto';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Client = require('../client')();
// eslint-disable-next-line @typescript-eslint/no-require-imports
const jwt = require('jsonwebtoken');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const tokens = require('../../lib/tokens')({ trace: function () {} });
// eslint-disable-next-line @typescript-eslint/no-require-imports
const baseConfig = require('../../config').default.getProperties();

let server: TestServerInstance;
let CLIENT_ID: string;

async function generateMfaJwt(client: any) {
  const sessionToken = await tokens.SessionToken.fromHex(client.sessionToken);
  const now = Math.floor(Date.now() / 1000);

  return jwt.sign(
    {
      sub: client.uid,
      scope: ['mfa:email'],
      iat: now,
      jti: crypto.randomUUID(),
      stid: sessionToken.id,
    },
    baseConfig.mfa.jwt.secretKey,
    {
      algorithm: 'HS256',
      expiresIn: baseConfig.mfa.jwt.expiresInSec,
      audience: baseConfig.mfa.jwt.audience,
      issuer: baseConfig.mfa.jwt.issuer,
    }
  );
}

async function addVerifiedSecondaryEmail(
  client: any,
  mfaJwt: string,
  email: string
) {
  await client.createEmail(mfaJwt, email);
  const emailData = await server.mailbox.waitForEmail(email);
  await client.verifySecondaryEmailWithCode(
    mfaJwt,
    emailData['headers']['x-verify-code'],
    email
  );
}

beforeAll(async () => {
  server = await createTestServer({
    configOverrides: {
      subscriptions: { enabled: false },
    },
  });
  const config = server.config as any;
  CLIENT_ID = config.oauthServer.clients.find(
    (c: any) => c.trusted && c.canGrant && c.publicClient
  ).id;
}, 120000);

afterAll(async () => {
  await server.stop();
});

const testVersions = [
  { version: '', tag: '' },
  { version: 'V2', tag: 'V2' },
];

describe.each(testVersions)(
  '#integration$tag - fetch user profile data',
  ({ version, tag }) => {
    const testOptions = { version };

    describe('when a request is authenticated with a session token', () => {
      let client: any;

      beforeEach(async () => {
        client = await Client.create(
          server.publicUrl,
          server.uniqueEmail(),
          'password',
          { ...testOptions, lang: 'en-US' }
        );
      });

      it('returns the profile data', async () => {
        const response = await client.accountProfile();

        expect(response.email).toBeTruthy();
        expect(response.locale).toBe('en-US');
        expect(response.authenticationMethods).toEqual(['pwd', 'email']);
        expect(response.authenticatorAssuranceLevel).toBe(1);
        expect(response.profileChangedAt).toBeTruthy();
      });

      it('returns an empty additionalEmails when there is no secondary email', async () => {
        const response = await client.accountProfile();

        expect(response.additionalEmails).toEqual([]);
      });
    });

    describe('additionalEmails and secondary email state', () => {
      let client: any;
      let secondEmail: string;

      beforeEach(async () => {
        secondEmail = server.uniqueEmail();
        client = await Client.createAndVerify(
          server.publicUrl,
          server.uniqueEmail(),
          'password',
          server.mailbox,
          { ...testOptions, lang: 'en-US' }
        );
      });

      it('excludes an unverified secondary email and includes it once verified', async () => {
        const mfaJwt = await generateMfaJwt(client);
        await client.createEmail(mfaJwt, secondEmail);

        let response = await client.accountProfile();
        expect(response.additionalEmails).toEqual([]);

        const sentEmail = await server.mailbox.waitForEmail(secondEmail);
        const verifyCode = sentEmail['headers']['x-verify-code'];
        await client.verifySecondaryEmailWithCode(
          mfaJwt,
          verifyCode,
          secondEmail
        );

        response = await client.accountProfile();
        expect(response.additionalEmails).toEqual([secondEmail]);
      });

      it('returns every verified secondary email', async () => {
        const thirdEmail = server.uniqueEmail();
        const mfaJwt = await generateMfaJwt(client);

        await addVerifiedSecondaryEmail(client, mfaJwt, secondEmail);
        await addVerifiedSecondaryEmail(client, mfaJwt, thirdEmail);

        const response = await client.accountProfile();

        expect(response.additionalEmails).toHaveLength(2);
        expect(response.additionalEmails).toEqual(
          expect.arrayContaining([secondEmail, thirdEmail])
        );
      });

      it('drops a deleted secondary email from the profile', async () => {
        const mfaJwt = await generateMfaJwt(client);
        await addVerifiedSecondaryEmail(client, mfaJwt, secondEmail);

        expect((await client.accountProfile()).additionalEmails).toEqual([
          secondEmail,
        ]);

        await client.deleteEmail(mfaJwt, secondEmail);

        expect((await client.accountProfile()).additionalEmails).toEqual([]);
      });

      it('never returns the primary email in additionalEmails', async () => {
        const response = await client.accountProfile();

        expect(response.email).toBeTruthy();
        expect(response.additionalEmails).not.toContain(response.email);
      });
    });

    describe('when a request is authenticated with a valid oauth token', () => {
      let client: any;
      let token: string;

      async function initialize(scope: string) {
        const email = server.uniqueEmail();
        const password = 'test password';
        client = await Client.createAndVerify(
          server.publicUrl,
          email,
          password,
          server.mailbox,
          { ...testOptions, lang: 'en-US' }
        );

        const tokenResponse = await client.grantOAuthTokensFromSessionToken({
          grant_type: 'fxa-credentials',
          client_id: CLIENT_ID,
          access_type: 'offline',
          scope: scope,
        });

        token = tokenResponse.access_token;
      }

      it('returns the profile data', async () => {
        await initialize('profile');
        const response = await client.accountProfile(token);

        expect(response.email).toBeTruthy();
        expect(response.locale).toBe('en-US');
        expect(response.authenticationMethods).toEqual(['pwd', 'email']);
        expect(response.authenticatorAssuranceLevel).toBe(1);
        expect(response.profileChangedAt).toBeTruthy();
      });

      describe('scopes are applied to profile data returned', () => {
        describe('scope does not authorize profile data', () => {
          it('returns no profile data', async () => {
            await initialize('preadinglist payments');
            const response = await client.accountProfile(token);

            expect(response).toEqual({});
          });
        });

        describe('limited oauth scopes for profile data', () => {
          it('returns only email for email only token', async () => {
            await initialize('profile:email');
            const response = await client.accountProfile(token);

            expect(response.email).toBeTruthy();
            expect(response.locale).toBeFalsy();
            expect(response.profileChangedAt).toBeTruthy();
          });

          it('returns only locale for locale only token', async () => {
            await initialize('profile:locale');
            const response = await client.accountProfile(token);
            expect(response.email).toBeFalsy();
            expect(response.locale).toBe('en-US');
            expect(response.profileChangedAt).toBeTruthy();
          });
        });

        describe('additionalEmails', () => {
          it('omits additionalEmails for an email only token', async () => {
            await initialize('profile:email');
            const response = await client.accountProfile(token);

            expect(response.email).toBeTruthy();
            expect(response.additionalEmails).toBeUndefined();
          });

          it('returns an empty array when there are no secondary emails', async () => {
            await initialize('profile:additionalEmails');
            const response = await client.accountProfile(token);

            expect(response.additionalEmails).toEqual([]);
            expect(response.email).toBeFalsy();
          });

          it('returns additionalEmails for a profile scoped token', async () => {
            await initialize('profile');
            const response = await client.accountProfile(token);

            expect(response.additionalEmails).toEqual([]);
          });
        });

        describe('profile authenticated with :write scopes', () => {
          describe('profile:write', () => {
            it('returns profile data', async () => {
              await initialize('profile:write');
              const response = await client.accountProfile(token);

              expect(response.email).toBeTruthy();
              expect(response.locale).toBeTruthy();
              expect(response.authenticationMethods).toBeTruthy();
              expect(response.authenticatorAssuranceLevel).toBeTruthy();
              expect(response.profileChangedAt).toBeTruthy();
            });
          });

          describe('profile:locale:write readinglist', () => {
            it('returns limited profile data', async () => {
              await initialize('profile:locale:write readinglist');
              const response = await client.accountProfile(token);

              expect(response.email).toBeFalsy();
              expect(response.locale).toBeTruthy();
              expect(response.authenticationMethods).toBeFalsy();
              expect(response.authenticatorAssuranceLevel).toBeFalsy();
            });
          });

          describe('profile:email:write storage', () => {
            it('returns limited profile data', async () => {
              await initialize('profile:email:write storage');
              const response = await client.accountProfile(token);

              expect(response.email).toBeTruthy();
              expect(response.locale).toBeFalsy();
              expect(response.authenticationMethods).toBeFalsy();
              expect(response.authenticatorAssuranceLevel).toBeFalsy();
            });
          });

          describe('profile:email:write profile:amr', () => {
            it('returns limited profile data', async () => {
              await initialize('profile:email:write profile:amr');
              const response = await client.accountProfile(token);

              expect(response.email).toBeTruthy();
              expect(response.locale).toBeFalsy();
              expect(response.authenticationMethods).toBeTruthy();
              expect(response.authenticatorAssuranceLevel).toBeTruthy();
            });
          });
        });
      });
    });

    describe('when the profile data is not default', () => {
      describe('when the email address is unicode', () => {
        it('rejects unicode email address', async () => {
          const email = server.uniqueUnicodeEmail();

          try {
            await Client.create(
              server.publicUrl,
              email,
              'password',
              testOptions
            );
            throw new Error('should have failed');
          } catch (err: any) {
            expect(err.errno).toBe(107);
          }
        });
      });

      describe('when the account has TOTP', () => {
        it('returns correct TOTP status in profile data', async () => {
          const client = await Client.createAndVerifyAndTOTP(
            server.publicUrl,
            server.uniqueEmail(),
            'password',
            server.mailbox,
            { ...testOptions, lang: 'en-US' }
          );

          const res = await client.grantOAuthTokensFromSessionToken({
            grant_type: 'fxa-credentials',
            client_id: CLIENT_ID,
            access_type: 'offline',
            scope: 'profile',
          });

          const response = await client.accountProfile(res.access_token);
          expect(response.email).toBeTruthy();
          expect(response.locale).toBe('en-US');
          expect(response.authenticationMethods).toEqual([
            'pwd',
            'email',
            'otp',
          ]);
          expect(response.authenticatorAssuranceLevel).toBe(2);
        });
      });

      describe('when the locale is empty', () => {
        it('returns the profile data successfully', async () => {
          const email = server.uniqueEmail();
          const password = 'test password';
          const client = await Client.createAndVerify(
            server.publicUrl,
            email,
            password,
            server.mailbox,
            testOptions
          );

          const res = await client.grantOAuthTokensFromSessionToken({
            grant_type: 'fxa-credentials',
            client_id: CLIENT_ID,
            scope: 'profile:locale',
          });

          const response = await client.accountProfile(res.access_token);
          expect(response.locale).toBeUndefined();
        });
      });
    });
  }
);
