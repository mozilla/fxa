/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const verror = require('verror');
const messages = require('joi/lib/language');
const AppError = require('../../lib/error');
const P = require('../../lib/promise');

describe('AppErrors', () => {
  it('tightly-coupled joi message hack is okay', () => {
    assert.equal(typeof messages.errors.any.required, 'string');
    assert.notEqual(messages.errors.any.required, '');
  });

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

  it('should translate with missing required parameters', () => {
    const result = AppError.translate(null, {
      output: {
        payload: {
          message: `foo${messages.errors.any.required}`,
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

  it('backend error includes a cause error when supplied', () => {
    const originalError = new Error('Service timed out.');
    const err = AppError.backendServiceFailure(
      'test',
      'checking',
      {},
      originalError
    );
    const fullError = verror.fullStack(err);
    assert.include(fullError, 'caused by: Error: Service timed out.');
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
        devices: P.resolve([{ id: 1 }]),
        metricsContext: P.resolve({
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
  reasons.forEach(reason => {
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
      assert.equal(result.message, 'A backend service request failed.');
      assert.equal(result.output.statusCode, 500);
      assert.equal(result.output.payload.error, 'Internal Server Error');
      assert.equal(
        result.output.payload.errno,
        AppError.ERRNO.BACKEND_SERVICE_FAILURE
      );
      assert.equal(
        result.output.payload.message,
        'A backend service request failed.'
      );
    });
  });
});
