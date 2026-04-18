/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as lib from './lib';
import { SearchResultIdentity } from './lib';
import { AppError, ERRNO } from '@fxa/accounts/errors';

describe('Recorded Future credentials search and reset script lib', () => {
  const payload = { domain: 'login.example.com', limit: 10 };

  beforeEach(() => {});

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('credentials search function', () => {
    let client: { POST: jest.Mock };

    beforeEach(() => {
      client = { POST: jest.fn() };
    });

    it('returns the data on success', async () => {
      const data = { next_offset: 'letsgoooo' };
      client.POST.mockResolvedValue({ data });
      const searchFn = lib.createCredentialsSearchFn(client as any);
      const res = await searchFn(payload);

      expect(client.POST).toHaveBeenCalledTimes(1);
      expect(client.POST).toHaveBeenCalledWith('/identity/credentials/search', {
        body: payload,
      });
      expect(res).toEqual(data);
    });

    it('throws the API returned error', async () => {
      const error = 'oops';
      client.POST.mockResolvedValue({ error });
      const searchFn = lib.createCredentialsSearchFn(client as any);

      try {
        await searchFn(payload);
        throw new Error('should have thrown');
      } catch (err: any) {
        expect(err.message).toContain('oops');
      }
    });
  });

  describe('fetch all credentials search results function', () => {
    let client: { POST: jest.Mock };

    beforeEach(() => {
      client = { POST: jest.fn() };
    });

    it('fetches all the paginated results', async () => {
      const firstResponse = {
        identities: ['foo', 'wibble'],
        count: payload.limit,
        next_offset: 'MOAR',
      };
      const secondResponse = {
        identities: ['quux', 'bar'],
        count: payload.limit - 1,
        next_offset: 'MISLEADING_MOAR',
      };
      client.POST.mockResolvedValueOnce({
        data: firstResponse,
      }).mockResolvedValueOnce({ data: secondResponse });
      const searchFn = lib.createCredentialsSearchFn(client as any);

      const res = await lib.fetchAllCredentialSearchResults(searchFn, payload);

      expect(client.POST).toHaveBeenCalledTimes(2);
      expect(client.POST).toHaveBeenCalledWith('/identity/credentials/search', {
        body: payload,
      });
      expect(client.POST).toHaveBeenCalledWith('/identity/credentials/search', {
        body: { ...payload, offset: firstResponse.next_offset },
      });
      expect(res).toEqual([
        ...firstResponse.identities,
        ...secondResponse.identities,
      ] as unknown as SearchResultIdentity[]);
    });
  });

  describe('find account function', () => {
    it('returns an existing account', async () => {
      const accountFn = jest.fn().mockResolvedValue({ uid: '9001' });
      const findAccount = lib.createFindAccountFn(accountFn);
      const acct = await findAccount('quux@example.gg');

      expect(accountFn).toHaveBeenCalledTimes(1);
      expect(accountFn).toHaveBeenCalledWith('quux@example.gg');
      expect(acct).toEqual({ uid: '9001' } as any);
    });

    it('returns undefined when no account found', async () => {
      const accountFn = jest.fn().mockImplementation(() => {
        throw AppError.unknownAccount();
      });
      const findAccount = lib.createFindAccountFn(accountFn);

      const res = await findAccount('quux@example.gg');
      expect(accountFn).toHaveBeenCalledTimes(1);
      expect(accountFn).toHaveBeenCalledWith('quux@example.gg');
      expect(res).toBeUndefined();
    });

    it('re-throws errors', async () => {
      const accountFn = jest.fn().mockImplementation(() => {
        throw AppError.invalidRequestBody();
      });
      const findAccount = lib.createFindAccountFn(accountFn);

      try {
        await findAccount('quux@example.gg');
        throw new Error('should have thrown');
      } catch (err: any) {
        expect(accountFn).toHaveBeenCalledTimes(1);
        expect(accountFn).toHaveBeenCalledWith('quux@example.gg');
        expect(err.errno).toBe(ERRNO.INVALID_JSON);
      }
    });
  });

  describe('has totp 2fa function', () => {
    it('returns true when TOTP token exists', async () => {
      const totpTokenFn = jest.fn().mockResolvedValue(undefined);
      const hasTotpToken = lib.createHasTotp2faFn(totpTokenFn);
      const res = await hasTotpToken({ uid: '9001' } as any);

      expect(totpTokenFn).toHaveBeenCalledTimes(1);
      expect(totpTokenFn).toHaveBeenCalledWith('9001');
      expect(res).toBe(true);
    });

    it('returns false when TOTP token not found', async () => {
      const totpTokenFn = jest
        .fn()
        .mockRejectedValue(AppError.totpTokenNotFound());
      const hasTotpToken = lib.createHasTotp2faFn(totpTokenFn);
      const res = await hasTotpToken({ uid: '9001' } as any);

      expect(totpTokenFn).toHaveBeenCalledTimes(1);
      expect(totpTokenFn).toHaveBeenCalledWith('9001');
      expect(res).toBe(false);
    });

    it('re-throws errors', async () => {
      const totpTokenFn = jest
        .fn()
        .mockRejectedValue(AppError.invalidRequestBody());
      const hasTotpToken = lib.createHasTotp2faFn(totpTokenFn);

      try {
        await hasTotpToken({ uid: '9001' } as any);
        throw new Error('should have thrown');
      } catch (err: any) {
        expect(totpTokenFn).toHaveBeenCalledTimes(1);
        expect(totpTokenFn).toHaveBeenCalledWith('9001');
        expect(err.errno).toBe(ERRNO.INVALID_JSON);
      }
    });
  });

  describe('credentials lookup function', () => {
    let client: { POST: jest.Mock };

    beforeEach(() => {
      client = { POST: jest.fn() };
    });

    it('returns leaked credentials with cleartext password', async () => {
      const expected = [
        {
          subject: 'a@b.com',
          exposed_secret: {
            details: { clear_text_value: 'abc' },
            type: 'clear',
          },
        },
        {
          subject: 'fizz@bar.gg',
          exposed_secret: {
            details: { clear_text_value: 'buzz' },
            type: 'clear',
          },
        },
      ];
      const filtered = [
        {
          subject: 'a@b.com',
          exposed_secret: {
            details: { clear_text_value: 'abc' },
            type: 'clear',
          },
        },
        {
          subject: 'x@y.com',
          exposed_secret: {
            type: 'hash',
          },
        },
      ];
      client.POST.mockResolvedValue({
        data: {
          identities: [
            { credentials: [expected[0], filtered[0]] },
            { credentials: [expected[1]] },
            { credentials: [filtered[1]] },
          ],
        },
      });
      const lookupFn = lib.createCredentialsLookupFn(client as any);
      const subjects = [
        { login: 'a@b.com', domain: 'quux.io' },
        { login: 'x@y.com', domain: 'quux.io' },
        { login: 'fizz@bar.gg', domain: 'quux.io' },
      ];
      const res = await lookupFn(subjects, {
        first_downloaded_gte: '2025-04-15',
      });
      expect(client.POST).toHaveBeenCalledTimes(1);
      expect(client.POST).toHaveBeenCalledWith('/identity/credentials/lookup', {
        body: {
          subjects_login: subjects,
          filter: { first_downloaded_gte: '2025-04-15' },
        },
      });
      expect(res).toEqual(expected);
    });

    it('limits the subjects login in API call', async () => {
      client.POST.mockResolvedValue({ data: { identities: [] } });
      const lookupFn = lib.createCredentialsLookupFn(client as any);
      const subjects = Array(555);
      await lookupFn(subjects, {
        first_downloaded_gte: '2025-04-15',
      });

      expect(client.POST).toHaveBeenCalledTimes(2);
    });
  });

  describe('verify password function', () => {
    it('checks the leaked password', async () => {
      const getCredentials = jest.fn().mockResolvedValue({ authPW: 'wibble' });
      const checkPassword = jest.fn().mockResolvedValue({ match: false });
      const verifyHashStub = jest.fn().mockResolvedValue('quux');
      const Password = class {
        async verifyHash() {
          return verifyHashStub();
        }
      };
      const verifyPassword = lib.createVerifyPasswordFn(
        Password as any,
        checkPassword,
        getCredentials
      );
      const leakCredentials = {
        subject: 'fizz@bar.gg',
        exposed_secret: {
          details: { clear_text_value: 'buzz' },
          type: 'clear',
        },
      };
      const acct = {
        uid: '9001',
        authSalt: 'pepper',
        verifierVersion: 1,
      };
      const res = await verifyPassword(leakCredentials, acct as any);

      expect(getCredentials).toHaveBeenCalledTimes(1);
      expect(getCredentials).toHaveBeenCalledWith(acct, 'buzz');
      expect(verifyHashStub).toHaveBeenCalledTimes(1);
      expect(checkPassword).toHaveBeenCalledTimes(1);
      expect(checkPassword).toHaveBeenCalledWith('9001', 'quux');
      expect(res).toBe(false);
    });
  });
});
