/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const ROOT_DIR = '../..';

const sinon = require('sinon');
const assert = { ...sinon.assert, ...require('chai').assert };
const mocks = require('../mocks');
const error = require(`${ROOT_DIR}/lib/error.js`);
const proxyquire = require('proxyquire');

const CUSTOMS_URL_REAL = 'http://localhost:7000';
const CUSTOMS_URL_MISSING = 'http://localhost:7001';

function fakeResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body)
  };
}
const fakeFetch = sinon.stub();

const Customs = proxyquire(`${ROOT_DIR}/lib/customs.js`, {
  'node-fetch': fakeFetch
});

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
  let action;

  beforeEach(() => {
    sandbox.stub(statsd, 'increment');
    sandbox.stub(statsd, 'timing');
    sandbox.stub(statsd, 'gauge');
    request = newRequest();
    ip = request.app.clientAddress;
    email = newEmail();
    action = newAction();
    fakeFetch.reset();
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
        return customsNoUrl.flag(ip, { email: email, uid: '12345' });
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
    fakeFetch.onCall(0).callsFake((url, options) => {
      assert.include(url, '/check', 'URL contains /check');
      const body = JSON.parse(options.body);
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
      return Promise.resolve(fakeResponse(200, { block: false, retryAfter: 0 }));
    });
    // Mock a report of a failed login attempt
    fakeFetch.onCall(1).callsFake((url, options) => {
      assert.include(url, '/failedLoginAttempt', 'URL contains /failedLoginAttempt');
      const body = JSON.parse(options.body);
      assert.deepEqual(
        body,
        {
          ip: ip,
          email: email,
          errno: error.ERRNO.UNEXPECTED_ERROR,
        },
        'first call to /failedLoginAttempt had expected request params'
      );
      return Promise.resolve(fakeResponse(200, {}));
    });
    // Mock a report of a password reset.
    fakeFetch.onCall(2).callsFake((url, options) => {
      assert.include(url, '/passwordReset', 'URL contains /passwordReset');
      const body = JSON.parse(options.body);
      assert.deepEqual(
        body,
        {
          ip: request.app.clientAddress,
          email: email,
        },
        'first call to /passwordReset had expected request params'
      );
      return Promise.resolve(fakeResponse(200, {}));
    });
    // Mock a check that does get blocked, with a retryAfter.
    fakeFetch.onCall(3).callsFake((url, options) => {
      assert.include(url, '/check', 'URL contains /check');
      const body = JSON.parse(options.body);
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
      return Promise.resolve(fakeResponse(200, { block: true, retryAfter: 10001 }));
    });
    // Mock a report of a failed login attempt that does trigger lockout.
    fakeFetch.onCall(4).callsFake((url, options) => {
      assert.include(url, '/failedLoginAttempt', 'URL contains /failedLoginAttempt');
      const body = JSON.parse(options.body);
      assert.deepEqual(
        body,
        {
          ip: ip,
          email: email,
          errno: error.ERRNO.INCORRECT_PASSWORD,
        },
        'second call to /failedLoginAttempt had expected request params'
      );
      return Promise.resolve(fakeResponse(200, {}));
    });
    // Mock a check that does get blocked, with no retryAfter.
    fakeFetch.onCall(5).callsFake((url, options) => {
      assert.include(url, '/check', 'URL contains /check');
      const body = JSON.parse(options.body);
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
      return Promise.resolve(fakeResponse(200, { block: true }));
    });
    // checkIpOnly call.
    fakeFetch.onCall(6).callsFake((url, options) => {
      assert.include(url, '/checkIpOnly', 'URL contains /checkIpOnly');
      const body = JSON.parse(options.body);
      assert.deepEqual(
        body,
        {
          ip: ip,
          action: action,
        },
        'first call to /checkIpOnly had expected request params'
      );
      return Promise.resolve(fakeResponse(200, { block: false, retryAfter: 0 }));
    });

    return customsWithUrl
      .check(request, email, action)
      .then((result) => {
        assert.equal(result, undefined, 'Nothing is returned when /check succeeds');
      })
      .then(() => {
        return customsWithUrl.flag(ip, { email: email, uid: '12345' });
      })
      .then((result) => {
        assert.equal(result, undefined, 'Nothing is returned when /failedLoginAttempt succeeds');
      })
      .then(() => {
        return customsWithUrl.reset(request, email);
      })
      .then((result) => {
        assert.equal(result, undefined, 'Nothing is returned when /passwordReset succeeds');
      })
      .then(() => {
        return customsWithUrl.check(request, email, action)
          .then(
            () => { throw new Error('Expected check to fail due to block'); },
            (err) => {
              assert.equal(err.errno, error.ERRNO.THROTTLED, 'Error number is correct');
              assert.equal(err.message, 'Client has sent too many requests', 'Error message is correct');
              assert.ok(err.isBoom, 'The error causes a boom');
              assert.equal(err.output.statusCode, 429, 'Status Code is correct');
              assert.equal(err.output.payload.retryAfter, 10001, 'retryAfter is correct');
              assert.equal(err.output.headers['retry-after'], 10001, 'retryAfter header is correct');
            }
          );
      })
      .then(() => {
        return customsWithUrl.flag(ip, { email: email, errno: error.ERRNO.INCORRECT_PASSWORD });
      })
      .then((result) => {
        assert.equal(result, undefined, 'Nothing is returned when /failedLoginAttempt succeeds');
      })
      .then(() => {
        return customsWithUrl.check(request, email, action)
          .then(
            () => { throw new Error('Expected check to fail due to block'); },
            (err) => {
              assert.equal(err.errno, error.ERRNO.REQUEST_BLOCKED, 'Error number is correct');
              assert.equal(err.message, 'The request was blocked for security reasons', 'Error message is correct');
              assert.ok(err.isBoom, 'The error causes a boom');
              assert.equal(err.output.statusCode, 400, 'Status Code is correct');
              assert.equal(err.output.payload.retryAfter, undefined, 'retryAfter field is not present');
              assert.equal(err.output.headers['retry-after'], undefined, 'retryAfter header is not present');
            }
          );
      })
      .then(() => {
        return customsWithUrl.checkIpOnly(request, action)
          .then((result) => {
            assert.equal(result, undefined, 'Nothing is returned when /checkIpOnly succeeds');
          });
      });
  });

  it('failed closed when creating a customs object with non-existant customs service', () => {
    customsInvalidUrl = new Customs(CUSTOMS_URL_MISSING, log, error, statsd);
    assert.ok(customsInvalidUrl, 'got a customs object with a non-existant service url');

    // For a missing service, fakeFetch always rejects.
    fakeFetch.callsFake(() => Promise.reject(new Error('connect ECONNREFUSED')));

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

      customsInvalidUrl
        .flag(ip, { email: email, uid: '12345' })
        .then(assert.fail, (err) => {
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

    fakeFetch.reset();
    fakeFetch.onCall(0).callsFake((url, options) => { checkRequestBody(JSON.parse(options.body)); return Promise.resolve(fakeResponse(200, { block: false, retryAfter: 0 })); });
    fakeFetch.onCall(1).callsFake((url, options) => { checkRequestBody(JSON.parse(options.body)); return Promise.resolve(fakeResponse(200, { block: false, retryAfter: 0 })); });
    fakeFetch.onCall(2).callsFake((url, options) => { checkRequestBody(JSON.parse(options.body)); return Promise.resolve(fakeResponse(200, { block: false, retryAfter: 0 })); });
    fakeFetch.onCall(3).callsFake((url, options) => { checkRequestBody(JSON.parse(options.body)); return Promise.resolve(fakeResponse(200, { block: false, retryAfter: 0 })); });
    fakeFetch.onCall(4).callsFake((url, options) => { checkRequestBody(JSON.parse(options.body)); return Promise.resolve(fakeResponse(200, { block: false, retryAfter: 0 })); });
    fakeFetch.onCall(5).callsFake((url, options) => { checkRequestBody(JSON.parse(options.body)); return Promise.resolve(fakeResponse(200, { block: true, retryAfter: 10001, errno: 114 })); });

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
    fakeFetch.reset();
    fakeFetch.onCall(0).callsFake((url, options) => { checkRequestBody(JSON.parse(options.body)); return Promise.resolve(fakeResponse(200, { block: false, retryAfter: 0 })); });
    fakeFetch.onCall(1).callsFake((url, options) => { checkRequestBody(JSON.parse(options.body)); return Promise.resolve(fakeResponse(200, { block: false, retryAfter: 0 })); });
    fakeFetch.onCall(2).callsFake((url, options) => { checkRequestBody(JSON.parse(options.body)); return Promise.resolve(fakeResponse(200, { block: false, retryAfter: 0 })); });
    fakeFetch.onCall(3).callsFake((url, options) => { checkRequestBody(JSON.parse(options.body)); return Promise.resolve(fakeResponse(200, { block: false, retryAfter: 0 })); });
    fakeFetch.onCall(4).callsFake((url, options) => { checkRequestBody(JSON.parse(options.body)); return Promise.resolve(fakeResponse(200, { block: false, retryAfter: 0 })); });
    fakeFetch.onCall(5).callsFake((url, options) => { checkRequestBody(JSON.parse(options.body)); return Promise.resolve(fakeResponse(200, { block: true, retryAfter: 10001 })); });

    return customsWithUrl
      .checkAuthenticated(request, uid, action)
      .then((result) => {
        assert.equal(
          result,
          undefined,
          'Nothing is returned when /checkAuthenticated succeeds - 1'
        );
        return customsWithUrl.checkAuthenticated(request, uid, action);
      })
      .then((result) => {
        assert.equal(
          result,
          undefined,
          'Nothing is returned when /checkAuthenticated succeeds - 2'
        );
        return customsWithUrl.checkAuthenticated(request, uid, action);
      })
      .then((result) => {
        assert.equal(
          result,
          undefined,
          'Nothing is returned when /checkAuthenticated succeeds - 3'
        );
        return customsWithUrl.checkAuthenticated(request, uid, action);
      })
      .then((result) => {
        assert.equal(
          result,
          undefined,
          'Nothing is returned when /checkAuthenticated succeeds - 4'
        );
        return customsWithUrl.checkAuthenticated(request, uid, action);
      })
      .then(() => {
        // request is blocked
        return customsWithUrl.checkAuthenticated(request, uid, action);
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
    fakeFetch.reset();
    fakeFetch.onCall(0).callsFake((url, options) => { checkRequestBody(JSON.parse(options.body)); return Promise.resolve(fakeResponse(200, { block: false, retryAfter: 0 })); });
    fakeFetch.onCall(1).callsFake((url, options) => { checkRequestBody(JSON.parse(options.body)); return Promise.resolve(fakeResponse(200, { block: false, retryAfter: 0 })); });
    fakeFetch.onCall(2).callsFake((url, options) => { checkRequestBody(JSON.parse(options.body)); return Promise.resolve(fakeResponse(200, { block: true, retryAfter: 30 })); });

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

    fakeFetch.onCall(0).callsFake((url, options) => {
      assert.include(url, '/check', 'URL contains /check');
      const body = JSON.parse(options.body);
      assert.deepEqual(body, {
        ip: ip,
        email: email,
        action: action,
        headers: request.headers,
        query: request.query,
        payload: { notThePW: 'plaintext' },
      }, 'should not have password fields in payload');
      return Promise.resolve(fakeResponse(200, { block: false, retryAfter: 0 }));
    });
    return customsWithUrl.check(request, email, action).then((result) => {
      assert.equal(
        result,
        undefined,
        'nothing is returned when /check succeeds - 1'
      );
    });
  });

  describe('statsd metrics', () => {
    const tags = {
      block: true,
      suspect: true,
      unblock: true,
      blockReason: 'other',
    };

    beforeEach(() => {
      customsWithUrl = new Customs(CUSTOMS_URL_REAL, log, error, statsd);
    });

    it('reports for /check', async () => {
      fakeFetch.onCall(0).callsFake(() => Promise.resolve(fakeResponse(200, tags)));
      try {
        await customsWithUrl.check(request, email, action);
        assert.fail('should have failed');
      } catch (err) {
        assert.isTrue(
          statsd.increment.calledWithExactly('customs.request.check', {
            action,
            ...tags,
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
      fakeFetch.onCall(0).callsFake(() => Promise.resolve(fakeResponse(200, tags)));
      try {
        await customsWithUrl.checkIpOnly(request, action);
        assert.fail('should have failed');
      } catch (err) {
        assert.isTrue(
          statsd.increment.calledWithExactly('customs.request.checkIpOnly', {
            action,
            ...tags,
          })
        );
        assert.isTrue(
          statsd.timing.calledWithMatch('customs.checkIpOnly.success')
        );
      }
    });

    it('reports for /checkAuthenticated', async () => {
      fakeFetch.onCall(0).callsFake(() => Promise.resolve(fakeResponse(200, { block: true, blockReason: 'other' })));
      try {
        await customsWithUrl.checkAuthenticated(request, 'uid', action);
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
      fakeFetch.onCall(0).callsFake(() => Promise.resolve(fakeResponse(400, tags)));
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
