/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const mocks = require('../test/mocks');
const { AppError: error } = require('@fxa/accounts/errors');

const CUSTOMS_URL_REAL = 'http://localhost:7000';

const Customs = require('./customs');
const configModule = require('../config');

// Build a minimal fetch Response stand-in for the customs server.
function customsResponse(body: any, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response;
}

describe('Customs', () => {
  let customsNoUrl: any;
  let customsWithUrl: any;
  const statsd = {
    increment: () => {},
    timing: () => {},
    gauge: () => {},
  };
  const log = {
    trace: () => {},
    activityEvent: () => {},
    flowEvent: () => {},
    error() {},
  };

  let request: any;
  let ip: string;
  let email: string;
  let uid: string;
  let ip_uid: string;
  let ip_email: string;
  let action: string;
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    jest.spyOn(statsd, 'increment');
    jest.spyOn(statsd, 'timing');
    jest.spyOn(statsd, 'gauge');
    request = newRequest();
    ip = request.app.clientAddress;
    email = newEmail();
    uid = '12345';
    ip_uid = `${ip}_${uid}`;
    ip_email = `${ip}_${email}`;
    action = newAction();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("can create a customs object with url as 'none'", async () => {
    customsNoUrl = new Customs('none', log, error, statsd);
    expect(customsNoUrl).toBeTruthy();

    let result = await customsNoUrl.check(request, email, action);
    expect(result).toBeUndefined();

    result = await customsNoUrl.flag(ip, { email, uid });
    expect(result).toBeUndefined();

    result = await customsNoUrl.reset(request, email);
    expect(result).toBeUndefined();

    result = await customsNoUrl.checkIpOnly(request, action);
    expect(result).toBeUndefined();
  });

  it('posts a sanitized /check body and passes when not blocked', async () => {
    const customs = new Customs(CUSTOMS_URL_REAL, log, error, statsd);
    global.fetch = jest
      .fn()
      .mockResolvedValue(customsResponse({ block: false, retryAfter: 0 }));

    const result = await customs.check(request, email, action);
    expect(result).toBeUndefined();

    const [url, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe(`${CUSTOMS_URL_REAL}/check`);
    expect(init.method).toBe('POST');
    expect(init.headers).toEqual({ 'Content-Type': 'application/json' });
    expect(JSON.parse(init.body)).toEqual({
      ip,
      email,
      action,
      headers: request.headers,
      query: request.query,
      payload: request.payload,
    });
  });

  it('throws tooManyRequests (429) when a check is blocked with a retryAfter', async () => {
    const customs = new Customs(CUSTOMS_URL_REAL, log, error, statsd);
    global.fetch = jest
      .fn()
      .mockResolvedValue(customsResponse({ block: true, retryAfter: 10001 }));

    let err: any;
    try {
      await customs.check(request, email, action);
    } catch (e) {
      err = e;
    }
    expect(err.errno).toBe(error.ERRNO.THROTTLED);
    expect(err.message).toBe('Client has sent too many requests');
    expect(err.isBoom).toBeTruthy();
    expect(err.output.statusCode).toBe(429);
    expect(err.output.payload.retryAfter).toBe(10001);
    expect(err.output.headers['retry-after']).toBe('10001');
  });

  it('throws requestBlocked (400) when a check is blocked without a retryAfter', async () => {
    const customs = new Customs(CUSTOMS_URL_REAL, log, error, statsd);
    global.fetch = jest
      .fn()
      .mockResolvedValue(customsResponse({ block: true }));

    let err: any;
    try {
      await customs.check(request, email, action);
    } catch (e) {
      err = e;
    }
    expect(err.errno).toBe(error.ERRNO.REQUEST_BLOCKED);
    expect(err.message).toBe('The request was blocked for security reasons');
    expect(err.isBoom).toBeTruthy();
    expect(err.output.statusCode).toBe(400);
  });

  it('posts a sanitized /passwordReset body on reset', async () => {
    const customs = new Customs(CUSTOMS_URL_REAL, log, error, statsd);
    global.fetch = jest.fn().mockResolvedValue(customsResponse({}));

    await customs.reset(request, email);

    const [url, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe(`${CUSTOMS_URL_REAL}/passwordReset`);
    expect(JSON.parse(init.body)).toEqual({
      ip: request.app.clientAddress,
      email,
    });
  });

  it('posts ip and action to /checkIpOnly', async () => {
    const customs = new Customs(CUSTOMS_URL_REAL, log, error, statsd);
    global.fetch = jest
      .fn()
      .mockResolvedValue(customsResponse({ block: false, retryAfter: 0 }));

    const result = await customs.checkIpOnly(request, action);
    expect(result).toBeUndefined();

    const [url, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe(`${CUSTOMS_URL_REAL}/checkIpOnly`);
    expect(JSON.parse(init.body)).toEqual({ ip, action });
  });

  it('treats flag() as a no-op', async () => {
    const customs = new Customs(CUSTOMS_URL_REAL, log, error, statsd);
    expect(await customs.flag(ip, { email, uid })).toBeUndefined();
  });

  it('fails closed (backendServiceFailure) when the request rejects', async () => {
    const customs = new Customs(CUSTOMS_URL_REAL, log, error, statsd);
    global.fetch = jest.fn().mockRejectedValue(new Error('ECONNREFUSED'));

    await expect(customs.check(request, email, action)).rejects.toMatchObject({
      errno: error.ERRNO.BACKEND_SERVICE_FAILURE,
    });
    await expect(customs.reset(request, email)).rejects.toMatchObject({
      errno: error.ERRNO.BACKEND_SERVICE_FAILURE,
    });
  });

  it('fails closed (backendServiceFailure) on a non-ok response', async () => {
    const customs = new Customs(CUSTOMS_URL_REAL, log, error, statsd);
    global.fetch = jest.fn().mockResolvedValue(customsResponse('error', 500));

    await expect(customs.check(request, email, action)).rejects.toMatchObject({
      errno: error.ERRNO.BACKEND_SERVICE_FAILURE,
    });
  });

  it('makes a fresh request for each check rather than caching', async () => {
    const customs = new Customs(CUSTOMS_URL_REAL, log, error, statsd);
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(customsResponse({ block: false, retryAfter: 0 }))
      .mockResolvedValueOnce(
        customsResponse({ block: true, retryAfter: 10001 })
      );

    await customs.check(request, email, action);
    await expect(customs.check(request, email, action)).rejects.toMatchObject({
      output: { statusCode: 429 },
    });
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('posts a sanitized /checkAuthenticated body and throws 429 when blocked', async () => {
    const customs = new Customs(CUSTOMS_URL_REAL, log, error, statsd);
    const authUid = 'foo';
    const authEmail = 'bar@mozilla.com';
    action = 'devicesNotify';
    global.fetch = jest
      .fn()
      .mockResolvedValue(customsResponse({ block: true, retryAfter: 10001 }));

    let err: any;
    try {
      await customs.checkAuthenticated(request, authUid, authEmail, action);
    } catch (e) {
      err = e;
    }
    expect(err.output.statusCode).toBe(429);
    expect(err.output.payload.retryAfter).toBe(10001);
    expect(err.output.payload.retryAfterLocalized).toBe('in 3 hours');

    const [url, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe(`${CUSTOMS_URL_REAL}/checkAuthenticated`);
    expect(JSON.parse(init.body)).toEqual({ action, ip, uid: authUid });
  });

  describe('sanitizePayload', () => {
    it('strips sensitive fields (authPW, oldAuthPW, paymentToken)', () => {
      const customs = new Customs('none', log, error, statsd);
      const sanitized = customs.sanitizePayload({
        authPW: 'secret',
        oldAuthPW: 'old-secret',
        paymentToken: 'token',
        notThePW: 'plaintext',
      });
      expect(sanitized).toEqual({ notThePW: 'plaintext' });
    });

    it('returns undefined when there is no payload', () => {
      const customs = new Customs('none', log, error, statsd);
      expect(customs.sanitizePayload(undefined)).toBeUndefined();
    });
  });

  describe('customs v2', () => {
    const mockRateLimit = {
      check: jest.fn(),
      skip: jest.fn(),
      supportsAction: jest.fn(),
    };

    const customs = new Customs(
      CUSTOMS_URL_REAL,
      log,
      error,
      statsd,
      mockRateLimit
    );

    beforeEach(() => {
      mockRateLimit.check = jest.fn();
      mockRateLimit.skip = jest.fn(() => false);
      mockRateLimit.supportsAction = jest.fn(() => true);
      const originalGet = configModule.config.get.bind(configModule.config);
      jest
        .spyOn(configModule.config, 'get')
        .mockImplementation((key: string) => {
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

    it('can skip certain emails, ips, and uids', async () => {
      mockRateLimit.skip = jest.fn(() => true);
      mockRateLimit.check = jest.fn(async () => {
        return await Promise.resolve({
          retryAfter: 1000,
          reason: 'too-many-attempts',
        });
      });

      await customs.check(request, email, 'accountStatusCheck');

      expect(mockRateLimit.skip).toHaveBeenCalledWith('accountStatusCheck', {
        ip,
        email,
        ip_email,
      });
      expect(mockRateLimit.check).toHaveBeenCalledTimes(0);
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
  });

  describe('statsd metrics', () => {
    const tags = {
      block: true,
      suspect: true,
      unblock: true,
      blockReason: 'other',
      retryAfter: 1111,
    };
    const validTags = {
      block: true,
      suspect: true,
      unblock: true,
      blockReason: 'other',
    };

    beforeEach(() => {
      customsWithUrl = new Customs(CUSTOMS_URL_REAL, log, error, statsd);
    });

    it('reports for /check', async () => {
      global.fetch = jest.fn().mockResolvedValue(customsResponse(tags));

      await expect(
        customsWithUrl.check(request, email, action)
      ).rejects.toThrow();
      expect(statsd.increment).toHaveBeenCalledWith('customs.request.check', {
        action,
        ...validTags,
      });
      expect(statsd.timing).toHaveBeenCalledWith(
        expect.stringContaining('customs.check.success'),
        expect.anything()
      );
    });

    it('reports for /checkIpOnly', async () => {
      global.fetch = jest.fn().mockResolvedValue(customsResponse(tags));

      await expect(
        customsWithUrl.checkIpOnly(request, action)
      ).rejects.toThrow();
      expect(statsd.increment).toHaveBeenCalledWith(
        'customs.request.checkIpOnly',
        {
          action,
          ...validTags,
        }
      );
      expect(statsd.timing).toHaveBeenCalledWith(
        expect.stringContaining('customs.checkIpOnly.success'),
        expect.anything()
      );
    });

    it('reports for /checkAuthenticated', async () => {
      global.fetch = jest
        .fn()
        .mockResolvedValue(
          customsResponse({ block: true, blockReason: 'other' })
        );

      await expect(
        customsWithUrl.checkAuthenticated(
          request,
          'uid',
          'email@mozilla.com',
          action
        )
      ).rejects.toThrow();
      expect(statsd.increment).toHaveBeenCalledWith(
        'customs.request.checkAuthenticated',
        {
          action,
          block: true,
          blockReason: 'other',
        }
      );
      expect(statsd.timing).toHaveBeenCalledWith(
        expect.stringContaining('customs.checkAuthenticated.success'),
        expect.anything()
      );
    });

    it('reports failure statsd timing', async () => {
      global.fetch = jest.fn().mockResolvedValue(customsResponse(tags, 400));
      await expect(
        customsWithUrl.check(request, email, action)
      ).rejects.toThrow();
      expect(statsd.timing).toHaveBeenCalledWith(
        expect.stringContaining('customs.check.failure'),
        expect.anything()
      );
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

function newAction() {
  const EMAIL_ACTIONS = [
    'accountCreate',
    'recoveryEmailResendCode',
    'passwordForgotSendCode',
    'passwordForgotResendCode',
  ];

  return EMAIL_ACTIONS[Math.floor(Math.random() * EMAIL_ACTIONS.length)];
}
