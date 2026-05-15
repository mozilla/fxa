/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AppError } from '@fxa/accounts/errors';
import { strategy } from './hawk-fxa-token';

const HAWK_HEADER = 'Hawk id="123", ts="123", nonce="123", mac="123"';

// Default test options for tests that don't care about throwOnFailure/statsd/kind.
// Strategy factory enforces these at construction; tests that exercise specific
// values pass them explicitly.
const testOptions = (overrides: any = {}) => ({
  throwOnFailure: true,
  statsd: { increment: jest.fn() },
  kind: 'sessionToken',
  ...overrides,
});

describe('lib/routes/auth-schemes/hawk-fxa-token', () => {
  describe('strategy factory — required options', () => {
    it('throws when options is missing', () => {
      expect(() => (strategy as any)(jest.fn())).toThrow(/options object/);
    });
    it('throws when throwOnFailure is missing', () => {
      expect(() =>
        (strategy as any)(jest.fn(), {
          statsd: { increment: jest.fn() },
          kind: 'sessionToken',
        })
      ).toThrow(/throwOnFailure/);
    });
    it('throws when statsd is missing', () => {
      expect(() =>
        (strategy as any)(jest.fn(), {
          throwOnFailure: true,
          kind: 'sessionToken',
        })
      ).toThrow(/statsd/);
    });
    it('throws when kind is missing', () => {
      expect(() =>
        (strategy as any)(jest.fn(), {
          throwOnFailure: true,
          statsd: { increment: jest.fn() },
        })
      ).toThrow(/kind/);
    });
  });

  it('should throw an error if no authorization header is provided', async () => {
    const getCredentialsFunc = jest.fn().mockResolvedValue(null);
    const authStrategy = strategy(getCredentialsFunc, testOptions())();

    const request = { headers: {}, auth: { mode: 'required' } };
    const h = { continue: Symbol('continue') };

    try {
      await authStrategy.authenticate(request, h);
      throw new Error('Should have thrown an error');
    } catch (err: any) {
      expect(err).toBeInstanceOf(AppError);
      const errorResponse = err.output.payload;
      expect(errorResponse.code).toBe(401);
      expect(errorResponse.errno).toBe(110);
      expect(errorResponse.message).toBe('Unauthorized for route');
      expect(errorResponse.detail).toBe('Token not found');
    }
  });

  it('should authenticate with parsable Hawk header and valid token', async () => {
    const getCredentialsFunc = jest
      .fn()
      .mockResolvedValue({ id: 'validToken' });
    const authStrategy = strategy(getCredentialsFunc, testOptions())();

    const request = {
      headers: { authorization: HAWK_HEADER },
      auth: { mode: 'required' },
    };
    const h = { authenticated: jest.fn() };

    await authStrategy.authenticate(request, h);
    expect(h.authenticated).toHaveBeenCalledTimes(1);
    expect(h.authenticated).toHaveBeenCalledWith({
      credentials: { id: 'validToken' },
    });
  });

  it('should not authenticate with parsable Hawk header and invalid token', async () => {
    const getCredentialsFunc = jest.fn().mockResolvedValue(null);
    const authStrategy = strategy(getCredentialsFunc, testOptions())();

    const request = {
      headers: { authorization: HAWK_HEADER },
      auth: { mode: 'required' },
    };
    const h = { continue: Symbol('continue') };

    try {
      await authStrategy.authenticate(request, h);
      throw new Error('Should have thrown an error');
    } catch (err: any) {
      expect(err).toBeInstanceOf(AppError);
      const errorResponse = err.output.payload;
      expect(errorResponse.code).toBe(401);
      expect(errorResponse.errno).toBe(110);
      expect(errorResponse.message).toBe('Unauthorized for route');
      expect(errorResponse.detail).toBe('Token not found');
    }
  });

  it('should not authenticate with unparseable Hawk header', async () => {
    const getCredentialsFunc = jest.fn().mockResolvedValue(null);
    const authStrategy = strategy(getCredentialsFunc, testOptions())();

    const request = {
      headers: { authorization: 'Invalid Hawk Header' },
      auth: { mode: 'required' },
    };
    const h = { continue: Symbol('continue') };

    try {
      await authStrategy.authenticate(request, h);
      throw new Error('Should have thrown an error');
    } catch (err: any) {
      const errorResponse = err.output.payload;
      expect(errorResponse.statusCode).toBe(401);
      expect(errorResponse.message).toBe('Unauthorized');
    }
  });

  describe('multi-strategy fallthrough (throwOnFailure=false)', () => {
    it('returns Boom (does not throw) when the auth header is missing in required mode', async () => {
      const authStrategy = strategy(
        jest.fn(),
        testOptions({ throwOnFailure: false })
      )();
      const request = { headers: {}, auth: { mode: 'required' } };
      const h = { continue: Symbol('continue') };

      const result = await authStrategy.authenticate(request, h);
      expect(result.isBoom).toBe(true);
      expect(result.output.statusCode).toBe(401);
      // errno=110 keeps a final 401 wire-compatible with the typed
      // "Token not found" response when no later strategy authenticates.
      expect(result.output.payload.errno).toBe(110);
    });

    it('returns Boom (does not throw) when the header is a Bearer, not a Hawk', async () => {
      const authStrategy = strategy(
        jest.fn(),
        testOptions({ throwOnFailure: false })
      )();
      const request = {
        headers: {
          authorization: `Bearer fxs_${'a'.repeat(64)}`,
        },
        auth: { mode: 'required' },
      };
      const h = { continue: Symbol('continue') };

      const result = await authStrategy.authenticate(request, h);
      expect(result.isBoom).toBe(true);
      expect(result.output.statusCode).toBe(401);
    });
  });

  describe('auth.strategy.used metric', () => {
    it('increments {scheme=hawk, kind=<kind>} on successful auth when statsd+kind are provided', async () => {
      const statsd = { increment: jest.fn() };
      const getCredentialsFunc = jest
        .fn()
        .mockResolvedValue({ id: 'validToken' });
      const authStrategy = strategy(
        getCredentialsFunc,
        testOptions({ statsd })
      )();

      const request = {
        headers: { authorization: HAWK_HEADER },
        auth: { mode: 'required' },
      };
      const h = { authenticated: jest.fn() };

      await authStrategy.authenticate(request, h);
      expect(statsd.increment).toHaveBeenCalledWith('auth.strategy.used', [
        'scheme:hawk',
        'kind:sessionToken',
      ]);
    });

    it('does not increment when auth fails', async () => {
      const statsd = { increment: jest.fn() };
      const authStrategy = strategy(
        jest.fn().mockResolvedValue(null),
        testOptions({ statsd })
      )();
      const request = {
        headers: { authorization: HAWK_HEADER },
        auth: { mode: 'required' },
      };
      const h = { continue: Symbol('continue') };

      try {
        await authStrategy.authenticate(request, h);
      } catch {
        // expected
      }
      expect(statsd.increment).not.toHaveBeenCalled();
    });
  });
});
