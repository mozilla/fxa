/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FxaOAuthVerifyStrategy } from './fxa-oauth-verify.strategy';
import { MockFxaOAuthConfig } from './fxa-oauth.config';
import { FxaVerifyResponseFactory } from './factories/verify-response.factory';
import {
  NoBearerTokenError,
  OAuthTokenRejectedError,
  OAuthVerifyNetworkError,
  OAuthVerifyResponseParseError,
  OAuthVerifyResponseSchemaError,
  OAuthVerifyServerError,
  VerifyInsufficientScopeError,
} from './fxa-oauth.error';

const mockConfig = {
  ...MockFxaOAuthConfig,
  fxaOAuthServerUrl: 'http://localhost:9000',
};

function makeReq(token?: string) {
  return {
    headers: {
      authorization: token ? `Bearer ${token}` : undefined,
    },
  } as any;
}

/** Run the passport verify callback and capture (user, info). */
function runVerify(
  strategy: FxaOAuthVerifyStrategy,
  req: any
): Promise<{ user: any; info: any }> {
  return new Promise((resolve, reject) => {
    (strategy as any)._verify(req, (err: any, user: any, info: any) => {
      if (err) reject(err);
      else resolve({ user, info });
    });
  });
}

describe('FxaOAuthVerifyStrategy', () => {
  let strategy: FxaOAuthVerifyStrategy;
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    strategy = new FxaOAuthVerifyStrategy(mockConfig);
    fetchSpy = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('returns mapped claims for a valid token with required scope', async () => {
    const body = FxaVerifyResponseFactory({
      scope: [MockFxaOAuthConfig.fxaOAuthRequiredScope],
    });
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => body,
    });

    const { user } = await runVerify(strategy, makeReq('valid-token'));

    expect(fetchSpy).toHaveBeenCalledWith(
      'http://localhost:9000/v1/verify',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ token: 'valid-token' }),
      })
    );
    expect(user).toEqual({
      sub: body.user,
      client_id: body.client_id,
      scope: body.scope,
    });
  });

  it('fails with VerifyInsufficientScopeError when required scope is missing', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => FxaVerifyResponseFactory({ scope: ['profile'] }),
    });

    const { user, info } = await runVerify(strategy, makeReq('token'));

    expect(user).toBe(false);
    expect(info).toBeInstanceOf(VerifyInsufficientScopeError);
  });

  it('fails with OAuthTokenRejectedError on a 4xx from the auth server', async () => {
    fetchSpy.mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Invalid token' }),
    });

    const { user, info } = await runVerify(strategy, makeReq('bad-token'));

    expect(user).toBe(false);
    expect(info).toBeInstanceOf(OAuthTokenRejectedError);
    expect(info.message).toContain('401');
  });

  it('fails with OAuthVerifyServerError on a 5xx from the auth server', async () => {
    fetchSpy.mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({ message: 'Service Unavailable' }),
    });

    const { user, info } = await runVerify(strategy, makeReq('token'));

    expect(user).toBe(false);
    expect(info).toBeInstanceOf(OAuthVerifyServerError);
    expect(info.message).toContain('503');
  });

  it('fails with OAuthVerifyResponseSchemaError when the response fails schema validation', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => ({ unexpected: 'shape' }),
    });

    const { user, info } = await runVerify(strategy, makeReq('token'));

    expect(user).toBe(false);
    expect(info).toBeInstanceOf(OAuthVerifyResponseSchemaError);
  });

  it('fails with OAuthVerifyResponseParseError when the body is not JSON', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => {
        throw new Error('Unexpected token < in JSON');
      },
    });

    const { user, info } = await runVerify(strategy, makeReq('token'));

    expect(user).toBe(false);
    expect(info).toBeInstanceOf(OAuthVerifyResponseParseError);
  });

  it('fails with NoBearerTokenError when no Bearer token is provided', async () => {
    const { user, info } = await runVerify(strategy, makeReq());

    expect(user).toBe(false);
    expect(info).toBeInstanceOf(NoBearerTokenError);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('fails with OAuthVerifyNetworkError when the auth server is unreachable', async () => {
    fetchSpy.mockRejectedValue(new Error('ECONNREFUSED'));

    const { user, info } = await runVerify(strategy, makeReq('token'));

    expect(user).toBe(false);
    expect(info).toBeInstanceOf(OAuthVerifyNetworkError);
  });
});
