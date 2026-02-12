/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createTestServer, TestServerInstance } from '../support/helpers/test-server';

const Client = require('../client')();

let server: TestServerInstance;
let CLIENT_ID: string;

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

        const tokenResponse =
          await client.grantOAuthTokensFromSessionToken({
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
        it('returns the email address correctly with the profile data', async () => {
          const email = server.uniqueUnicodeEmail();
          const client = await Client.create(
            server.publicUrl,
            email,
            'password',
            testOptions
          );
          const response = await client.accountProfile();
          expect(response.email).toBe(email);
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
