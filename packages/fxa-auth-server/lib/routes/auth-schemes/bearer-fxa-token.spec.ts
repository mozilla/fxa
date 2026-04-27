/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AppError } from '@fxa/accounts/errors';
import { strategy, KIND_PREFIXES } from './bearer-fxa-token';

const HEX_64 = 'a'.repeat(64);

function makeReq(overrides: any = {}) {
  return {
    headers: {},
    auth: { mode: 'required' },
    route: { settings: { auth: {} } },
    ...overrides,
  };
}

function makeH() {
  return {
    continue: Symbol('continue'),
    authenticated: jest.fn((x) => x),
  };
}

async function expectAppErrorTokenNotFound(promise: Promise<any>) {
  try {
    await promise;
    throw new Error('Should have thrown');
  } catch (err: any) {
    expect(err).toBeInstanceOf(AppError);
    expect(err.output.payload.code).toBe(401);
    expect(err.output.payload.errno).toBe(110);
    expect(err.output.payload.detail).toBe('Token not found');
    expect(err.isMissing).toBe(true);
  }
}

describe('lib/routes/auth-schemes/bearer-fxa-token', () => {
  describe('strategy factory', () => {
    it('throws when given an unknown token kind', () => {
      expect(() => strategy('notARealKind' as any, jest.fn())).toThrow(
        /unknown token kind/
      );
    });

    it('accepts every documented kind', () => {
      for (const kind of Object.keys(KIND_PREFIXES)) {
        expect(() => strategy(kind as any, jest.fn())).not.toThrow();
      }
    });

    it('keyFetchToken and keyFetchTokenWithVerificationStatus share the fxk_ prefix', () => {
      // The client only derives one keyFetch credential; the with-verification
      // variant differs server-side only (different DB lookup). Splitting
      // prefixes would make /account/keys 401 on every Bearer request.
      expect(KIND_PREFIXES.keyFetchToken).toBe('fxk');
      expect(KIND_PREFIXES.keyFetchTokenWithVerificationStatus).toBe('fxk');
    });
  });

  describe('authenticate — happy path per kind', () => {
    it.each(Object.entries(KIND_PREFIXES))(
      'authenticates kind=%s with prefix=%s',
      async (kind, prefix) => {
        const token = { id: 'token-for-' + kind };
        const getCredentialsFunc = jest.fn().mockResolvedValue(token);
        const authStrategy = strategy(kind as any, getCredentialsFunc)(
          null as any,
          null as any
        );

        const req = makeReq({
          headers: { authorization: `Bearer ${prefix}_${HEX_64}` },
        });
        const h = makeH();

        await authStrategy.authenticate(req as any, h as any);

        expect(getCredentialsFunc).toHaveBeenCalledWith(HEX_64);
        expect(h.authenticated).toHaveBeenCalledWith({ credentials: token });
      }
    );
  });

  describe('authenticate — missing header', () => {
    it('continues when mode is optional', async () => {
      const getCredentialsFunc = jest.fn();
      const authStrategy = strategy('sessionToken', getCredentialsFunc)(
        null as any,
        null as any
      );

      const req = makeReq({ auth: { mode: 'optional' } });
      const h = makeH();

      const result = await authStrategy.authenticate(req as any, h as any);
      expect(result).toBe(h.continue);
      expect(getCredentialsFunc).not.toHaveBeenCalled();
    });

    it('throws in required mode when throwOnFailure=true (default)', async () => {
      const authStrategy = strategy('sessionToken', jest.fn())(
        null as any,
        null as any
      );
      const req = makeReq();
      const h = makeH();

      await expectAppErrorTokenNotFound(
        authStrategy.authenticate(req as any, h as any)
      );
    });

    it('returns Boom in required mode when throwOnFailure=false', async () => {
      const authStrategy = strategy('sessionToken', jest.fn(), {
        throwOnFailure: false,
      })(null as any, null as any);
      const req = makeReq();
      const h = makeH();

      const result = await authStrategy.authenticate(req as any, h as any);
      expect(result.isBoom).toBe(true);
      expect(result.output.statusCode).toBe(401);
    });
  });

  describe('authenticate — wrong header shape always falls through', () => {
    const rejectedHeaders: Array<[string, string]> = [
      ['plain Bearer hex (refresh-token collision)', `Bearer ${HEX_64}`],
      ['Hawk header', 'Hawk id="123", ts="123", nonce="123", mac="123"'],
      ['wrong prefix for kind', `Bearer fxpc_${HEX_64}`],
      ['mixed-case prefix', `Bearer FXS_${HEX_64}`],
      ['uppercase hex suffix', `Bearer fxs_${'A'.repeat(64)}`],
      ['too-short suffix', `Bearer fxs_${'a'.repeat(63)}`],
      ['too-long suffix', `Bearer fxs_${'a'.repeat(65)}`],
      ['non-hex suffix', `Bearer fxs_${'z'.repeat(64)}`],
      ['leading whitespace', ` Bearer fxs_${HEX_64}`],
      ['trailing whitespace', `Bearer fxs_${HEX_64} `],
      ['double space after Bearer', `Bearer  fxs_${HEX_64}`],
      ['lowercase scheme name', `bearer fxs_${HEX_64}`],
      ['missing underscore', `Bearer fxs${HEX_64}`],
    ];

    it.each(rejectedHeaders)(
      'returns Boom (does not throw) for %s',
      async (_label, authHeader) => {
        const getCredentialsFunc = jest.fn();
        const authStrategy = strategy('sessionToken', getCredentialsFunc)(
          null as any,
          null as any
        );

        const req = makeReq({ headers: { authorization: authHeader } });
        const h = makeH();

        const result = await authStrategy.authenticate(req as any, h as any);

        expect(result.isBoom).toBe(true);
        expect(result.output.statusCode).toBe(401);
        expect(getCredentialsFunc).not.toHaveBeenCalled();
      }
    );
  });

  describe('authenticate — prefix matches but lookup fails', () => {
    const authHeader = `Bearer fxs_${HEX_64}`;

    it('throws when throwOnFailure=true and lookup returns null', async () => {
      const getCredentialsFunc = jest.fn().mockResolvedValue(null);
      const authStrategy = strategy('sessionToken', getCredentialsFunc)(
        null as any,
        null as any
      );

      const req = makeReq({ headers: { authorization: authHeader } });
      const h = makeH();

      await expectAppErrorTokenNotFound(
        authStrategy.authenticate(req as any, h as any)
      );
      expect(getCredentialsFunc).toHaveBeenCalledWith(HEX_64);
    });

    it('returns Boom when throwOnFailure=false and lookup returns null', async () => {
      const getCredentialsFunc = jest.fn().mockResolvedValue(null);
      const authStrategy = strategy('sessionToken', getCredentialsFunc, {
        throwOnFailure: false,
      })(null as any, null as any);

      const req = makeReq({ headers: { authorization: authHeader } });
      const h = makeH();

      const result = await authStrategy.authenticate(req as any, h as any);
      expect(result.isBoom).toBe(true);
      expect(result.output.statusCode).toBe(401);
    });

    it('treats a thrown DB error as token-not-found', async () => {
      const getCredentialsFunc = jest
        .fn()
        .mockRejectedValue(new Error('DB down'));
      const authStrategy = strategy('sessionToken', getCredentialsFunc, {
        throwOnFailure: false,
      })(null as any, null as any);

      const req = makeReq({ headers: { authorization: authHeader } });
      const h = makeH();

      const result = await authStrategy.authenticate(req as any, h as any);
      expect(result.isBoom).toBe(true);
      expect(result.output.statusCode).toBe(401);
    });
  });

  describe('authenticate — postAuthenticate hook', () => {
    const authHeader = `Bearer fxs_${HEX_64}`;

    it('runs the hook with req and token on success', async () => {
      const token = { id: 't', tokenVerified: true };
      const postAuthenticate = jest.fn().mockResolvedValue(undefined);
      const authStrategy = strategy(
        'sessionToken',
        jest.fn().mockResolvedValue(token),
        { postAuthenticate }
      )(null as any, null as any);

      const req = makeReq({ headers: { authorization: authHeader } });
      const h = makeH();

      await authStrategy.authenticate(req as any, h as any);
      expect(postAuthenticate).toHaveBeenCalledWith(req, token);
      expect(h.authenticated).toHaveBeenCalledWith({ credentials: token });
    });

    it('propagates errors thrown by the hook', async () => {
      const token = { id: 't' };
      const guardErr = AppError.unverifiedAccount();
      const postAuthenticate = jest.fn().mockRejectedValue(guardErr);
      const authStrategy = strategy(
        'sessionToken',
        jest.fn().mockResolvedValue(token),
        { postAuthenticate }
      )(null as any, null as any);

      const req = makeReq({ headers: { authorization: authHeader } });
      const h = makeH();

      await expect(
        authStrategy.authenticate(req as any, h as any)
      ).rejects.toBe(guardErr);
      expect(h.authenticated).not.toHaveBeenCalled();
    });

    it('does not run the hook when lookup fails', async () => {
      const postAuthenticate = jest.fn();
      const authStrategy = strategy(
        'sessionToken',
        jest.fn().mockResolvedValue(null),
        { postAuthenticate, throwOnFailure: false }
      )(null as any, null as any);

      const req = makeReq({ headers: { authorization: authHeader } });
      const h = makeH();

      await authStrategy.authenticate(req as any, h as any);
      expect(postAuthenticate).not.toHaveBeenCalled();
    });
  });

  describe('auth.strategy.used metric', () => {
    const authHeader = `Bearer fxs_${HEX_64}`;

    it('increments {scheme=bearer, kind=<kind>} on successful auth when statsd is provided', async () => {
      const statsd = { increment: jest.fn() };
      const authStrategy = strategy(
        'sessionToken',
        jest.fn().mockResolvedValue({ id: 't' }),
        { statsd }
      )(null as any, null as any);

      const req = makeReq({ headers: { authorization: authHeader } });
      const h = makeH();

      await authStrategy.authenticate(req as any, h as any);
      expect(statsd.increment).toHaveBeenCalledWith('auth.strategy.used', [
        'scheme:bearer',
        'kind:sessionToken',
      ]);
    });

    it('does not increment when lookup returns null', async () => {
      const statsd = { increment: jest.fn() };
      const authStrategy = strategy(
        'sessionToken',
        jest.fn().mockResolvedValue(null),
        { statsd, throwOnFailure: false }
      )(null as any, null as any);

      const req = makeReq({ headers: { authorization: authHeader } });
      const h = makeH();

      await authStrategy.authenticate(req as any, h as any);
      expect(statsd.increment).not.toHaveBeenCalled();
    });

    it('does not increment when the postAuthenticate hook rejects', async () => {
      const statsd = { increment: jest.fn() };
      const authStrategy = strategy(
        'sessionToken',
        jest.fn().mockResolvedValue({ id: 't' }),
        {
          statsd,
          postAuthenticate: jest
            .fn()
            .mockRejectedValue(AppError.unverifiedAccount()),
        }
      )(null as any, null as any);

      const req = makeReq({ headers: { authorization: authHeader } });
      const h = makeH();

      await expect(
        authStrategy.authenticate(req as any, h as any)
      ).rejects.toBeInstanceOf(AppError);
      expect(statsd.increment).not.toHaveBeenCalled();
    });
  });

  describe('payload', () => {
    it('enforces payload:required', async () => {
      const authStrategy = strategy('sessionToken', jest.fn())(
        null as any,
        null as any
      );
      const req = makeReq({
        route: { settings: { auth: { payload: 'required' } } },
        payload: null,
      });
      const h = makeH();

      try {
        await (authStrategy.payload as any)(req as any, h as any);
        throw new Error('Should have thrown');
      } catch (err: any) {
        expect(err).toBeInstanceOf(AppError);
        expect(err.output.payload.code).toBe(401);
      }
    });

    it('continues when payload is not required', async () => {
      const authStrategy = strategy('sessionToken', jest.fn())(
        null as any,
        null as any
      );
      const req = makeReq();
      const h = makeH();

      const result = await (authStrategy.payload as any)(req as any, h as any);
      expect(result).toBe(h.continue);
    });
  });
});
