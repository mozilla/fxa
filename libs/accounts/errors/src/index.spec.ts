/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { fullStack } from 'verror';
import { AppError, Request } from './app-error';
import { OauthError } from './oauth-error';
import { RequestRoute } from 'hapi';

describe('AppErrors', () => {
  const mockApp = {
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
  };

  const mockRequest = {
    app: mockApp,
    route: { path: '/foo' },
  };

  // In a server environment, this should be configured or dynamically
  // determined from paths registered by the server!
  const mockOAuthRoutes = [
    {
      path: '/token',
      config: {
        cors: true,
      },
    },
  ];

  it('converts an OauthError into AppError when not an oauth route', function () {
    const oauthError = OauthError.invalidAssertion();
    expect(oauthError.errno).toEqual(104);

    const result = AppError.translate(
      {
        app: mockApp,
        route: { path: '/v1/oauth/token' },
      },
      oauthError,
      mockOAuthRoutes
    );
    expect(result).toBeInstanceOf(AppError);
    expect(result.errno).toEqual(110);
  });

  it('keeps an OauthError with an oauth route', () => {
    const oauthError = OauthError.invalidAssertion();
    expect(oauthError.errno).toEqual(104);

    const result = AppError.translate(
      { app: mockApp, route: { path: '/v1/token' } },
      oauthError,
      mockOAuthRoutes
    );

    expect(result).toBeInstanceOf(OauthError);
    expect(result.errno).toEqual(104);
  });

  it('should translate with missing required parameters', () => {
    const result = AppError.translate(
      mockRequest,
      {
        output: {
          payload: {
            message: `foo${'is required'}`,
            validation: {
              keys: ['bar', 'baz'],
            },
          },
        },
      },
      mockOAuthRoutes
    );
    expect(result).toBeInstanceOf(AppError);
    expect(result.errno).toEqual(108);
    expect(result.message).toEqual('Missing parameter in request body: bar');
    expect(result.output.statusCode).toEqual(400);
    expect(result.output.payload.error).toEqual('Bad Request');
    expect(result.output.payload.errno).toEqual(result.errno);
    expect(result.output.payload.message).toEqual(result.message);
    expect(result.output.payload.param).toEqual('bar');
  });

  it('should translate with payload data', () => {
    const data = {
      TIMESTAMP: '2021-01-16T01:43:33Z',
      CORRELATIONID: '950b61c42c10d',
      ACK: 'Failure',
      VERSION: '204',
      BUILD: '55251101',
      L_ERRORCODE0: '11451',
      L_SHORTMESSAGE0: 'Billing Agreement Id or transaction Id is not valid',
      L_LONGMESSAGE0: 'Billing Agreement Id or transaction Id is not valid',
      L_SEVERITYCODE0: 'Error',
    };

    const result = AppError.translate(
      mockRequest,
      {
        output: {
          statusCode: 500,
          payload: {
            error: 'Internal Server Error',
          },
        },
        data: data,
      },
      mockOAuthRoutes
    );

    expect(JSON.stringify(data)).toEqual(result.output.payload.data);
  });

  it('should translate with invalid parameter', () => {
    const result = AppError.translate(
      mockRequest,
      {
        output: {
          payload: {
            validation: 'foo',
          },
        },
      },
      mockOAuthRoutes
    );
    expect(result).toBeInstanceOf(AppError);
    expect(result.errno).toEqual(107);
    expect(result.message).toEqual('Invalid parameter in request body');
    expect(result.output.statusCode).toEqual(400);
    expect(result.output.payload.error).toEqual('Bad Request');
    expect(result.output.payload.errno).toEqual(result.errno);
    expect(result.output.payload.message).toEqual(result.message);
    expect(result.output.payload.validation).toEqual('foo');
  });

  it('should translate with missing payload', () => {
    const result = AppError.translate(
      mockRequest,
      {
        output: {},
      },
      mockOAuthRoutes
    );
    expect(result).toBeInstanceOf(AppError);
    expect(result.errno).toEqual(999);
    expect(result.message).toEqual('Unspecified error');
    expect(result.output.statusCode).toEqual(500);
    expect(result.output.payload.error).toEqual('Internal Server Error');
    expect(result.output.payload.errno).toEqual(result.errno);
    expect(result.output.payload.message).toEqual(result.message);
  });

  it('maps an errno to its key', () => {
    const error = AppError.cannotLoginNoPasswordSet();
    const actual = AppError.mapErrnoToKey(error);
    expect(actual).toEqual('UNABLE_TO_LOGIN_NO_PASSWORD_SET');
  });

  it('backend error includes a cause error when supplied', () => {
    const originalError = new Error('Service timed out.');
    const err = AppError.backendServiceFailure(
      'test',
      'checking',
      {},
      originalError
    );
    const fullError = fullStack(err);
    expect(fullError).toContain('caused by:');
    expect(fullError).toContain('Error: Service timed out.');
  });

  it('tooManyRequests', () => {
    let result = AppError.tooManyRequests(900, 'in 15 minutes');
    expect(result).toBeInstanceOf(AppError);
    expect(result.errno).toEqual(114);
    expect(result.message).toEqual('Client has sent too many requests');
    expect(result.output.statusCode).toEqual(429);
    expect(result.output.payload.error).toEqual('Too Many Requests');
    expect(result.output.payload.retryAfter).toEqual(900);
    expect(result.output.payload.retryAfterLocalized).toEqual('in 15 minutes');

    result = AppError.tooManyRequests(900);
    expect(result.output.payload.retryAfter).toEqual(900);
    expect(!result.output.payload.retryAfterLocalized).toBeTruthy();
  });

  it('iapInvalidToken', () => {
    const defaultErrorMessage = 'Invalid IAP token';
    let result = AppError.iapInvalidToken();
    expect(result).toBeInstanceOf(AppError);
    expect(result.errno).toEqual(196);
    expect(result.message).toEqual(defaultErrorMessage);
    expect(result.output.statusCode).toEqual(400);
    expect(result.output.payload.error).toEqual('Bad Request');

    result = AppError.iapInvalidToken({
      name: 'Invalid IAP Token',
      message: '',
    });
    expect(result.message).toEqual(defaultErrorMessage);

    result = AppError.iapInvalidToken({
      name: 'Invalid IAP Token',
      message: 'Wow helpful extra info',
    });
    expect(result.message).toEqual(
      `${defaultErrorMessage}: Wow helpful extra info`
    );
  });

  it('unexpectedError without request data', () => {
    const err = AppError.unexpectedError();
    expect(err).toBeInstanceOf(AppError);
    expect(err).toBeInstanceOf(Error);
    expect(err.errno).toEqual(999);
    expect(err.message).toEqual('Unspecified error');
    expect(err.output.statusCode).toEqual(500);
    expect(err.output.payload.error).toEqual('Internal Server Error');
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
      route: {
        path: '/v1/wibble',
      } as unknown as RequestRoute,
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
    } as unknown as Request);
    expect(err.errno).toEqual(999);
    expect(err.message).toEqual('Unspecified error');
    expect(err.output.statusCode).toEqual(500);
    expect(err.output.payload.error).toEqual('Internal Server Error');
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
      const result = AppError.translate(
        mockRequest,
        {
          output: {
            payload: {
              errno: 999,
              statusCode: 500,
            },
          },
          reason,
        },
        mockOAuthRoutes
      );

      expect(result).toBeInstanceOf(AppError);
      expect(result.errno).toEqual(203);
      expect(result.message).toEqual('System unavailable, try again soon');
      expect(result.output.statusCode).toEqual(500);
      expect(result.output.payload.error).toEqual('Internal Server Error');
      expect(result.output.payload.errno).toEqual(
        AppError.ERRNO.BACKEND_SERVICE_FAILURE
      );
      expect(result.output.payload.message).toEqual(
        'System unavailable, try again soon'
      );
    });
  });
});
