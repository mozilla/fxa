/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FxaOAuthVerifyStrategy } from './fxa-oauth-verify.strategy';
import { MockFxaOAuthConfig } from './fxa-oauth.config';
import { FxaVerifyResponseFactory } from './factories/verify-response.factory';

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

    const result = await new Promise((resolve, reject) => {
      (strategy as any)._verify(makeReq('valid-token'), (err: any, user: any) => {
        if (err) reject(err);
        else resolve(user);
      });
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      'http://localhost:9000/v1/verify',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ token: 'valid-token' }),
      })
    );
    expect(result).toEqual({
      sub: body.user,
      client_id: body.client_id,
      scope: body.scope,
    });
  });

  it('returns false when required scope is missing', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => FxaVerifyResponseFactory({ scope: ['profile'] }),
    });

    const result = await new Promise((resolve) => {
      (strategy as any)._verify(makeReq('token'), (_err: any, user: any) => {
        resolve(user);
      });
    });

    expect(result).toBe(false);
  });

  it('returns false when auth server rejects the token', async () => {
    fetchSpy.mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Invalid token' }),
    });

    const result = await new Promise((resolve) => {
      (strategy as any)._verify(makeReq('bad-token'), (_err: any, user: any) => {
        resolve(user);
      });
    });

    expect(result).toBe(false);
  });

  it('returns false when no Bearer token is provided', async () => {
    const result = await new Promise((resolve) => {
      (strategy as any)._verify(makeReq(), (_err: any, user: any) => {
        resolve(user);
      });
    });

    expect(result).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('returns false when auth server is unreachable', async () => {
    fetchSpy.mockRejectedValue(new Error('ECONNREFUSED'));

    const result = await new Promise((resolve) => {
      (strategy as any)._verify(makeReq('token'), (_err: any, user: any) => {
        resolve(user);
      });
    });

    expect(result).toBe(false);
  });
});
