/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AppError } from '@fxa/accounts/errors';
import { strategy } from './hawk-fxa-token';

const HAWK_HEADER = 'Hawk id="123", ts="123", nonce="123", mac="123"';

describe('lib/routes/auth-schemes/hawk-fxa-token', () => {
  it('should throw an error if no authorization header is provided', async () => {
    const getCredentialsFunc = jest.fn().mockResolvedValue(null);
    const authStrategy = strategy(getCredentialsFunc)();

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
    const authStrategy = strategy(getCredentialsFunc)();

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
    const authStrategy = strategy(getCredentialsFunc)();

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
    const authStrategy = strategy(getCredentialsFunc)();

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
      const authStrategy = strategy(jest.fn(), { throwOnFailure: false })();
      const request = { headers: {}, auth: { mode: 'required' } };
      const h = { continue: Symbol('continue') };

      const result = await authStrategy.authenticate(request, h);
      expect(result.isBoom).toBe(true);
      expect(result.output.statusCode).toBe(401);
    });

    it('returns Boom (does not throw) when the header is a Bearer, not a Hawk', async () => {
      const authStrategy = strategy(jest.fn(), { throwOnFailure: false })();
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
      const authStrategy = strategy(getCredentialsFunc, {
        statsd,
        kind: 'sessionToken',
      })();

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
      const authStrategy = strategy(jest.fn().mockResolvedValue(null), {
        statsd,
        kind: 'sessionToken',
      })();
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
