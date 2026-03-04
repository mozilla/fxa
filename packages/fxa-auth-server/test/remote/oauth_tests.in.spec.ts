/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createTestServer, TestServerInstance } from '../support/helpers/test-server';

const Client = require('../client')();
const { OAUTH_SCOPE_OLD_SYNC } = require('fxa-shared/oauth/constants');
const { AppError: error } = require('@fxa/accounts/errors');
const testUtils = require('../lib/util');

const PUBLIC_CLIENT_ID = '3c49430b43dfba77';
const OAUTH_CLIENT_NAME = 'Android Components Reference Browser';
const MOCK_CODE_VERIFIER = 'abababababababababababababababababababababa';
const MOCK_CODE_CHALLENGE = 'YPhkZqm08uTfwjNSiYcx80-NPT9Zn94kHboQW97KyV0';

const JWT_ACCESS_TOKEN_CLIENT_ID = '325b4083e32fe8e7';
const JWT_ACCESS_TOKEN_SECRET =
  'a084f4c36501ea1eb2de33258421af97b2e67ffbe107d2812f4a14f3579900ef';

const FIREFOX_IOS_CLIENT_ID = '1b1a3e44c54fbb58';
const RELAY_SCOPE = 'https://identity.mozilla.com/apps/relay';
const GRANT_TOKEN_EXCHANGE = 'urn:ietf:params:oauth:grant-type:token-exchange';
const SUBJECT_TOKEN_TYPE_REFRESH =
  'urn:ietf:params:oauth:token-type:refresh_token';

const { decodeJWT } = testUtils;

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
  '#integration$tag - /oauth/ routes',
  ({ version, tag }) => {
    const testOptions = { version };
    let client: any;
    let email: string;
    let password: string;

    beforeEach(async () => {
      email = server.uniqueEmail();
      password = 'test password';
      client = await Client.createAndVerify(
        server.publicUrl, email, password, server.mailbox, testOptions
      );
    });

    it('successfully grants an authorization code', async () => {
      const res = await client.createAuthorizationCode({
        client_id: PUBLIC_CLIENT_ID,
        scope: 'abc',
        state: 'xyz',
        code_challenge: MOCK_CODE_CHALLENGE,
        code_challenge_method: 'S256',
      });
      expect(res.redirect).toBeTruthy();
      expect(res.code).toBeTruthy();
      expect(res.state).toBe('xyz');
    });

    it('rejects `assertion` parameter in /authorization request', async () => {
      try {
        await client.createAuthorizationCode({
          client_id: PUBLIC_CLIENT_ID,
          state: 'xyz',
          assertion: 'a~b',
        });
        throw new Error('should have thrown');
      } catch (err: any) {
        expect(err.errno).toBe(error.ERRNO.INVALID_PARAMETER);
        expect(err.validation.keys[0]).toBe('assertion');
      }
    });

    it('rejects `resource` parameter in /authorization request', async () => {
      try {
        await client.createAuthorizationCode({
          client_id: PUBLIC_CLIENT_ID,
          state: 'xyz',
          code_challenge: MOCK_CODE_CHALLENGE,
          code_challenge_method: 'S256',
          resource: 'https://resource.server.com',
        });
        throw new Error('should have thrown');
      } catch (err: any) {
        expect(err.errno).toBe(error.ERRNO.INVALID_PARAMETER);
        expect(err.validation.keys[0]).toBe('resource');
      }
    });

    it('successfully grants tokens from sessionToken and notifies user', async () => {
      const SCOPE = OAUTH_SCOPE_OLD_SYNC;

      let devices = await client.devices();
      expect(devices.length).toBe(0);

      const res = await client.grantOAuthTokensFromSessionToken({
        grant_type: 'fxa-credentials',
        client_id: PUBLIC_CLIENT_ID,
        access_type: 'offline',
        scope: SCOPE,
      });

      expect(res.access_token).toBeTruthy();
      expect(res.refresh_token).toBeTruthy();
      expect(res.scope).toBe(SCOPE);
      expect(res.auth_at).toBeTruthy();
      expect(res.expires_in).toBeTruthy();
      expect(res.token_type).toBeTruthy();

      devices = await client.devicesWithRefreshToken(res.refresh_token);
      expect(devices.length).toBe(1);
      expect(devices[0].name).toBe(OAUTH_CLIENT_NAME);
    });

    it('successfully grants tokens via authentication code flow, and refresh token flow', async () => {
      const SCOPE = `${OAUTH_SCOPE_OLD_SYNC} openid`;

      let devices = await client.devices();
      expect(devices.length).toBe(0);

      let res = await client.createAuthorizationCode({
        client_id: PUBLIC_CLIENT_ID,
        state: 'abc',
        code_challenge: MOCK_CODE_CHALLENGE,
        code_challenge_method: 'S256',
        scope: SCOPE,
        access_type: 'offline',
      });
      expect(res.code).toBeTruthy();

      devices = await client.devices();
      expect(devices.length).toBe(0);

      res = await client.grantOAuthTokens({
        client_id: PUBLIC_CLIENT_ID,
        code: res.code,
        code_verifier: MOCK_CODE_VERIFIER,
      });
      expect(res.access_token).toBeTruthy();
      expect(res.refresh_token).toBeTruthy();
      expect(res.id_token).toBeTruthy();
      expect(res.scope).toBe(SCOPE);
      expect(res.auth_at).toBeTruthy();
      expect(res.expires_in).toBeTruthy();
      expect(res.token_type).toBeTruthy();

      const idToken = decodeJWT(res.id_token);
      expect(idToken.claims.aud).toBe(PUBLIC_CLIENT_ID);

      devices = await client.devices();
      expect(devices.length).toBe(1);

      const res2 = await client.grantOAuthTokens({
        client_id: PUBLIC_CLIENT_ID,
        grant_type: 'refresh_token',
        refresh_token: res.refresh_token,
      });
      expect(res2.access_token).toBeTruthy();
      expect(res2.id_token).toBeFalsy();
      expect(res2.scope).toBe(OAUTH_SCOPE_OLD_SYNC);
      expect(res2.expires_in).toBeTruthy();
      expect(res2.token_type).toBeTruthy();
      expect(res.access_token).not.toBe(res2.access_token);

      devices = await client.devices();
      expect(devices.length).toBe(1);
    });

    it('successfully propagates `resource` and `clientId` in the ID token `aud` claim', async () => {
      const SCOPE = `${OAUTH_SCOPE_OLD_SYNC} openid`;

      let devices = await client.devices();
      expect(devices.length).toBe(0);

      let res = await client.createAuthorizationCode({
        client_id: PUBLIC_CLIENT_ID,
        state: 'abc',
        code_challenge: MOCK_CODE_CHALLENGE,
        code_challenge_method: 'S256',
        scope: SCOPE,
        access_type: 'offline',
      });
      expect(res.code).toBeTruthy();

      devices = await client.devices();
      expect(devices.length).toBe(0);

      res = await client.grantOAuthTokens({
        client_id: PUBLIC_CLIENT_ID,
        code: res.code,
        code_verifier: MOCK_CODE_VERIFIER,
        resource: 'https://resource.server.com',
      });
      expect(res.access_token).toBeTruthy();
      expect(res.refresh_token).toBeTruthy();
      expect(res.id_token).toBeTruthy();
      expect(res.scope).toBe(SCOPE);
      expect(res.auth_at).toBeTruthy();
      expect(res.expires_in).toBeTruthy();
      expect(res.token_type).toBeTruthy();

      const idToken = decodeJWT(res.id_token);
      expect(idToken.claims.aud).toEqual([
        PUBLIC_CLIENT_ID,
        'https://resource.server.com',
      ]);
    });

    it('successfully grants JWT access tokens via authentication code flow, and refresh token flow', async () => {
      const SCOPE = 'openid';

      const codeRes = await client.createAuthorizationCode({
        client_id: JWT_ACCESS_TOKEN_CLIENT_ID,
        state: 'abc',
        scope: SCOPE,
        access_type: 'offline',
      });
      expect(codeRes.code).toBeTruthy();

      const tokenRes = await client.grantOAuthTokens({
        client_id: JWT_ACCESS_TOKEN_CLIENT_ID,
        client_secret: JWT_ACCESS_TOKEN_SECRET,
        code: codeRes.code,
        ppid_seed: 100,
      });
      expect(tokenRes.access_token).toBeTruthy();
      expect(tokenRes.refresh_token).toBeTruthy();
      expect(tokenRes.id_token).toBeTruthy();
      expect(tokenRes.scope).toBe(SCOPE);
      expect(tokenRes.auth_at).toBeTruthy();
      expect(tokenRes.expires_in).toBeTruthy();
      expect(tokenRes.token_type).toBeTruthy();

      const tokenJWT = decodeJWT(tokenRes.access_token);
      expect(tokenJWT.claims.sub).toBeTruthy();
      expect(tokenJWT.claims.aud).toBe(JWT_ACCESS_TOKEN_CLIENT_ID);

      const refreshTokenRes = await client.grantOAuthTokens({
        client_id: JWT_ACCESS_TOKEN_CLIENT_ID,
        client_secret: JWT_ACCESS_TOKEN_SECRET,
        refresh_token: tokenRes.refresh_token,
        grant_type: 'refresh_token',
        ppid_seed: 100,
        resource: 'https://resource.server1.com',
        scope: SCOPE,
      });
      expect(refreshTokenRes.access_token).toBeTruthy();
      expect(refreshTokenRes.id_token).toBeFalsy();
      expect(refreshTokenRes.scope).toBe('');
      expect(refreshTokenRes.expires_in).toBeTruthy();
      expect(refreshTokenRes.token_type).toBeTruthy();

      const refreshTokenJWT = decodeJWT(refreshTokenRes.access_token);
      expect(tokenJWT.claims.sub).toBe(refreshTokenJWT.claims.sub);
      expect(refreshTokenJWT.claims.aud).toEqual([
        JWT_ACCESS_TOKEN_CLIENT_ID,
        'https://resource.server1.com',
      ]);

      const clientRotatedRes = await client.grantOAuthTokens({
        client_id: JWT_ACCESS_TOKEN_CLIENT_ID,
        client_secret: JWT_ACCESS_TOKEN_SECRET,
        refresh_token: tokenRes.refresh_token,
        grant_type: 'refresh_token',
        ppid_seed: 101,
        scope: SCOPE,
      });
      expect(clientRotatedRes.access_token).toBeTruthy();
      expect(clientRotatedRes.id_token).toBeFalsy();
      expect(clientRotatedRes.scope).toBe('');
      expect(clientRotatedRes.expires_in).toBeTruthy();
      expect(clientRotatedRes.token_type).toBeTruthy();

      const clientRotatedJWT = decodeJWT(clientRotatedRes.access_token);
      expect(tokenJWT.claims.sub).not.toBe(clientRotatedJWT.claims.sub);
    });

    it('successfully revokes access tokens, and refresh tokens', async () => {
      let res = await client.createAuthorizationCode({
        client_id: PUBLIC_CLIENT_ID,
        state: 'abc',
        code_challenge: MOCK_CODE_CHALLENGE,
        code_challenge_method: 'S256',
        scope: 'profile openid',
        access_type: 'offline',
      });
      expect(res.code).toBeTruthy();

      res = await client.grantOAuthTokens({
        client_id: PUBLIC_CLIENT_ID,
        code: res.code,
        code_verifier: MOCK_CODE_VERIFIER,
      });
      expect(res.access_token).toBeTruthy();
      expect(res.refresh_token).toBeTruthy();

      let tokenStatus = await client.api.introspect(res.access_token);
      expect(tokenStatus.active).toBe(true);

      await client.revokeOAuthToken({
        client_id: PUBLIC_CLIENT_ID,
        token: res.access_token,
      });

      tokenStatus = await client.api.introspect(res.access_token);
      expect(tokenStatus.active).toBe(false);

      const res2 = await client.grantOAuthTokens({
        client_id: PUBLIC_CLIENT_ID,
        grant_type: 'refresh_token',
        refresh_token: res.refresh_token,
      });
      expect(res2.access_token).toBeTruthy();
      expect(res2.refresh_token).toBeFalsy();

      tokenStatus = await client.api.introspect(res.refresh_token);
      expect(tokenStatus.active).toBe(true);

      await client.revokeOAuthToken({
        client_id: PUBLIC_CLIENT_ID,
        token: res.refresh_token,
      });

      try {
        await client.grantOAuthTokens({
          client_id: PUBLIC_CLIENT_ID,
          grant_type: 'refresh_token',
          refresh_token: res.refresh_token,
        });
        throw new Error('should have thrown');
      } catch (err: any) {
        expect(err.errno).toBe(error.ERRNO.INVALID_TOKEN);
      }
    });

    it('successfully revokes JWT access tokens', async () => {
      const codeRes = await client.createAuthorizationCode({
        client_id: JWT_ACCESS_TOKEN_CLIENT_ID,
        state: 'abc',
        scope: 'openid',
      });
      expect(codeRes.code).toBeTruthy();

      const token = (
        await client.grantOAuthTokens({
          client_id: JWT_ACCESS_TOKEN_CLIENT_ID,
          client_secret: JWT_ACCESS_TOKEN_SECRET,
          code: codeRes.code,
          ppid_seed: 100,
        })
      ).access_token;
      expect(token).toBeTruthy();

      const tokenJWT = decodeJWT(token);
      expect(tokenJWT.claims.sub).toBeTruthy();

      await client.revokeOAuthToken({
        client_id: JWT_ACCESS_TOKEN_CLIENT_ID,
        client_secret: JWT_ACCESS_TOKEN_SECRET,
        token,
      });
    });

    it('sees correct keyRotationTimestamp after password change and password reset', async () => {
      const keyData1 = (
        await client.getScopedKeyData({
          client_id: PUBLIC_CLIENT_ID,
          scope: OAUTH_SCOPE_OLD_SYNC,
        })
      )[OAUTH_SCOPE_OLD_SYNC];

      await client.changePassword('new password', undefined, client.sessionToken);
      await server.mailbox.waitForEmail(email);

      client = await Client.login(server.publicUrl, email, 'new password', testOptions);
      await server.mailbox.waitForEmail(email);

      const keyData2 = (
        await client.getScopedKeyData({
          client_id: PUBLIC_CLIENT_ID,
          scope: OAUTH_SCOPE_OLD_SYNC,
        })
      )[OAUTH_SCOPE_OLD_SYNC];

      expect(keyData1.keyRotationTimestamp).toBe(keyData2.keyRotationTimestamp);

      await client.forgotPassword();
      const otpCode = await server.mailbox.waitForCode(email);
      const result = await client.verifyPasswordForgotOtp(otpCode);
      await client.verifyPasswordResetCode(result.code);
      await client.resetPassword(password, {});
      await server.mailbox.waitForEmail(email);

      const keyData3 = (
        await client.getScopedKeyData({
          client_id: PUBLIC_CLIENT_ID,
          scope: OAUTH_SCOPE_OLD_SYNC,
        })
      )[OAUTH_SCOPE_OLD_SYNC];

      expect(keyData2.keyRotationTimestamp).toBeLessThan(keyData3.keyRotationTimestamp);
    });
  }
);

describe.each(testVersions)(
  '#integration$tag - /oauth/token token exchange',
  ({ version, tag }) => {
    const testOptions = { version };
    let client: any;
    let email: string;
    let password: string;

    beforeEach(async () => {
      email = server.uniqueEmail();
      password = 'test password';
      client = await Client.createAndVerify(
        server.publicUrl, email, password, server.mailbox, testOptions
      );
    });

    it('successfully exchanges a refresh token for a new token with additional scope', async () => {
      const initialTokens = await client.grantOAuthTokensFromSessionToken({
        grant_type: 'fxa-credentials',
        client_id: FIREFOX_IOS_CLIENT_ID,
        access_type: 'offline',
        scope: OAUTH_SCOPE_OLD_SYNC,
      });

      expect(initialTokens.access_token).toBeTruthy();
      expect(initialTokens.refresh_token).toBeTruthy();
      expect(initialTokens.scope).toBe(OAUTH_SCOPE_OLD_SYNC);

      const clientsBefore = await client.attachedClients();
      const oauthClientBefore = clientsBefore.find(
        (c: any) => c.refreshTokenId !== null
      );
      expect(oauthClientBefore).toBeTruthy();
      const originalDeviceId = oauthClientBefore.deviceId;

      const exchangedTokens = await client.grantOAuthTokens({
        grant_type: GRANT_TOKEN_EXCHANGE,
        subject_token: initialTokens.refresh_token,
        subject_token_type: SUBJECT_TOKEN_TYPE_REFRESH,
        scope: RELAY_SCOPE,
      });

      expect(exchangedTokens.access_token).toBeTruthy();
      expect(exchangedTokens.refresh_token).toBeTruthy();
      expect(exchangedTokens.scope).toContain(OAUTH_SCOPE_OLD_SYNC);
      expect(exchangedTokens.scope).toContain(RELAY_SCOPE);
      expect(exchangedTokens.expires_in).toBeTruthy();
      expect(exchangedTokens.token_type).toBe('bearer');
      expect(exchangedTokens._clientId).toBeUndefined();
      expect(exchangedTokens._existingDeviceId).toBeUndefined();

      const clientsAfter = await client.attachedClients();
      const oauthClientAfter = clientsAfter.find(
        (c: any) => c.refreshTokenId !== null
      );
      expect(oauthClientAfter).toBeTruthy();
      expect(oauthClientAfter.deviceId).toBe(originalDeviceId);

      try {
        await client.grantOAuthTokens({
          grant_type: 'refresh_token',
          client_id: FIREFOX_IOS_CLIENT_ID,
          refresh_token: initialTokens.refresh_token,
        });
        throw new Error('should have thrown - original token should be revoked');
      } catch (err: any) {
        expect(err.errno).toBe(110);
      }
    });
  }
);

describe('#integrationV2 - /oauth/token fxa-credentials with reason', () => {
  const testOptions = { version: 'V2' };
  let client: any;
  let email: string;
  let password: string;

  beforeEach(async () => {
    email = server.uniqueEmail();
    password = 'test password';
    client = await Client.createAndVerify(
      server.publicUrl, email, password, server.mailbox, testOptions
    );
  });

  it('grants tokens with reason=token_migration and links to existing device', async () => {
    const deviceInfo = {
      name: 'Test Device',
      type: 'desktop',
    };
    const device = await client.updateDevice(deviceInfo);
    expect(device.id).toBeTruthy();

    const clientsBefore = await client.attachedClients();
    expect(clientsBefore.length).toBe(1);
    expect(clientsBefore[0].deviceId).toBe(device.id);
    expect(clientsBefore[0].refreshTokenId).toBeNull();

    const tokens = await client.grantOAuthTokensFromSessionToken({
      grant_type: 'fxa-credentials',
      client_id: FIREFOX_IOS_CLIENT_ID,
      access_type: 'offline',
      scope: OAUTH_SCOPE_OLD_SYNC,
      reason: 'token_migration',
    });

    expect(tokens.access_token).toBeTruthy();
    expect(tokens.refresh_token).toBeTruthy();
    expect(tokens.scope).toBe(OAUTH_SCOPE_OLD_SYNC);

    const clientsAfter = await client.attachedClients();
    expect(clientsAfter.length).toBe(1);
    expect(clientsAfter[0].deviceId).toBe(device.id);
    expect(clientsAfter[0].refreshTokenId).toBeTruthy();
  });
});
