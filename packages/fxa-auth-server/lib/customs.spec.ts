/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const mocks = require('../test/mocks');
const { AppError: error } = require('@fxa/accounts/errors');
const nock = require('nock');

const CUSTOMS_URL_REAL = 'http://localhost:7000';
const CUSTOMS_URL_MISSING = 'http://localhost:7001';

const customsServer = nock(CUSTOMS_URL_REAL).defaultReplyHeaders({
  'Content-Type': 'application/json',
});
const Customs = require('./customs');
const configModule = require('../config');

describe('Customs', () => {
  let customsNoUrl: any;
  let customsWithUrl: any;
  let customsInvalidUrl: any;
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

  beforeEach(() => {
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
    nock.cleanAll();
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

  it('can create a customs object with a url', async () => {
    customsWithUrl = new Customs(CUSTOMS_URL_REAL, log, error, statsd);
    expect(customsWithUrl).toBeTruthy();

    // Mock a check that does not get blocked.
    customsServer
      .post('/check', (body: any) => {
        expect(body).toEqual({
          ip: ip,
          email: email,
          action: action,
          headers: request.headers,
          query: request.query,
          payload: request.payload,
        });
        return true;
      })
      .reply(200, { block: false, retryAfter: 0 });

    let result = await customsWithUrl.check(request, email, action);
    expect(result).toBeUndefined();

    // flag() is now a noop
    result = await customsWithUrl.flag(ip, { email, uid });
    expect(result).toBeUndefined();

    // Mock a report of a password reset.
    customsServer
      .post('/passwordReset', (body: any) => {
        expect(body).toEqual({
          ip: request.app.clientAddress,
          email: email,
        });
        return true;
      })
      .reply(200, {});
    result = await customsWithUrl.reset(request, email);
    expect(result).toBeUndefined();

    // Mock a check that does get blocked, with a retryAfter.
    customsServer
      .post('/check', (body: any) => {
        expect(body).toEqual({
          ip: ip,
          email: email,
          action: action,
          headers: request.headers,
          query: request.query,
          payload: request.payload,
        });
        return true;
      })
      .reply(200, { block: true, retryAfter: 10001 });

    try {
      await customsWithUrl.check(request, email, action);
      throw new Error(
        'This should have failed the check since it should be blocked'
      );
    } catch (err: any) {
      expect(err.errno).toBe(error.ERRNO.THROTTLED);
      expect(err.message).toBe('Client has sent too many requests');
      expect(err.isBoom).toBeTruthy();
      expect(err.output.statusCode).toBe(429);
      expect(err.output.payload.retryAfter).toBe(10001);
      expect(err.output.headers['retry-after']).toBe('10001');
    }

    // flag() is now a noop
    result = await customsWithUrl.flag(ip, {
      email: email,
      errno: error.ERRNO.INCORRECT_PASSWORD,
    });
    expect(result).toBeUndefined();

    // Mock a check that does get blocked, with no retryAfter.
    request.headers['user-agent'] = 'test passing through headers';
    request.payload['foo'] = 'bar';
    customsServer
      .post('/check', (body: any) => {
        expect(body).toEqual({
          ip: ip,
          email: email,
          action: action,
          headers: request.headers,
          query: request.query,
          payload: request.payload,
        });
        return true;
      })
      .reply(200, { block: true });

    try {
      await customsWithUrl.check(request, email, action);
      throw new Error(
        'This should have failed the check since it should be blocked'
      );
    } catch (err: any) {
      expect(err.errno).toBe(error.ERRNO.REQUEST_BLOCKED);
      expect(err.message).toBe('The request was blocked for security reasons');
      expect(err.isBoom).toBeTruthy();
      expect(err.output.statusCode).toBe(400);
      expect(err.output.payload.retryAfter).toBeUndefined();
      expect(err.output.headers['retry-after']).toBeUndefined();
    }

    customsServer
      .post('/checkIpOnly', (body: any) => {
        expect(body).toEqual({
          ip: ip,
          action: action,
        });
        return true;
      })
      .reply(200, { block: false, retryAfter: 0 });

    result = await customsWithUrl.checkIpOnly(request, action);
    expect(result).toBeUndefined();
  });

  it('failed closed when creating a customs object with non-existant customs service', async () => {
    customsInvalidUrl = new Customs(CUSTOMS_URL_MISSING, log, error, statsd);
    expect(customsInvalidUrl).toBeTruthy();

    await expect(
      customsInvalidUrl.check(request, email, action)
    ).rejects.toMatchObject({
      errno: error.ERRNO.BACKEND_SERVICE_FAILURE,
    });
    await expect(customsInvalidUrl.reset(request, email)).rejects.toMatchObject(
      {
        errno: error.ERRNO.BACKEND_SERVICE_FAILURE,
      }
    );
  });

  it('can rate limit checkAccountStatus /check', async () => {
    customsWithUrl = new Customs(CUSTOMS_URL_REAL, log, error, statsd);
    expect(customsWithUrl).toBeTruthy();

    action = 'accountStatusCheck';

    function checkRequestBody(body: any) {
      expect(body).toEqual({
        ip: ip,
        email: email,
        action: action,
        headers: request.headers,
        query: request.query,
        payload: request.payload,
      });
      return true;
    }

    customsServer
      .post('/check', checkRequestBody)
      .reply(200, '{"block":false,"retryAfter":0}')
      .post('/check', checkRequestBody)
      .reply(200, '{"block":false,"retryAfter":0}')
      .post('/check', checkRequestBody)
      .reply(200, '{"block":false,"retryAfter":0}')
      .post('/check', checkRequestBody)
      .reply(200, '{"block":false,"retryAfter":0}')
      .post('/check', checkRequestBody)
      .reply(200, '{"block":false,"retryAfter":0}')
      .post('/check', checkRequestBody)
      .reply(200, '{"block":true,"retryAfter":10001}');

    let result;
    result = await customsWithUrl.check(request, email, action);
    expect(result).toBeUndefined();
    result = await customsWithUrl.check(request, email, action);
    expect(result).toBeUndefined();
    result = await customsWithUrl.check(request, email, action);
    expect(result).toBeUndefined();
    result = await customsWithUrl.check(request, email, action);
    expect(result).toBeUndefined();
    result = await customsWithUrl.check(request, email, action);
    expect(result).toBeUndefined();

    try {
      await customsWithUrl.check(request, email, action);
      throw new Error(
        'This should have failed the check since it should be blocked'
      );
    } catch (err: any) {
      expect(err.errno).toBe(114);
      expect(err.message).toBe('Client has sent too many requests');
      expect(err.isBoom).toBeTruthy();
      expect(err.output.statusCode).toBe(429);
      expect(err.output.payload.retryAfter).toBe(10001);
      expect(err.output.payload.retryAfterLocalized).toBe('in 3 hours');
      expect(err.output.headers['retry-after']).toBe('10001');
    }
  });

  it('can rate limit devicesNotify /checkAuthenticated', async () => {
    customsWithUrl = new Customs(CUSTOMS_URL_REAL, log, error, statsd);
    expect(customsWithUrl).toBeTruthy();

    action = 'devicesNotify';
    const uid = 'foo';
    const email = 'bar@mozilla.com';

    function checkRequestBody(body: any) {
      expect(body).toEqual({
        action: action,
        ip: ip,
        uid: uid,
      });
      return true;
    }

    customsServer
      .post('/checkAuthenticated', checkRequestBody)
      .reply(200, '{"block":false,"retryAfter":0}')
      .post('/checkAuthenticated', checkRequestBody)
      .reply(200, '{"block":false,"retryAfter":0}')
      .post('/checkAuthenticated', checkRequestBody)
      .reply(200, '{"block":false,"retryAfter":0}')
      .post('/checkAuthenticated', checkRequestBody)
      .reply(200, '{"block":false,"retryAfter":0}')
      .post('/checkAuthenticated', checkRequestBody)
      .reply(200, '{"block":false,"retryAfter":0}')
      .post('/checkAuthenticated', checkRequestBody)
      .reply(200, '{"block":true,"retryAfter":10001}');

    let result;
    result = await customsWithUrl.checkAuthenticated(
      request,
      uid,
      email,
      action
    );
    expect(result).toBeUndefined();
    result = await customsWithUrl.checkAuthenticated(
      request,
      uid,
      email,
      action
    );
    expect(result).toBeUndefined();
    result = await customsWithUrl.checkAuthenticated(
      request,
      uid,
      email,
      action
    );
    expect(result).toBeUndefined();
    result = await customsWithUrl.checkAuthenticated(
      request,
      uid,
      email,
      action
    );
    expect(result).toBeUndefined();
    result = await customsWithUrl.checkAuthenticated(
      request,
      uid,
      email,
      action
    );
    expect(result).toBeUndefined();

    try {
      await customsWithUrl.checkAuthenticated(request, uid, email, action);
      throw new Error(
        'This should have failed the check since it should be blocked'
      );
    } catch (err: any) {
      expect(err.errno).toBe(114);
      expect(err.message).toBe('Client has sent too many requests');
      expect(err.isBoom).toBeTruthy();
      expect(err.output.statusCode).toBe(429);
      expect(err.output.payload.retryAfter).toBe(10001);
      expect(err.output.headers['retry-after']).toBe('10001');
    }
  });

  it('can rate limit verifyTotpCode /check', async () => {
    action = 'verifyTotpCode';
    email = 'test@email.com';

    customsWithUrl = new Customs(CUSTOMS_URL_REAL, log, error, statsd);
    expect(customsWithUrl).toBeTruthy();

    function checkRequestBody(body: any) {
      expect(body).toEqual({
        ip: ip,
        email: email,
        action: action,
        headers: request.headers,
        query: request.query,
        payload: request.payload,
      });
      return true;
    }

    customsServer
      .post('/check', checkRequestBody)
      .reply(200, '{"block":false,"retryAfter":0}')
      .post('/check', checkRequestBody)
      .reply(200, '{"block":false,"retryAfter":0}')
      .post('/check', checkRequestBody)
      .reply(200, '{"block":true,"retryAfter":30}');

    let result;
    result = await customsWithUrl.check(request, email, action);
    expect(result).toBeUndefined();
    result = await customsWithUrl.check(request, email, action);
    expect(result).toBeUndefined();

    try {
      await customsWithUrl.check(request, email, action);
      throw new Error('should have been blocked');
    } catch (err: any) {
      expect(err.errno).toBe(114);
      expect(err.message).toBe('Client has sent too many requests');
      expect(err.isBoom).toBeTruthy();
      expect(err.output.statusCode).toBe(429);
      expect(err.output.payload.retryAfter).toBe(30);
      expect(err.output.headers['retry-after']).toBe('30');
    }
  });

  it('can scrub customs request object', async () => {
    customsWithUrl = new Customs(CUSTOMS_URL_REAL, log, error, statsd);
    expect(customsWithUrl).toBeTruthy();

    request.payload.authPW = 'asdfasdfadsf';
    request.payload.oldAuthPW = '012301230123';
    request.payload.notThePW = 'plaintext';

    customsServer
      .post('/check', (body: any) => {
        expect(body).toEqual({
          ip: ip,
          email: email,
          action: action,
          headers: request.headers,
          query: request.query,
          payload: {
            notThePW: 'plaintext',
          },
        });
        return true;
      })
      .reply(200, { block: false, retryAfter: 0 });

    const result = await customsWithUrl.check(request, email, action);
    expect(result).toBeUndefined();
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

      expect(mockRateLimit.skip).toHaveBeenCalledWith({ ip, email, ip_email });
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
      customsServer.post('/check').reply(200, tags);

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
      expect(statsd.gauge).toHaveBeenCalledWith(
        expect.stringContaining('httpAgent.createSocketCount'),
        expect.anything()
      );
      expect(statsd.gauge).toHaveBeenCalledWith(
        expect.stringContaining('httpsAgent.createSocketCount'),
        expect.anything()
      );
    });

    it('reports for /checkIpOnly', async () => {
      customsServer.post('/checkIpOnly').reply(200, tags);

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
      customsServer.post('/checkAuthenticated').reply(200, {
        block: true,
        blockReason: 'other',
      });

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
      customsServer.post('/check').reply(400, tags);
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
