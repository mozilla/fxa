/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');
const assert = { ...sinon.assert, ...require('chai').assert };
const mocks = require('../mocks');
const error = require(`../../lib/error.js`);
const nock = require('nock');

const CUSTOMS_URL_REAL = 'http://localhost:7000';
const CUSTOMS_URL_MISSING = 'http://localhost:7001';

const customsServer = nock(CUSTOMS_URL_REAL).defaultReplyHeaders({
  'Content-Type': 'application/json',
});
const Customs = require(`../../lib/customs.js`);

describe('Customs', () => {
  let customsNoUrl;
  let customsWithUrl;
  let customsInvalidUrl;
  const sandbox = sinon.createSandbox();
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

  let request;
  let ip;
  let email;
  let uid;
  let ip_uid;
  let ip_email;
  let action;

  beforeEach(() => {
    sandbox.stub(statsd, 'increment');
    sandbox.stub(statsd, 'timing');
    sandbox.stub(statsd, 'gauge');
    request = newRequest();
    ip = request.app.clientAddress;
    email = newEmail();
    uid = '12345';
    ip_uid = `${ip}_${uid}`;
    ip_email = `${ip}_${email}`;
    action = newAction();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("can create a customs object with url as 'none'", () => {
    customsNoUrl = new Customs('none', log, error, statsd);

    assert.ok(customsNoUrl, 'got a customs object with a none url');

    return customsNoUrl
      .check(request, email, action)
      .then((result) => {
        assert.equal(
          result,
          undefined,
          'Nothing is returned when /check succeeds'
        );
      })
      .then(() => {
        return customsNoUrl.flag(ip, { email, uid });
      })
      .then((result) => {
        assert.equal(
          result,
          undefined,
          'Nothing is returned when /failedLoginAttempt succeeds'
        );
      })
      .then(() => {
        return customsNoUrl.reset(request, email);
      })
      .then((result) => {
        assert.equal(
          result,
          undefined,
          'Nothing is returned when /passwordReset succeeds'
        );
      })
      .then(() => {
        return customsNoUrl.checkIpOnly(request, action);
      })
      .then((result) => {
        assert.equal(
          result,
          undefined,
          'Nothing is returned when /checkIpOnly succeeds'
        );
      });
  });

  it('can create a customs object with a url', () => {
    customsWithUrl = new Customs(CUSTOMS_URL_REAL, log, error, statsd);

    assert.ok(customsWithUrl, 'got a customs object with a valid url');

    // Mock a check that does not get blocked.
    customsServer
      .post('/check', (body) => {
        assert.deepEqual(
          body,
          {
            ip: ip,
            email: email,
            action: action,
            headers: request.headers,
            query: request.query,
            payload: request.payload,
          },
          'first call to /check had expected request params'
        );
        return true;
      })
      .reply(200, {
        block: false,
        retryAfter: 0,
      });

    return customsWithUrl
      .check(request, email, action)
      .then((result) => {
        assert.equal(
          result,
          undefined,
          'Nothing is returned when /check succeeds'
        );
      })
      .then(() => {
        // Mock a report of a failed login attempt
        customsServer
          .post('/failedLoginAttempt', (body) => {
            assert.deepEqual(
              body,
              {
                ip: ip,
                email: email,
                errno: error.ERRNO.UNEXPECTED_ERROR,
              },
              'first call to /failedLoginAttempt had expected request params'
            );
            return true;
          })
          .reply(200, {});
        return customsWithUrl.flag(ip, { email, uid });
      })
      .then((result) => {
        assert.equal(
          result,
          undefined,
          'Nothing is returned when /failedLoginAttempt succeeds'
        );
      })
      .then(() => {
        // Mock a report of a password reset.
        customsServer
          .post('/passwordReset', (body) => {
            assert.deepEqual(
              body,
              {
                ip: request.app.clientAddress,
                email: email,
              },
              'first call to /passwordReset had expected request params'
            );
            return true;
          })
          .reply(200, {});
        return customsWithUrl.reset(request, email);
      })
      .then((result) => {
        assert.equal(
          result,
          undefined,
          'Nothing is returned when /passwordReset succeeds'
        );
      })
      .then(() => {
        // Mock a check that does get blocked, with a retryAfter.
        customsServer
          .post('/check', (body) => {
            assert.deepEqual(
              body,
              {
                ip: ip,
                email: email,
                action: action,
                headers: request.headers,
                query: request.query,
                payload: request.payload,
              },
              'second call to /check had expected request params'
            );
            return true;
          })
          .reply(200, {
            block: true,
            retryAfter: 10001,
          });
        return customsWithUrl.check(request, email, action);
      })
      .then(
        (result) => {
          assert(
            false,
            'This should have failed the check since it should be blocked'
          );
        },
        (err) => {
          assert.equal(
            err.errno,
            error.ERRNO.THROTTLED,
            'Error number is correct'
          );
          assert.equal(
            err.message,
            'Client has sent too many requests',
            'Error message is correct'
          );
          assert.ok(err.isBoom, 'The error causes a boom');
          assert.equal(err.output.statusCode, 429, 'Status Code is correct');
          assert.equal(
            err.output.payload.retryAfter,
            10001,
            'retryAfter is correct'
          );
          assert.equal(
            err.output.headers['retry-after'],
            10001,
            'retryAfter header is correct'
          );
        }
      )
      .then(() => {
        // Mock a report of a failed login attempt that does trigger lockout.
        customsServer
          .post('/failedLoginAttempt', (body) => {
            assert.deepEqual(
              body,
              {
                ip: ip,
                email: email,
                errno: error.ERRNO.INCORRECT_PASSWORD,
              },
              'second call to /failedLoginAttempt had expected request params'
            );
            return true;
          })
          .reply(200, {});
        return customsWithUrl.flag(ip, {
          email: email,
          errno: error.ERRNO.INCORRECT_PASSWORD,
        });
      })
      .then((result) => {
        assert.equal(
          result,
          undefined,
          'Nothing is returned when /failedLoginAttempt succeeds'
        );
      })
      .then(() => {
        // Mock a check that does get blocked, with no retryAfter.
        request.headers['user-agent'] = 'test passing through headers';
        request.payload['foo'] = 'bar';
        customsServer
          .post('/check', (body) => {
            assert.deepEqual(
              body,
              {
                ip: ip,
                email: email,
                action: action,
                headers: request.headers,
                query: request.query,
                payload: request.payload,
              },
              'third call to /check had expected request params'
            );
            return true;
          })
          .reply(200, {
            block: true,
          });
        return customsWithUrl.check(request, email, action);
      })
      .then(
        (result) => {
          assert(
            false,
            'This should have failed the check since it should be blocked'
          );
        },
        (err) => {
          assert.equal(
            err.errno,
            error.ERRNO.REQUEST_BLOCKED,
            'Error number is correct'
          );
          assert.equal(
            err.message,
            'The request was blocked for security reasons',
            'Error message is correct'
          );
          assert.ok(err.isBoom, 'The error causes a boom');
          assert.equal(err.output.statusCode, 400, 'Status Code is correct');
          assert.equal(
            err.output.payload.retryAfter,
            undefined,
            'retryAfter field is not present'
          );
          assert.equal(
            err.output.headers['retry-after'],
            undefined,
            'retryAfter header is not present'
          );
        }
      )
      .then(() => {
        customsServer
          .post('/checkIpOnly', (body) => {
            assert.deepEqual(
              body,
              {
                ip: ip,
                action: action,
              },
              'first call to /check had expected request params'
            );
            return true;
          })
          .reply(200, {
            block: false,
            retryAfter: 0,
          });
        return customsWithUrl.checkIpOnly(request, action);
      })
      .then((result) => {
        assert.equal(
          result,
          undefined,
          'Nothing is returned when /check succeeds'
        );
      });
  });

  it('failed closed when creating a customs object with non-existant customs service', () => {
    customsInvalidUrl = new Customs(CUSTOMS_URL_MISSING, log, error, statsd);

    assert.ok(
      customsInvalidUrl,
      'got a customs object with a non-existant service url'
    );

    return Promise.all([
      customsInvalidUrl
        .check(request, email, action)
        .then(assert.fail, (err) => {
          assert.equal(
            err.errno,
            error.ERRNO.BACKEND_SERVICE_FAILURE,
            'an error is returned from /check'
          );
        }),

      customsInvalidUrl.flag(ip, { email, uid }).then(assert.fail, (err) => {
        assert.equal(
          err.errno,
          error.ERRNO.BACKEND_SERVICE_FAILURE,
          'an error is returned from /flag'
        );
      }),

      customsInvalidUrl.reset(request, email).then(assert.fail, (err) => {
        assert.equal(
          err.errno,
          error.ERRNO.BACKEND_SERVICE_FAILURE,
          'an error is returned from /passwordReset'
        );
      }),
    ]);
  });

  it('can rate limit checkAccountStatus /check', () => {
    customsWithUrl = new Customs(CUSTOMS_URL_REAL, log, error, statsd);

    assert.ok(customsWithUrl, 'can rate limit checkAccountStatus /check');

    action = 'accountStatusCheck';

    function checkRequestBody(body) {
      assert.deepEqual(
        body,
        {
          ip: ip,
          email: email,
          action: action,
          headers: request.headers,
          query: request.query,
          payload: request.payload,
        },
        'call to /check had expected request params'
      );
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

    return customsWithUrl
      .check(request, email, action)
      .then((result) => {
        assert.equal(
          result,
          undefined,
          'Nothing is returned when /check succeeds - 1'
        );
        return customsWithUrl.check(request, email, action);
      })
      .then((result) => {
        assert.equal(
          result,
          undefined,
          'Nothing is returned when /check succeeds - 2'
        );
        return customsWithUrl.check(request, email, action);
      })
      .then((result) => {
        assert.equal(
          result,
          undefined,
          'Nothing is returned when /check succeeds - 3'
        );
        return customsWithUrl.check(request, email, action);
      })
      .then((result) => {
        assert.equal(
          result,
          undefined,
          'Nothing is returned when /check succeeds - 4'
        );
        return customsWithUrl.check(request, email, action);
      })
      .then(() => {
        // request is blocked
        return customsWithUrl.check(request, email, action);
      })
      .then(
        () => {
          assert(
            false,
            'This should have failed the check since it should be blocked'
          );
        },
        (error) => {
          assert.equal(error.errno, 114, 'Error number is correct');
          assert.equal(
            error.message,
            'Client has sent too many requests',
            'Error message is correct'
          );
          assert.ok(error.isBoom, 'The error causes a boom');
          assert.equal(error.output.statusCode, 429, 'Status Code is correct');
          assert.equal(
            error.output.payload.retryAfter,
            10001,
            'retryAfter is correct'
          );
          assert.equal(
            error.output.payload.retryAfterLocalized,
            'in 3 hours',
            'retryAfterLocalized is correct'
          );
          assert.equal(
            error.output.headers['retry-after'],
            10001,
            'retryAfter header is correct'
          );
        }
      );
  });

  it('can rate limit devicesNotify /checkAuthenticated', () => {
    customsWithUrl = new Customs(CUSTOMS_URL_REAL, log, error, statsd);

    assert.ok(customsWithUrl, 'can rate limit /checkAuthenticated');

    action = 'devicesNotify';
    const uid = 'foo';
    const email = 'bar@mozilla.com';

    function checkRequestBody(body) {
      assert.deepEqual(
        body,
        {
          action: action,
          ip: ip,
          uid: uid,
        },
        'call to /checkAuthenticated had expected request params'
      );
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

    return customsWithUrl
      .checkAuthenticated(request, uid, email, action)
      .then((result) => {
        assert.equal(
          result,
          undefined,
          'Nothing is returned when /checkAuthenticated succeeds - 1'
        );
        return customsWithUrl.checkAuthenticated(request, uid, email, action);
      })
      .then((result) => {
        assert.equal(
          result,
          undefined,
          'Nothing is returned when /checkAuthenticated succeeds - 2'
        );
        return customsWithUrl.checkAuthenticated(request, uid, email, action);
      })
      .then((result) => {
        assert.equal(
          result,
          undefined,
          'Nothing is returned when /checkAuthenticated succeeds - 3'
        );
        return customsWithUrl.checkAuthenticated(request, uid, email, action);
      })
      .then((result) => {
        assert.equal(
          result,
          undefined,
          'Nothing is returned when /checkAuthenticated succeeds - 4'
        );
        return customsWithUrl.checkAuthenticated(request, uid, email, action);
      })
      .then(() => {
        // request is blocked
        return customsWithUrl.checkAuthenticated(request, uid, email, action);
      })
      .then(
        () => {
          assert(
            false,
            'This should have failed the check since it should be blocked'
          );
        },
        (error) => {
          assert.equal(error.errno, 114, 'Error number is correct');
          assert.equal(
            error.message,
            'Client has sent too many requests',
            'Error message is correct'
          );
          assert.ok(error.isBoom, 'The error causes a boom');
          assert.equal(error.output.statusCode, 429, 'Status Code is correct');
          assert.equal(
            error.output.payload.retryAfter,
            10001,
            'retryAfter is correct'
          );
          assert.equal(
            error.output.headers['retry-after'],
            10001,
            'retryAfter header is correct'
          );
        }
      );
  });

  it('can rate limit verifyTotpCode /check', () => {
    action = 'verifyTotpCode';
    email = 'test@email.com';

    customsWithUrl = new Customs(CUSTOMS_URL_REAL, log, error, statsd);
    assert.ok(customsWithUrl, 'can rate limit ');

    function checkRequestBody(body) {
      assert.deepEqual(
        body,
        {
          ip: ip,
          email: email,
          action: action,
          headers: request.headers,
          query: request.query,
          payload: request.payload,
        },
        'call to /check had expected request params'
      );
      return true;
    }

    customsServer
      .post('/check', checkRequestBody)
      .reply(200, '{"block":false,"retryAfter":0}')
      .post('/check', checkRequestBody)
      .reply(200, '{"block":false,"retryAfter":0}')
      .post('/check', checkRequestBody)
      .reply(200, '{"block":true,"retryAfter":30}');

    return customsWithUrl
      .check(request, email, action)
      .then((result) => {
        assert.equal(
          result,
          undefined,
          'Nothing is returned when /check succeeds - 1'
        );
        return customsWithUrl.check(request, email, action);
      })
      .then((result) => {
        assert.equal(
          result,
          undefined,
          'Nothing is returned when /check succeeds - 2'
        );
        return customsWithUrl.check(request, email, action);
      })
      .then(assert.fail, (error) => {
        assert.equal(error.errno, 114, 'Error number is correct');
        assert.equal(
          error.message,
          'Client has sent too many requests',
          'Error message is correct'
        );
        assert.ok(error.isBoom, 'The error causes a boom');
        assert.equal(error.output.statusCode, 429, 'Status Code is correct');
        assert.equal(
          error.output.payload.retryAfter,
          30,
          'retryAfter is correct'
        );
        assert.equal(
          error.output.headers['retry-after'],
          30,
          'retryAfter header is correct'
        );
      });
  });

  it('can scrub customs request object', () => {
    customsWithUrl = new Customs(CUSTOMS_URL_REAL, log, error, statsd);

    assert.ok(customsWithUrl, 'got a customs object with a valid url');

    request.payload.authPW = 'asdfasdfadsf';
    request.payload.oldAuthPW = '012301230123';
    request.payload.notThePW = 'plaintext';

    customsServer
      .post('/check', (body) => {
        assert.deepEqual(
          body,
          {
            ip: ip,
            email: email,
            action: action,
            headers: request.headers,
            query: request.query,
            payload: {
              notThePW: 'plaintext',
            },
          },
          'should not have password fields in payload'
        );
        return true;
      })
      .reply(200, {
        block: false,
        retryAfter: 0,
      });

    return customsWithUrl.check(request, email, action).then((result) => {
      assert.equal(
        result,
        undefined,
        'nothing is returned when /check succeeds - 1'
      );
    });
  });

  describe('customs v2', () => {
    const mockRateLimit = {
      check: sinon.spy(),
      skip: sinon.spy(),
      supportsAction: sinon.spy(),
    };

    const customs = new Customs(
      CUSTOMS_URL_REAL,
      log,
      error,
      statsd,
      mockRateLimit
    );

    beforeEach(() => {
      mockRateLimit.check = sinon.spy();
      mockRateLimit.skip = sinon.spy(() => false);
      mockRateLimit.supportsAction = sinon.spy(() => true);
    });

    it('can allow checkAccountStatus with rate-limit lib', async () => {
      mockRateLimit.check = sandbox.spy(async () => {
        return await Promise.resolve(null);
      });
      // Should no throw
      await customs.checkAuthenticated(
        request,
        uid,
        email,
        'accountStatusCheck'
      );

      assert.callCount(mockRateLimit.supportsAction, 1);
      assert.callCount(mockRateLimit.check, 1);
      assert.calledWith(mockRateLimit.check, 'accountStatusCheck', {
        ip,
        email,
        uid,
        ip_email,
        ip_uid,
      });
    });

    it('can block checkAccountStatus with rate-limit lib', async () => {
      mockRateLimit.check = sandbox.spy(async (action) => {
        if (action === 'accountStatusCheck') {
          return await Promise.resolve({
            retryAfter: 1000,
            reason: 'too-many-attempts',
          });
        }
        return null;
      });

      let customsError = undefined;
      try {
        await customs.check(request, email, 'accountStatusCheck');
      } catch (err) {
        customsError = err;
      }

      assert.isDefined(error);
      assert.equal(customsError.errno, 114);
      assert.equal(customsError.output.payload.error, 'Too Many Requests');
      assert.equal(
        customsError.output.payload.message,
        'Client has sent too many requests'
      );

      assert.callCount(mockRateLimit.supportsAction, 2);
      assert.calledWith(mockRateLimit.supportsAction, 'accountStatusCheck');
      assert.calledWith(mockRateLimit.supportsAction, 'unblockEmail');

      assert.callCount(mockRateLimit.check, 2);
      assert.calledWith(
        mockRateLimit.check,
        'accountStatusCheck',
        sinon.match({
          ip,
          email,
          ip_email,
        })
      );
      assert.calledWith(
        mockRateLimit.check,
        'unblockEmail',
        sinon.match({
          ip,
          email,
          ip_email,
        })
      );
    });

    it('can skip certain emails, ips, and uids', async () => {
      mockRateLimit.skip = sandbox.spy(() => true);
      mockRateLimit.check = sandbox.spy(async () => {
        return await Promise.resolve({
          retryAfter: 1000,
          reason: 'too-many-attempts',
        });
      });

      // Should not throw despite, check being mocked to return an error. The
      // skip check should be called first, and since it indicates a skip should
      // occur, the actual customs check shouldn't ever happen.
      await customs.check(request, email, 'accountStatusCheck');

      assert.calledWith(mockRateLimit.skip, {
        ip,
        email,
        ip_email,
      });
      assert.callCount(mockRateLimit.check, 0);
    });
  });

  describe('statsd metrics', () => {
    const tags = {
      block: true,
      suspect: true,
      unblock: true,
      blockReason: 'other',
      // Important! Values with high cardinality like retryAfter
      // should be sent to statsd!
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

      try {
        await customsWithUrl.check(request, email, action);
        assert.fail('should have failed');
      } catch (err) {
        assert.isTrue(
          statsd.increment.calledWithExactly('customs.request.check', {
            action,
            ...validTags,
          })
        );
        assert.isTrue(statsd.timing.calledWithMatch('customs.check.success'));
        assert.isTrue(
          statsd.gauge.calledWithMatch('httpAgent.createSocketCount')
        );
        assert.isTrue(
          statsd.gauge.calledWithMatch('httpsAgent.createSocketCount')
        );
      }
    });

    it('reports for /checkIpOnly', async () => {
      customsServer.post('/checkIpOnly').reply(200, tags);

      try {
        await customsWithUrl.checkIpOnly(request, action);
        assert.fail('should have failed');
      } catch (err) {
        assert.isTrue(
          statsd.increment.calledWithExactly('customs.request.checkIpOnly', {
            action,
            ...validTags,
          })
        );
        assert.isTrue(
          statsd.timing.calledWithMatch('customs.checkIpOnly.success')
        );
      }
    });

    it('reports for /checkAuthenticated', async () => {
      customsServer.post('/checkAuthenticated').reply(200, {
        block: true,
        blockReason: 'other',
      });

      try {
        await customsWithUrl.checkAuthenticated(
          request,
          'uid',
          'email',
          action
        );
        assert.fail('should have failed');
      } catch (err) {
        assert.isTrue(
          statsd.increment.calledWithExactly(
            'customs.request.checkAuthenticated',
            {
              action,
              block: true,
              blockReason: 'other',
            }
          )
        );
        assert.isTrue(
          statsd.timing.calledWithMatch('customs.checkAuthenticated.success')
        );
      }
    });

    it('reports failure statsd timing', async () => {
      customsServer.post('/check').reply(400, tags);
      try {
        await customsWithUrl.check(request, email, action);
        assert.fail('should have failed');
      } catch (err) {
        assert.isTrue(statsd.timing.calledWithMatch('customs.check.failure'));
      }
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
