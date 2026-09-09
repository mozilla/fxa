/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import jwt from 'jsonwebtoken';
import {
  clearProviderKeyCache,
  getApplePublicKey,
  getGooglePublicKey,
} from './third-party-events';

jest.mock('jsonwebtoken', () => ({
  decode: jest.fn(),
  verify: jest.fn(),
}));

jest.mock('@fxa/shared/pem-jwk', () => ({
  jwk2pem: jest.fn(() => 'fake-pem'),
}));

const keySet = (kid: string) => ({ keys: [{ kid, n: 'x', e: 'AQAB' }] });
const ok = (body: any) =>
  ({ ok: true, json: async () => body }) as unknown as Response;

describe('third-party-events public key fetching', () => {
  let statsd: any;
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    statsd = { increment: jest.fn() };
    originalFetch = global.fetch;
    clearProviderKeyCache();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  describe('getApplePublicKey', () => {
    it('returns the pem for the key matching the token kid', async () => {
      (jwt.decode as jest.Mock).mockReturnValue({
        header: { kid: 'apple-kid' },
      });
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ keys: [{ kid: 'apple-kid', n: 'x', e: 'AQAB' }] }),
      } as unknown as Response);

      const result = await getApplePublicKey('token', statsd);

      expect(result).toEqual({ pem: 'fake-pem' });
    });

    it('serves a second request from cache', async () => {
      (jwt.decode as jest.Mock).mockReturnValue({ header: { kid: 'k' } });
      global.fetch = jest.fn().mockResolvedValue(ok(keySet('k')));

      await getApplePublicKey('token', statsd);
      await getApplePublicKey('token', statsd);

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('refetches once the cached response expires', async () => {
      (jwt.decode as jest.Mock).mockReturnValue({ header: { kid: 'k' } });
      global.fetch = jest.fn().mockResolvedValue(ok(keySet('k')));
      const now = jest.spyOn(Date, 'now').mockReturnValue(0);

      await getApplePublicKey('token', statsd);
      now.mockReturnValue(300_001);
      await getApplePublicKey('token', statsd);

      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('does not cache a 200 that carries no keys', async () => {
      (jwt.decode as jest.Mock).mockReturnValue({ header: { kid: 'k' } });
      global.fetch = jest
        .fn()
        .mockResolvedValueOnce(ok({ error: 'over quota' }))
        .mockResolvedValue(ok(keySet('k')));

      await expect(getApplePublicKey('token', statsd)).rejects.toThrow(
        'returned no usable keys'
      );
      // Had it been cached, this would fail for the next five minutes.
      expect(await getApplePublicKey('token', statsd)).toEqual({
        pem: 'fake-pem',
      });
    });

    it('collapses concurrent misses onto one request', async () => {
      (jwt.decode as jest.Mock).mockReturnValue({ header: { kid: 'k' } });
      global.fetch = jest.fn().mockResolvedValue(ok(keySet('k')));

      await Promise.all([
        getApplePublicKey('token', statsd),
        getApplePublicKey('token', statsd),
        getApplePublicKey('token', statsd),
      ]);

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('throws and increments statsd when the key endpoint responds non-ok', async () => {
      (jwt.decode as jest.Mock).mockReturnValue({
        header: { kid: 'apple-kid' },
      });
      global.fetch = jest
        .fn()
        .mockResolvedValue({ ok: false, status: 503 } as unknown as Response);

      await expect(getApplePublicKey('token', statsd)).rejects.toThrow(
        'Apple public key endpoint responded with 503'
      );
      expect(statsd.increment).toHaveBeenCalledWith('getApplePublicKey.error');
    });
  });

  describe('getGooglePublicKey', () => {
    it('returns the pem and issuer for the key matching the token kid', async () => {
      (jwt.decode as jest.Mock).mockReturnValue({
        header: { kid: 'google-kid' },
      });
      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            jwks_uri: 'https://example.com/jwks',
            issuer: 'https://accounts.google.com',
          }),
        } as unknown as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            keys: [{ kid: 'google-kid', n: 'x', e: 'AQAB' }],
          }),
        } as unknown as Response);

      const result = await getGooglePublicKey('token', statsd);

      expect(result).toEqual({
        pem: 'fake-pem',
        issuer: 'https://accounts.google.com',
      });
    });

    it('throws and increments statsd when the RISC config endpoint responds non-ok', async () => {
      (jwt.decode as jest.Mock).mockReturnValue({
        header: { kid: 'google-kid' },
      });
      global.fetch = jest
        .fn()
        .mockResolvedValue({ ok: false, status: 500 } as unknown as Response);

      await expect(getGooglePublicKey('token', statsd)).rejects.toThrow(
        'Failed to get Google public key'
      );
      expect(statsd.increment).toHaveBeenCalledWith('getGooglePublicKey.error');
    });

    it('throws when the jwks endpoint responds non-ok', async () => {
      (jwt.decode as jest.Mock).mockReturnValue({
        header: { kid: 'google-kid' },
      });
      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            jwks_uri: 'https://example.com/jwks',
            issuer: 'https://accounts.google.com',
          }),
        } as unknown as Response)
        .mockResolvedValueOnce({
          ok: false,
          status: 502,
        } as unknown as Response);

      await expect(getGooglePublicKey('token', statsd)).rejects.toThrow(
        'Failed to get Google public key'
      );
      expect(statsd.increment).toHaveBeenCalledWith('getGooglePublicKey.error');
    });
  });
});
