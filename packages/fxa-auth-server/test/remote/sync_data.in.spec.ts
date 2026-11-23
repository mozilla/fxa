/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import http from 'http';
import { AddressInfo } from 'net';
import * as jwt from 'jsonwebtoken';
import { ERRNO } from '@fxa/accounts/errors';
import {
  createTestServer,
  TestServerInstance,
} from '../support/helpers/test-server';

const Client = require('../client')();

const password = 'pssssst';

type TokenserverCall = {
  method?: string;
  url?: string;
  authorization?: string;
};

let server: TestServerInstance;
let tokenserver: http.Server;
let tokenserverCalls: TokenserverCall[];
let tokenserverResponse: { status: number; body?: unknown };

beforeAll(async () => {
  // The route uses fetch, which nock does not intercept, so a real listener
  // stands in for tokenserver.
  tokenserver = http.createServer((req, res) => {
    tokenserverCalls.push({
      method: req.method,
      url: req.url,
      authorization: req.headers.authorization,
    });
    res.statusCode = tokenserverResponse.status;
    res.setHeader('content-type', 'application/json');
    res.end(
      tokenserverResponse.body === undefined
        ? ''
        : JSON.stringify(tokenserverResponse.body)
    );
  });
  await new Promise<void>((resolve) => tokenserver.listen(0, resolve));
  const { port } = tokenserver.address() as AddressInfo;

  server = await createTestServer({
    configOverrides: {
      securityHistory: { ipProfiling: {} },
      signinConfirmation: { skipForNewAccounts: { enabled: false } },
      mfa: { enabled: true, actions: ['sync_data', 'email'] },
      syncDataDeletion: { enabled: true },
      // Mirrors prod, where this is the oldsync token endpoint on the same origin.
      syncTokenserverUrl: `http://127.0.0.1:${port}/1.0/sync/1.5`,
    },
  });
}, 120000);

afterAll(async () => {
  await server.stop();
  await new Promise<void>((resolve) => tokenserver.close(() => resolve()));
});

describe('#integration - remote sync data deletion', () => {
  let client: any;

  /** Mints an MFA token for `action` through the real email OTP flow. */
  async function mintMfaToken(action: string): Promise<string> {
    const sessionToken = await client.api.Token.SessionToken.fromHex(
      client.sessionToken
    );
    await client.api.doRequest(
      'POST',
      `${client.api.baseURL}/mfa/otp/request`,
      sessionToken,
      { action }
    );
    const code = await server.mailbox.waitForMfaCode(client.email);
    const { accessToken } = await client.api.doRequest(
      'POST',
      `${client.api.baseURL}/mfa/otp/verify`,
      sessionToken,
      { action, code }
    );
    return accessToken;
  }

  function destroySyncData(token: string) {
    return client.api.doRequestWithBearerToken(
      'POST',
      `${client.api.baseURL}/account/sync_data/destroy`,
      token,
      {}
    );
  }

  beforeEach(async () => {
    tokenserverCalls = [];
    tokenserverResponse = { status: 200, body: { deleted: true } };
    client = await Client.createAndVerify(
      server.publicUrl,
      server.uniqueEmail(),
      password,
      server.mailbox,
      { version: 'V2' }
    );
  });

  it('deletes with an assertion tokenserver can verify', async () => {
    await client.reauth();
    const result = await destroySyncData(await mintMfaToken('sync_data'));

    expect(result).toEqual({ deleted: true });
    expect(tokenserverCalls).toHaveLength(1);
    const [call] = tokenserverCalls;
    expect(call.method).toBe('DELETE');
    expect(call.url).toBe(`/1.0/users/${client.uid}/storage`);

    const assertion = (call.authorization ?? '').replace(/^Bearer /, '');
    const decoded = jwt.decode(assertion, { complete: true });
    if (!decoded) {
      throw new Error('assertion did not decode as a JWT');
    }
    expect(decoded.header).toMatchObject({
      alg: 'RS256',
      typ: 'tokenserver-admin+jwt',
    });
    const { oauthServer } = server.config as {
      oauthServer: { openid: { issuer: string } };
    };
    expect(decoded.payload).toMatchObject({
      sub: client.uid,
      aud: 'urn:mozilla:fxa:tokenserver',
      scope: 'sync_data:delete',
      iss: oauthServer.openid.issuer,
    });
    const { iat = 0, exp = 0, jti } = decoded.payload as jwt.JwtPayload;
    expect(exp - iat).toBe(30);
    expect(jti).toEqual(expect.any(String));
  });

  it('rejects a session that has not re-entered its password', async () => {
    const token = await mintMfaToken('sync_data');

    await expect(destroySyncData(token)).rejects.toMatchObject({
      errno: ERRNO.INVALID_MFA_TOKEN,
    });
    expect(tokenserverCalls).toHaveLength(0);
  });

  it('rejects an MFA token for another action', async () => {
    await client.reauth();
    const token = await mintMfaToken('email');

    await expect(destroySyncData(token)).rejects.toMatchObject({
      code: 403,
    });
    expect(tokenserverCalls).toHaveLength(0);
  });

  it('reports nothing deleted for an unknown tokenserver user', async () => {
    await client.reauth();
    tokenserverResponse = { status: 404, body: { status: 'error' } };

    const result = await destroySyncData(await mintMfaToken('sync_data'));
    expect(result).toEqual({ deleted: false });
  });

  it('surfaces a tokenserver failure as a backend service error', async () => {
    await client.reauth();
    tokenserverResponse = { status: 503 };

    await expect(
      destroySyncData(await mintMfaToken('sync_data'))
    ).rejects.toMatchObject({ errno: ERRNO.BACKEND_SERVICE_FAILURE });
  });
});
