/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import verror from 'verror';
import { AppError, OauthError } from '@fxa/accounts/errors';

const mockOauthRoutes = [
  {
    path: '/token',
    config: { cors: true },
  },
];

describe('AppErrors', () => {
  it('exported functions exist', () => {
    expect(typeof AppError).toBe('function');
    expect(AppError.length).toBe(4);
    expect(typeof AppError.translate).toBe('function');
    expect(AppError.translate.length).toBe(3);
    expect(typeof AppError.invalidRequestParameter).toBe('function');
    expect(AppError.invalidRequestParameter.length).toBe(1);
    expect(typeof AppError.missingRequestParameter).toBe('function');
    expect(AppError.missingRequestParameter.length).toBe(1);
  });

  it('converts an OauthError into AppError when not an oauth route', () => {
    const oauthError = OauthError.invalidAssertion();
    expect(oauthError.errno).toBe(104);
    const result = AppError.translate(
      { route: { path: '/v1/oauth/token' } } as any,
      oauthError,
      mockOauthRoutes
    );
    expect(result instanceof AppError).toBe(true);
    expect(result.errno).toBe(110);
  });

  it('keeps an OauthError with an oauth route', () => {
    const oauthError = OauthError.invalidAssertion();
    expect(oauthError.errno).toBe(104);
    const result = AppError.translate(
      { route: { path: '/v1/token' } } as any,
      oauthError,
      mockOauthRoutes
    );
    expect(result instanceof OauthError).toBe(true);
    expect(result.errno).toBe(104);
  });

  it('should translate with missing required parameters', () => {
    const result = AppError.translate(null as any, {
      output: {
        payload: {
          message: `foo${'is required'}`,
          validation: {
            keys: ['bar', 'baz'],
          },
        },
      },
    } as any, []);
    expect(result instanceof AppError).toBe(true);
    expect(result.errno).toBe(108);
    expect(result.message).toBe('Missing parameter in request body: bar');
    expect(result.output.statusCode).toBe(400);
    expect(result.output.payload.error).toBe('Bad Request');
    expect(result.output.payload.errno).toBe(result.errno);
    expect(result.output.payload.message).toBe(result.message);
    expect(result.output.payload.param).toBe('bar');
  });

  it('should translate with payload data', () => {
    const data = require('../test/local/payments/fixtures/paypal/do_reference_transaction_failure.json');

    const result = AppError.translate(null as any, {
      output: {
        statusCode: 500,
        payload: {
          error: 'Internal Server Error',
        },
      },
      data: data,
    } as any, []);

    expect(JSON.stringify(data)).toBe(result.output.payload.data);
  });

  it('should translate with invalid parameter', () => {
    const result = AppError.translate(null as any, {
      output: {
        payload: {
          validation: 'foo',
        },
      },
    } as any, []);
    expect(result instanceof AppError).toBe(true);
    expect(result.errno).toBe(107);
    expect(result.message).toBe('Invalid parameter in request body');
    expect(result.output.statusCode).toBe(400);
    expect(result.output.payload.error).toBe('Bad Request');
    expect(result.output.payload.errno).toBe(result.errno);
    expect(result.output.payload.message).toBe(result.message);
    expect(result.output.payload.validation).toBe('foo');
  });

  it('should translate with missing payload', () => {
    const result = AppError.translate(null as any, {
      output: {},
    } as any, []);
    expect(result instanceof AppError).toBe(true);
    expect(result.errno).toBe(999);
    expect(result.message).toBe('Unspecified error');
    expect(result.output.statusCode).toBe(500);
    expect(result.output.payload.error).toBe('Internal Server Error');
    expect(result.output.payload.errno).toBe(result.errno);
    expect(result.output.payload.message).toBe(result.message);
  });

  it('maps an errno to its key', () => {
    const error = AppError.cannotLoginNoPasswordSet();
    const actual = AppError.mapErrnoToKey(error);
    expect(actual).toBe('UNABLE_TO_LOGIN_NO_PASSWORD_SET');
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
    expect(fullError).toContain('caused by:');
    expect(fullError).toContain('Error: Service timed out.');
  });

  it('tooManyRequests', () => {
    let result = AppError.tooManyRequests(900, 'in 15 minutes');
    expect(result instanceof AppError).toBe(true);
    expect(result.errno).toBe(114);
    expect(result.message).toBe('Client has sent too many requests');
    expect(result.output.statusCode).toBe(429);
    expect(result.output.payload.error).toBe('Too Many Requests');
    expect(result.output.payload.retryAfter).toBe(900);
    expect(result.output.payload.retryAfterLocalized).toBe('in 15 minutes');

    result = AppError.tooManyRequests(900);
    expect(result.output.payload.retryAfter).toBe(900);
    expect(result.output.payload.retryAfterLocalized).toBeUndefined();
  });

  it('iapInvalidToken', () => {
    const defaultErrorMessage = 'Invalid IAP token';
    let result = AppError.iapInvalidToken();
    expect(result instanceof AppError).toBe(true);
    expect(result.errno).toBe(196);
    expect(result.message).toBe(defaultErrorMessage);
    expect(result.output.statusCode).toBe(400);
    expect(result.output.payload.error).toBe('Bad Request');

    let iapAPIError: any = { someProp: 123 };
    result = AppError.iapInvalidToken(iapAPIError);
    expect(result.message).toBe(defaultErrorMessage);

    iapAPIError = { message: 'Wow helpful extra info' };
    result = AppError.iapInvalidToken(iapAPIError);
    expect(result.message).toBe(
      `${defaultErrorMessage}: ${iapAPIError.message}`
    );
  });

  it('unexpectedError without request data', () => {
    const err = AppError.unexpectedError();
    expect(err instanceof AppError).toBe(true);
    expect(err instanceof Error).toBe(true);
    expect(err.errno).toBe(999);
    expect(err.message).toBe('Unspecified error');
    expect(err.output.statusCode).toBe(500);
    expect(err.output.payload.error).toBe('Internal Server Error');
    expect(err.output.payload.request).toBeUndefined();
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
    } as any);
    expect(err.errno).toBe(999);
    expect(err.message).toBe('Unspecified error');
    expect(err.output.statusCode).toBe(500);
    expect(err.output.payload.error).toBe('Internal Server Error');
    expect(err.output.payload.request).toEqual({
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
      const result = AppError.translate(null as any, {
        output: {
          payload: {
            errno: 999,
            statusCode: 500,
          },
        },
        reason,
      } as any, []);

      expect(result instanceof AppError).toBe(true);
      expect(result.errno).toBe(203);
      expect(result.message).toBe('System unavailable, try again soon');
      expect(result.output.statusCode).toBe(500);
      expect(result.output.payload.error).toBe('Internal Server Error');
      expect(result.output.payload.errno).toBe(AppError.ERRNO.BACKEND_SERVICE_FAILURE);
      expect(result.output.payload.message).toBe(
        'System unavailable, try again soon'
      );
    });
  });
});
