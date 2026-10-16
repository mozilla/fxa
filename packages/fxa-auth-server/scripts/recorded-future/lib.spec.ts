/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import http from 'http';
import createClient from 'openapi-fetch';
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

    it('drops credentials marked type "clear" but missing a clear_text_value', async () => {
      // Regression: such a credential could pass a naive `type === 'clear'`
      // filter while having no usable cleartext value, then reach
      // Buffer.from(undefined) and abort the entire run.
      const kept = {
        subject: 'a@b.com',
        exposed_secret: {
          details: { clear_text_value: 'abc' },
          type: 'clear',
        },
      };
      client.POST.mockResolvedValue({
        data: {
          identities: [
            {
              credentials: [
                kept,
                // details present but no clear_text_value
                {
                  subject: 'c@d.com',
                  exposed_secret: { type: 'clear', details: {} },
                },
                // no details at all
                { subject: 'e@f.com', exposed_secret: { type: 'clear' } },
              ],
            },
          ],
        },
      });
      const lookupFn = lib.createCredentialsLookupFn(client as any);
      const res = await lookupFn(
        [
          { login: 'a@b.com', domain: 'quux.io' },
          { login: 'c@d.com', domain: 'quux.io' },
          { login: 'e@f.com', domain: 'quux.io' },
        ],
        { first_downloaded_gte: '2025-04-15' }
      );

      expect(res).toEqual([kept]);
    });

    it('drops credentials with an unusable clear_text_value or subject', async () => {
      const kept = {
        subject: 'a@b.com',
        exposed_secret: { type: 'clear', details: { clear_text_value: 'abc' } },
      };
      const clear = (
        clear_text_value: unknown,
        subject: unknown = 'c@d.com'
      ) => ({
        subject,
        exposed_secret: { type: 'clear', details: { clear_text_value } },
      });
      client.POST.mockResolvedValue({
        data: {
          identities: [
            {
              credentials: [
                kept,
                clear(''),
                clear(null),
                clear(123),
                clear({ value: 'abc' }),
                { exposed_secret: clear('abc').exposed_secret },
                clear('abc', ''),
                clear('abc', 42),
                null,
              ],
            },
          ],
        },
      });
      const lookupFn = lib.createCredentialsLookupFn(client as any);
      const res = await lookupFn([{ login: 'a@b.com', domain: 'quux.io' }], {
        first_downloaded_gte: '2025-04-15',
      });

      expect(res).toEqual([kept]);
    });

    it.each([
      ['undefined data', undefined],
      ['identities is not an array', { identities: { credentials: [] } }],
      ['credentials is not an array', { identities: [{ credentials: 'x' }] }],
      ['an identity is null', { identities: [null] }],
    ])('returns no credentials when %s', async (_, data) => {
      client.POST.mockResolvedValue({ data });
      const lookupFn = lib.createCredentialsLookupFn(client as any);
      const res = await lookupFn([{ login: 'a@b.com', domain: 'quux.io' }], {
        first_downloaded_gte: '2025-04-15',
      });

      expect(res).toEqual([]);
    });

    it('does not dedupe different login and password pairs with the same concatenation', async () => {
      const first = {
        subject: 'a@b.co',
        exposed_secret: { type: 'clear', details: { clear_text_value: 'mx' } },
      };
      const second = {
        subject: 'a@b.com',
        exposed_secret: { type: 'clear', details: { clear_text_value: 'x' } },
      };
      client.POST.mockResolvedValue({
        data: { identities: [{ credentials: [first, second] }] },
      });
      const lookupFn = lib.createCredentialsLookupFn(client as any);
      const res = await lookupFn([{ login: 'a@b.com', domain: 'quux.io' }], {
        first_downloaded_gte: '2025-04-15',
      });

      expect(res).toEqual([first, second]);
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

  describe('Retry-After', () => {
    const resp = (status: number, retryAfter?: string) =>
      new Response('{}', {
        status,
        headers: retryAfter ? { 'retry-after': retryAfter } : {},
      });
    const req = () =>
      new Request('http://localhost/x', { method: 'POST', body: '{"a":1}' });

    it('parses delay-seconds and HTTP-date values', () => {
      const now = Date.parse('2026-10-06T00:00:00Z');
      expect(lib.parseRetryAfterMs('7', now)).toBe(7000);
      expect(lib.parseRetryAfterMs('Tue, 06 Oct 2026 00:00:30 GMT', now)).toBe(
        30000
      );
      expect(lib.parseRetryAfterMs('Mon, 05 Oct 2026 00:00:00 GMT', now)).toBe(
        0
      );
      expect(lib.parseRetryAfterMs('soon', now)).toBeUndefined();
      expect(lib.parseRetryAfterMs(null, now)).toBeUndefined();
    });

    it('waits for Retry-After on 429 and 503, then retries', async () => {
      const fetchFn = jest
        .fn()
        .mockResolvedValueOnce(resp(429, '2'))
        .mockResolvedValueOnce(resp(503, '1'))
        .mockResolvedValueOnce(resp(200));
      const sleep = jest.fn().mockResolvedValue(undefined);
      const res = await lib.createRetryAfterFetch({ fetchFn, sleep })(req());
      expect(res.status).toBe(200);
      expect(fetchFn).toHaveBeenCalledTimes(3);
      expect(sleep.mock.calls).toEqual([[2000], [1000]]);
    });

    it.each([
      ['429 without Retry-After', 429, undefined, 1],
      ['500 with Retry-After', 500, '1', 1],
      ['Retry-After past the cap', 429, '600', 1],
      ['429 after maxRetries', 429, '1', 3],
      ['503 after maxRetries', 503, '1', 3],
    ])(
      'returns the error response: %s',
      async (_, status, retryAfter, calls) => {
        const sleep = jest.fn().mockResolvedValue(undefined);
        const fetchFn = jest
          .fn()
          .mockImplementation(async () => resp(status, retryAfter));
        const res = await lib.createRetryAfterFetch({
          fetchFn,
          sleep,
          maxRetries: 2,
        })(req());
        expect(res.status).toBe(status);
        expect(fetchFn).toHaveBeenCalledTimes(calls);
      }
    );

    it('resends the POST body through a real openapi-fetch client', async () => {
      const bodies: string[] = [];
      const server = http.createServer((rq, rs) => {
        let b = '';
        rq.on('data', (c) => (b += c));
        rq.on('end', () => {
          bodies.push(b);
          if (bodies.length === 1) {
            rs.writeHead(429, { 'retry-after': '0' }).end('{"message":"slow"}');
          } else {
            rs.writeHead(200, { 'content-type': 'application/json' }).end(
              '{"identities":[],"count":0}'
            );
          }
        });
      });
      await new Promise<void>((r) => server.listen(0, r));
      try {
        const { port } = server.address() as { port: number };
        const client = createClient<any>({
          baseUrl: `http://127.0.0.1:${port}`,
          fetch: lib.createRetryAfterFetch(),
        });
        const data = await lib.createCredentialsSearchFn(client)(payload);
        expect(data).toEqual({ identities: [], count: 0 });
        expect(bodies).toEqual([
          JSON.stringify(payload),
          JSON.stringify(payload),
        ]);
      } finally {
        await new Promise((r) => server.close(r));
      }
    });
  });
});
