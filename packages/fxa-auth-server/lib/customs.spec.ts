/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const mocks = require('../test/mocks');
const { AppError: error } = require('@fxa/accounts/errors');

const Customs = require('./customs');
const configModule = require('../config');

describe('Customs', () => {
  const statsd = {
    increment: () => {},
  };
  const log = {
    error() {},
  };

  let request: any;
  let ip: string;
  let email: string;
  let uid: string;
  let ip_uid: string;
  let ip_email: string;
  const action = 'accountCreate';

  beforeEach(() => {
    jest.spyOn(statsd, 'increment');
    request = newRequest();
    ip = request.app.clientAddress;
    email = newEmail();
    uid = '12345';
    ip_uid = `${ip}_${uid}`;
    ip_email = `${ip}_${email}`;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('no-ops when the rate-limit library is absent', async () => {
    const customs = new Customs(log, error, statsd);

    expect(await customs.check(request, email, action)).toBeUndefined();
    expect(
      await customs.checkAuthenticated(request, uid, email, action)
    ).toBeUndefined();
    expect(await customs.checkIpOnly(request, action)).toBeUndefined();
    expect(
      await customs.checkToken(request, 'tokenExchange', 'a'.repeat(64))
    ).toBeUndefined();
    expect(await customs.reset(request, email)).toBeUndefined();
    expect(customs.v2Enabled()).toBe(false);
  });

  it('treats flag() as a no-op', async () => {
    const customs = new Customs(log, error, statsd);
    expect(await customs.flag(ip, { email, uid })).toBeUndefined();
  });

  describe('customs v2', () => {
    const mockRateLimit = {
      check: jest.fn(),
      skip: jest.fn(),
      supportsAction: jest.fn(),
      unblock: jest.fn(),
    };

    const customs = new Customs(log, error, statsd, mockRateLimit);

    beforeEach(() => {
      mockRateLimit.check = jest.fn();
      mockRateLimit.skip = jest.fn(() => false);
      mockRateLimit.supportsAction = jest.fn(() => true);
      mockRateLimit.unblock = jest.fn(async () => Promise.resolve());
      const originalGet = configModule.config.get.bind(configModule.config);
      jest
        .spyOn(configModule.config, 'get')
        .mockImplementation((...args: unknown[]) => {
          const key = args[0];
          if (key === 'rateLimit.emailAliasNormalization') {
            return JSON.stringify([
              { domain: 'mozilla.com', regex: '\\+.*', replace: '' },
            ]);
          }
          return originalGet(key);
        });
      Customs._reloadEmailNormalization();
    });

    it('can allow checkAccountStatus with rate-limit lib', async () => {
      mockRateLimit.check = jest.fn(async () => {
        return await Promise.resolve(null);
      });
      await customs.checkAuthenticated(
        request,
        uid,
        email,
        'accountStatusCheck'
      );

      expect(mockRateLimit.supportsAction).toHaveBeenCalledTimes(1);
      expect(mockRateLimit.check).toHaveBeenCalledTimes(1);
      expect(mockRateLimit.check).toHaveBeenCalledWith('accountStatusCheck', {
        ip,
        email,
        uid,
        ip_email,
        ip_uid,
      });
    });

    it('can block checkAccountStatus with rate-limit lib', async () => {
      mockRateLimit.check = jest.fn(async (action: string) => {
        if (action === 'accountStatusCheck') {
          return await Promise.resolve({
            retryAfter: 1000,
            reason: 'too-many-attempts',
          });
        }
        return null;
      });

      let customsError: any = undefined;
      try {
        await customs.check(request, email, 'accountStatusCheck');
      } catch (err) {
        customsError = err;
      }

      expect(customsError).toBeDefined();
      expect(customsError.errno).toBe(114);
      expect(customsError.output.payload.error).toBe('Too Many Requests');
      expect(customsError.output.payload.message).toBe(
        'Client has sent too many requests'
      );

      expect(mockRateLimit.supportsAction).toHaveBeenCalledTimes(2);
      expect(mockRateLimit.supportsAction).toHaveBeenCalledWith(
        'accountStatusCheck'
      );
      expect(mockRateLimit.supportsAction).toHaveBeenCalledWith('unblockEmail');

      expect(mockRateLimit.check).toHaveBeenCalledTimes(2);
      expect(mockRateLimit.check).toHaveBeenCalledWith(
        'accountStatusCheck',
        expect.objectContaining({ ip, email, ip_email })
      );
      expect(mockRateLimit.check).toHaveBeenCalledWith(
        'unblockEmail',
        expect.objectContaining({ ip, email, ip_email })
      );
    });

    it('passes without a check when the action has no rule', async () => {
      mockRateLimit.supportsAction = jest.fn(() => false);

      await customs.check(request, email, 'accountStatusCheck');

      expect(mockRateLimit.check).toHaveBeenCalledTimes(0);
      expect(statsd.increment).toHaveBeenCalledWith('customs.check.v1', [
        'action:accountStatusCheck',
      ]);
    });

    it('reports the check and its outcome to statsd', async () => {
      mockRateLimit.check = jest.fn(async () => Promise.resolve(null));

      await customs.checkIpOnly(request, 'accountStatusCheck');

      expect(statsd.increment).toHaveBeenCalledWith('customs.check.v2', [
        'action:accountStatusCheck',
      ]);
      expect(statsd.increment).toHaveBeenCalledWith(
        'customs.request.v2.checkIpOnly',
        { action: 'accountStatusCheck', block: false, blockReason: '' }
      );
    });

    it('can skip certain emails, ips, and uids', async () => {
      mockRateLimit.skip = jest.fn(() => true);
      mockRateLimit.check = jest.fn(async () => {
        return await Promise.resolve({
          retryAfter: 1000,
          reason: 'too-many-attempts',
        });
      });

      await customs.check(request, email, 'accountStatusCheck');

      expect(mockRateLimit.skip).toHaveBeenCalledWith(
        'accountStatusCheck',
        { ip, email, ip_email },
        email
      );
      expect(mockRateLimit.check).toHaveBeenCalledTimes(0);
    });

    it('passes the non-normalized email to skip', async () => {
      mockRateLimit.check = jest.fn(async () => Promise.resolve(null));

      const emailWithAlias = 'user+srl1@mozilla.com';

      await customs.check(request, emailWithAlias, 'accountStatusCheck');

      expect(mockRateLimit.skip).toHaveBeenCalledWith(
        'accountStatusCheck',
        expect.objectContaining({ email: 'user@mozilla.com' }),
        emailWithAlias
      );
    });

    it('normalizes emails with plus aliases for configured domains', async () => {
      mockRateLimit.check = jest.fn(async () => Promise.resolve(null));

      const emailWithAlias = 'user+alias@mozilla.com';
      const normalizedEmail = 'user@mozilla.com';
      const normalizedIpEmail = `${ip}_${normalizedEmail}`;

      await customs.check(request, emailWithAlias, 'accountStatusCheck');

      expect(mockRateLimit.check).toHaveBeenCalledWith(
        'accountStatusCheck',
        expect.objectContaining({
          ip,
          email: normalizedEmail,
          ip_email: normalizedIpEmail,
        })
      );
    });

    it('normalizes emails with different cases', async () => {
      mockRateLimit.check = jest.fn(async () => Promise.resolve(null));

      const mixedCaseEmail = 'User+Alias@Mozilla.COM';
      const normalizedEmail = 'user@mozilla.com';
      const normalizedIpEmail = `${ip}_${normalizedEmail}`;

      await customs.check(request, mixedCaseEmail, 'accountStatusCheck');

      expect(mockRateLimit.check).toHaveBeenCalledWith(
        'accountStatusCheck',
        expect.objectContaining({
          ip,
          email: normalizedEmail,
          ip_email: normalizedIpEmail,
        })
      );
    });

    it('does not remove aliases for non-configured domains', async () => {
      mockRateLimit.check = jest.fn(async () => Promise.resolve(null));

      const emailWithAlias = 'user+alias@example.com';
      const normalizedEmail = 'user+alias@example.com';
      const normalizedIpEmail = `${ip}_${normalizedEmail}`;

      await customs.check(request, emailWithAlias, 'accountStatusCheck');

      expect(mockRateLimit.check).toHaveBeenCalledWith(
        'accountStatusCheck',
        expect.objectContaining({
          ip,
          email: normalizedEmail,
          ip_email: normalizedIpEmail,
        })
      );
    });

    it('lowercases emails for all domains', async () => {
      mockRateLimit.check = jest.fn(async () => Promise.resolve(null));

      const mixedCaseEmail = 'User@Example.COM';
      const normalizedEmail = 'user@example.com';
      const normalizedIpEmail = `${ip}_${normalizedEmail}`;

      await customs.check(request, mixedCaseEmail, 'accountStatusCheck');

      expect(mockRateLimit.check).toHaveBeenCalledWith(
        'accountStatusCheck',
        expect.objectContaining({
          ip,
          email: normalizedEmail,
          ip_email: normalizedIpEmail,
        })
      );
    });

    it('checks a token hash alongside the ip on checkToken', async () => {
      const tokenHash = 'a'.repeat(64);
      mockRateLimit.check = jest.fn(async () => Promise.resolve(null));

      await customs.checkToken(request, 'tokenExchange', tokenHash);

      expect(mockRateLimit.check).toHaveBeenCalledWith('tokenExchange', {
        ip,
        token: tokenHash,
      });
    });

    it('throws a 429 in milliseconds when checkToken is blocked', async () => {
      const tokenHash = 'a'.repeat(64);
      mockRateLimit.check = jest.fn(async () =>
        Promise.resolve({ retryAfter: 900000, reason: 'too-many-attempts' })
      );

      const err: any = await customs
        .checkToken(request, 'tokenExchange', tokenHash)
        .catch((e: any) => e);

      expect(err.errno).toBe(114);
      expect(err.output.statusCode).toBe(429);
      expect(err.output.payload.retryAfter).toBe(900000);
      expect(err.output.headers['retry-after']).toBe('900');
    });

    it('unblocks the normalized email and ip_email on reset', async () => {
      const emailWithAlias = 'user+alias@mozilla.com';
      const normalizedEmail = 'user@mozilla.com';

      await customs.reset(request, emailWithAlias);

      expect(mockRateLimit.unblock).toHaveBeenCalledTimes(1);
      expect(mockRateLimit.unblock).toHaveBeenCalledWith({
        email: normalizedEmail,
        ip_email: `${ip}_${normalizedEmail}`,
      });
    });

    it('does not unblock the raw ip on reset', async () => {
      await customs.reset(request, 'user@mozilla.com');

      expect(mockRateLimit.unblock).toHaveBeenCalledTimes(1);
      const opts = mockRateLimit.unblock.mock.calls[0][0];
      expect(opts).not.toHaveProperty('ip');
    });
  });
});

function newEmail() {
  return `${Math.random().toString().substr(2)}@example.com`;
}

function newIp() {
  return [
    `${Math.floor(Math.random() * 256)}`,
    `${Math.floor(Math.random() * 256)}`,
    `${Math.floor(Math.random() * 256)}`,
    `${Math.floor(Math.random() * 256)}`,
  ].join('.');
}

function newRequest() {
  return mocks.mockRequest({
    clientAddress: newIp(),
    headers: {},
    query: {},
    payload: {},
  });
}
