/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const verror = require('verror');
const AppError = require('../../lib/error');
const OauthError = require('../../lib/oauth/error');

describe('AppErrors', () => {
  it('exported functions exist', () => {
    assert.equal(typeof AppError, 'function');
    assert.equal(AppError.length, 4);
    assert.equal(typeof AppError.translate, 'function');
    assert.lengthOf(AppError.translate, 2);
    assert.equal(typeof AppError.invalidRequestParameter, 'function');
    assert.equal(AppError.invalidRequestParameter.length, 1);
    assert.equal(typeof AppError.missingRequestParameter, 'function');
    assert.equal(AppError.missingRequestParameter.length, 1);
  });

  it('converts an OauthError into AppError when not an oauth route', function () {
    this.timeout(5000);
    const oauthError = OauthError.invalidAssertion();
    assert.equal(oauthError.errno, 104);
    const result = AppError.translate(
      { route: { path: '/v1/oauth/token' } },
      oauthError
    );
    assert.ok(result instanceof AppError, 'instanceof AppError');
    assert.equal(result.errno, 110);
  });

  it('keeps an OauthError with an oauth route', () => {
    const oauthError = OauthError.invalidAssertion();
    assert.equal(oauthError.errno, 104);
    const result = AppError.translate(
      { route: { path: '/v1/token' } },
      oauthError
    );
    assert.ok(result instanceof OauthError, 'instanceof OauthError');
    assert.equal(result.errno, 104);
  });

  it('should translate with missing required parameters', () => {
    const result = AppError.translate(null, {
      output: {
        payload: {
          message: `foo${'is required'}`,
          validation: {
            keys: ['bar', 'baz'],
          },
        },
      },
    });
    assert.ok(result instanceof AppError, 'instanceof AppError');
    assert.equal(result.errno, 108);
    assert.equal(result.message, 'Missing parameter in request body: bar');
    assert.equal(result.output.statusCode, 400);
    assert.equal(result.output.payload.error, 'Bad Request');
    assert.equal(result.output.payload.errno, result.errno);
    assert.equal(result.output.payload.message, result.message);
    assert.equal(result.output.payload.param, 'bar');
  });

  it('should translate with payload data', () => {
    const data = require('./payments/fixtures/paypal/do_reference_transaction_failure.json');

    const result = AppError.translate(null, {
      output: {
        statusCode: 500,
        payload: {
          error: 'Internal Server Error',
        },
      },
      data: data,
    });

    assert.equal(JSON.stringify(data), result.output.payload.data);
  });

  it('should translate with invalid parameter', () => {
    const result = AppError.translate(null, {
      output: {
        payload: {
          validation: 'foo',
        },
      },
    });
    assert.ok(result instanceof AppError, 'instanceof AppError');
    assert.equal(result.errno, 107);
    assert.equal(result.message, 'Invalid parameter in request body');
    assert.equal(result.output.statusCode, 400);
    assert.equal(result.output.payload.error, 'Bad Request');
    assert.equal(result.output.payload.errno, result.errno);
    assert.equal(result.output.payload.message, result.message);
    assert.equal(result.output.payload.validation, 'foo');
  });

  it('should translate with missing payload', () => {
    const result = AppError.translate(null, {
      output: {},
    });
    assert.ok(result instanceof AppError, 'instanceof AppError');
    assert.equal(result.errno, 999);
    assert.equal(result.message, 'Unspecified error');
    assert.equal(result.output.statusCode, 500);
    assert.equal(result.output.payload.error, 'Internal Server Error');
    assert.equal(result.output.payload.errno, result.errno);
    assert.equal(result.output.payload.message, result.message);
  });

  it('maps an errno to its key', () => {
    const error = AppError.cannotLoginNoPasswordSet();
    const actual = AppError.mapErrnoToKey(error);
    assert.equal(actual, 'UNABLE_TO_LOGIN_NO_PASSWORD_SET');
  });

  it('backend error includes a cause error when supplied', () => {
    const originalError = new Error('Service timed out.');
    const err = AppError.backendServiceFailure(
      'test',
      'checking',
      {},
      originalError
    );
    const fullError = verror.fullStack(err);
    assert.include(fullError, 'caused by:');
    assert.include(fullError, 'Error: Service timed out.');
  });

  it('tooManyRequests', () => {
    let result = AppError.tooManyRequests(900, 'in 15 minutes');
    assert.ok(result instanceof AppError, 'instanceof AppError');
    assert.equal(result.errno, 114);
    assert.equal(result.message, 'Client has sent too many requests');
    assert.equal(result.output.statusCode, 429);
    assert.equal(result.output.payload.error, 'Too Many Requests');
    assert.equal(result.output.payload.retryAfter, 900);
    assert.equal(result.output.payload.retryAfterLocalized, 'in 15 minutes');

    result = AppError.tooManyRequests(900);
    assert.equal(result.output.payload.retryAfter, 900);
    assert(!result.output.payload.retryAfterLocalized);
  });

  it('iapInvalidToken', () => {
    const defaultErrorMessage = 'Invalid IAP token';
    let result = AppError.iapInvalidToken();
    assert.ok(result instanceof AppError, 'instanceof AppError');
    assert.equal(result.errno, 196);
    assert.equal(result.message, defaultErrorMessage);
    assert.equal(result.output.statusCode, 400);
    assert.equal(result.output.payload.error, 'Bad Request');

    let iapAPIError = { someProp: 123 };
    result = AppError.iapInvalidToken(iapAPIError);
    assert.equal(result.message, defaultErrorMessage);

    iapAPIError = { message: 'Wow helpful extra info' };
    result = AppError.iapInvalidToken(iapAPIError);
    assert.equal(
      result.message,
      `${defaultErrorMessage}: ${iapAPIError.message}`
    );
  });

  it('unexpectedError without request data', () => {
    const err = AppError.unexpectedError();
    assert.instanceOf(err, AppError);
    assert.instanceOf(err, Error);
    assert.equal(err.errno, 999);
    assert.equal(err.message, 'Unspecified error');
    assert.equal(err.output.statusCode, 500);
    assert.equal(err.output.payload.error, 'Internal Server Error');
    assert.isUndefined(err.output.payload.request);
  });

  it('unexpectedError with request data', () => {
    const err = AppError.unexpectedError({
      app: {
        acceptLanguage: 'en, fr',
        locale: 'en',
        geo: {
          city: 'Mountain View',
          state: 'California',
        },
        ua: {
          os: 'Android',
          osVersion: '9',
        },
        devices: Promise.resolve([{ id: 1 }]),
        metricsContext: Promise.resolve({
          service: 'sync',
        }),
      },
      method: 'GET',
      path: '/v1/wibble',
      query: {
        foo: 'bar',
      },
      payload: {
        baz: 'qux',
        email: 'foo@example.com',
        displayName: 'Foo Bar',
        metricsContext: {
          utmSource: 'thingy',
        },
        service: 'sync',
      },
      headers: {
        // x-forwarded-for is stripped out because it contains internal server IPs
        // See https://github.com/mozilla/fxa-private/issues/66
        'x-forwarded-for': '192.168.1.1 192.168.2.2',
        wibble: 'blee',
      },
    });
    assert.equal(err.errno, 999);
    assert.equal(err.message, 'Unspecified error');
    assert.equal(err.output.statusCode, 500);
    assert.equal(err.output.payload.error, 'Internal Server Error');
    assert.deepEqual(err.output.payload.request, {
      acceptLanguage: 'en, fr',
      locale: 'en',
      userAgent: {
        os: 'Android',
        osVersion: '9',
      },
      method: 'GET',
      path: '/v1/wibble',
      query: {
        foo: 'bar',
      },
      payload: {
        metricsContext: {
          utmSource: 'thingy',
        },
        service: 'sync',
      },
      headers: {
        wibble: 'blee',
      },
    });
  });

  const reasons = ['socket hang up', 'ECONNREFUSED'];
  reasons.forEach((reason) => {
    it(`converts ${reason} errors to backend service error`, () => {
      const result = AppError.translate(null, {
        output: {
          payload: {
            errno: 999,
            statusCode: 500,
          },
        },
        reason,
      });

      assert.ok(result instanceof AppError, 'instanceof AppError');
      assert.equal(result.errno, 203);
      assert.equal(result.message, 'System unavailable, try again soon');
      assert.equal(result.output.statusCode, 500);
      assert.equal(result.output.payload.error, 'Internal Server Error');
      assert.equal(
        result.output.payload.errno,
        AppError.ERRNO.BACKEND_SERVICE_FAILURE
      );
      assert.equal(
        result.output.payload.message,
        'System unavailable, try again soon'
      );
    });
  });
});
