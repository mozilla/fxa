/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { CallHandler, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GqlExecutionContext } from '@nestjs/graphql';
import { of, throwError } from 'rxjs';
import { createMock } from '@golevelup/ts-jest';
import { AuditLogInterceptor, sanitizeObject } from './audit-log.interceptor';
import { MozLoggerService } from '@fxa/shared/mozlog';
import { AppConfig } from '../config';
import * as Sentry from '@sentry/node';

jest.mock('@nestjs/graphql', () => ({
  GqlExecutionContext: {
    create: jest.fn(),
  },
}));

jest.mock('@sentry/node', () => ({
  captureException: jest.fn(),
}));

describe('AuditLogInterceptor', () => {
  let interceptor: AuditLogInterceptor;
  let logger: jest.Mocked<MozLoggerService>;
  let configService: jest.Mocked<ConfigService<AppConfig>>;
  let mockContext: jest.Mocked<ExecutionContext>;
  let mockCallHandler: jest.Mocked<CallHandler>;
  let mockGqlContext: any;

  beforeEach(() => {
    logger = {
      info: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
    } as any;

    // Default config with standard sanitizeProperties
    configService = {
      get: jest.fn().mockReturnValue({
        auditSanitizeProperties: [
          'password',
          'sessionToken',
          'token',
          'secret',
          'key',
          'auth',
        ],
      }),
    } as any;

    mockGqlContext = {
      getContext: jest.fn().mockReturnValue({
        req: {
          user: 'admin@example.com',
        },
      }),
      getArgs: jest.fn().mockReturnValue({
        uid: 'test-uid-123',
        locale: 'en-US',
      }),
    };

    (GqlExecutionContext.create as jest.Mock).mockReturnValue(mockGqlContext);

    mockContext = createMock<ExecutionContext>();
    mockContext.getHandler.mockReturnValue({
      name: 'testMutation',
    } as any);

    mockCallHandler = createMock<CallHandler>();
    mockCallHandler.handle.mockReturnValue(of({ success: true }));

    interceptor = new AuditLogInterceptor(logger, configService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    (Sentry.captureException as jest.Mock).mockClear();
    // Reset config to default
    configService.get.mockReturnValue({
      auditSanitizeProperties: [
        'password',
        'sessionToken',
        'token',
        'secret',
        'key',
        'auth',
      ],
    });
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should log initiated status before execution', (done) => {
    // The initiated log happens synchronously before next.handle() is called
    // So we can check it was called, and verify it happened before the handler executes
    const observable = interceptor.intercept(mockContext, mockCallHandler);

    expect(logger.info).toHaveBeenCalledWith('admin-audit', {
      user: 'admin@example.com',
      action: 'testMutation',
      timestamp: expect.any(String),
      payload: {
        uid: 'test-uid-123',
        locale: 'en-US',
      },
      status: 'initiated',
    });

    expect(logger.info).toHaveBeenCalledTimes(1);

    // Now, subscribe and verify we have two calls (initiated + success)
    observable.subscribe({
      next: () => {
        expect(logger.info).toHaveBeenCalledTimes(2);
        done();
      },
    });
  });

  it('should log success status after successful execution', (done) => {
    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: () => {
        const calls = logger.info.mock.calls;
        expect(calls.length).toBeGreaterThanOrEqual(2);

        const successCall = calls.find((call) => call[1]?.status === 'success');
        expect(successCall).toBeDefined();
        expect(successCall?.[1]).toMatchObject({
          user: 'admin@example.com',
          action: 'testMutation',
          status: 'success',
          result: { success: true },
        });
        done();
      },
    });
  });

  it('should log error status when execution fails', (done) => {
    const testError = new Error('Test error');
    mockCallHandler.handle.mockReturnValue(throwError(() => testError));

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      error: () => {
        const errorCall = logger.error.mock.calls[0];
        expect(errorCall).toBeDefined();
        expect(errorCall?.[0]).toBe('admin-audit');
        expect(errorCall?.[1]).toMatchObject({
          user: 'admin@example.com',
          action: 'testMutation',
          status: 'error',
          error: 'Test error',
          errorName: 'Error',
        });
        done();
      },
    });
  });

  it('should sanitize sensitive data in payload', (done) => {
    mockGqlContext.getArgs.mockReturnValue({
      uid: 'test-uid-123',
      password: 'secret123',
      token: 'abc123',
      secretKey: 'my-secret',
    });

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: () => {
        const initiatedCall = logger.info.mock.calls.find(
          (call) => call[1]?.status === 'initiated'
        );
        expect(initiatedCall?.[1]?.payload).toEqual({
          uid: 'test-uid-123',
          password: '[REDACTED]',
          token: '[REDACTED]',
          secretKey: '[REDACTED]',
        });
        done();
      },
    });
  });

  it('should handle unknown user when request.user is not set', (done) => {
    mockGqlContext.getContext.mockReturnValue({
      req: {},
    });

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: () => {
        const initiatedCall = logger.info.mock.calls.find(
          (call) => call[1]?.status === 'initiated'
        );
        expect(initiatedCall?.[1]?.user).toBe('unknown');
        done();
      },
    });
  });

  it('should handle boolean results correctly', (done) => {
    mockCallHandler.handle.mockReturnValue(of(true));

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: () => {
        const successCall = logger.info.mock.calls.find(
          (call) => call[1]?.status === 'success'
        );
        expect(successCall?.[1]?.result).toBe(true);
        done();
      },
    });
  });

  it('should handle null results correctly', (done) => {
    mockCallHandler.handle.mockReturnValue(of(null));

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: () => {
        const successCall = logger.info.mock.calls.find(
          (call) => call[1]?.status === 'success'
        );
        expect(successCall?.[1].result).toBeNull();
        done();
      },
    });
  });

  it('should handle undefined results correctly', (done) => {
    mockCallHandler.handle.mockReturnValue(of(undefined));

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: () => {
        const successCall = logger.info.mock.calls.find(
          (call) => call[1]?.status === 'success'
        );
        expect(successCall?.[1].result).toBeUndefined();
        done();
      },
    });
  });

  it('should not block the request if logging throws an error', (done) => {
    const loggingError = new Error('Logging service error');
    logger.info.mockImplementation(() => {
      throw loggingError;
    });

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: (result) => {
        // Request should complete successfully despite logging error
        expect(result).toEqual({ success: true });
        expect(logger.info).toHaveBeenCalled();
        // Verify Sentry was called with the logging error
        expect(Sentry.captureException).toHaveBeenCalledWith(
          loggingError,
          expect.objectContaining({
            tags: expect.objectContaining({
              source: 'AuditLogInterceptor',
              logType: 'info',
            }),
            extra: expect.objectContaining({
              logData: expect.objectContaining({
                status: 'initiated',
              }),
            }),
          })
        );
        done();
      },
      error: () => {
        done.fail('Request should not fail when logging throws an error');
      },
    });
  });

  it('should not block the request if logging throws an error during success logging', (done) => {
    // Make logger.info throw an error only on the second call (success logging)
    let callCount = 0;
    const loggingError = new Error('Logging service error');
    logger.info.mockImplementation(() => {
      callCount++;
      if (callCount === 2) {
        throw loggingError;
      }
    });

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: (result) => {
        expect(result).toEqual({ success: true });
        expect(logger.info).toHaveBeenCalledTimes(2);
        // Verify Sentry was called with the logging error
        expect(Sentry.captureException).toHaveBeenCalledWith(
          loggingError,
          expect.objectContaining({
            tags: expect.objectContaining({
              source: 'AuditLogInterceptor',
              logType: 'info',
            }),
            extra: expect.objectContaining({
              logData: expect.objectContaining({
                status: 'success',
              }),
            }),
          })
        );
        done();
      },
      error: () => {
        done.fail('Request should not fail when logging throws an error');
      },
    });
  });

  it('should not block the request if logging throws an error during error logging', (done) => {
    const testError = new Error('Test handler error');
    mockCallHandler.handle.mockReturnValue(throwError(() => testError));

    const loggingError = new Error('Logging service error');
    logger.error.mockImplementation(() => {
      throw loggingError;
    });

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      error: (error) => {
        // Original error should propagate, not the logging error
        expect(error).toBe(testError);
        expect(logger.error).toHaveBeenCalled();
        // Verify Sentry was called with the logging error (not the handler error)
        expect(Sentry.captureException).toHaveBeenCalledWith(
          loggingError,
          expect.objectContaining({
            tags: expect.objectContaining({
              source: 'AuditLogInterceptor',
              logType: 'error',
            }),
            extra: expect.objectContaining({
              logData: expect.objectContaining({
                status: 'error',
              }),
            }),
          })
        );
        done();
      },
    });
  });

  describe('config-based sanitization', () => {
    it('should use custom sanitizeProperties from config', (done) => {
      configService.get.mockReturnValue({
        auditSanitizeProperties: ['jedi', 'password', 'token'],
      });

      const customInterceptor = new AuditLogInterceptor(logger, configService);

      mockGqlContext.getArgs.mockReturnValue({
        uid: 'test-uid-123',
        password: 'secret123',
        jedi: 'luke-skywalker',
        token: 'abc123',
        email: 'test@example.com', // Should not be redacted, it's not in the config mock above
      });

      customInterceptor.intercept(mockContext, mockCallHandler).subscribe({
        next: () => {
          const initiatedCall = logger.info.mock.calls.find(
            (call) => call[1]?.status === 'initiated'
          );
          expect(initiatedCall?.[1]?.payload).toEqual({
            uid: 'test-uid-123',
            password: '[REDACTED]',
            jedi: '[REDACTED]', // Custom property should be redacted
            token: '[REDACTED]',
            email: 'test@example.com', // Should remain unchanged
          });
          done();
        },
      });
    });
  });
});

describe('sanitizePayload', () => {
  const sensitiveKeys = ['password', 'sessionToken', 'secret'];

  it('should return object unchanged if it is not an object', () => {
    const payload = 'test-string';
    const sanitized = sanitizeObject(payload, sensitiveKeys);
    expect(sanitized).toBe(payload); // .toBe to ensure we get back the same object reference
  });

  it('should return object unchanged if it is null or undefined', () => {
    const payload = null;
    const sanitized = sanitizeObject(payload, sensitiveKeys);
    expect(sanitized).toBe(payload);
  });

  it('should return matching object if no sensitive keys are found', () => {
    const payload = {
      uid: 'test-uid-123',
      password: 'secret123',
      token: 'abc123',
      secretKey: 'my-secret',
    };
    const sanitized = sanitizeObject(payload, ['not-a-sensitive-key']);
    expect(sanitized).toEqual(payload);
  });

  it('should return object unchanged if sensitiveKeys is an empty array', () => {
    const payload = {
      uid: 'test-uid-123',
      password: 'secret123',
      token: 'abc123',
      secretKey: 'my-secret',
    };
    const sanitized = sanitizeObject(payload, []);
    expect(sanitized).toBe(payload);
  });
  it('should sanitize sensitive data in payload', () => {
    const payload = {
      uid: 'test-uid-123',
      password: 'secret123',
      token: 'abc123',
      secretKey: 'my-secret',
    };
    const sanitized = sanitizeObject(payload, sensitiveKeys);
    expect(sanitized).toEqual({
      uid: 'test-uid-123',
      password: '[REDACTED]',
      token: 'abc123', // not in sensitive keys, should not be redacted
      secretKey: '[REDACTED]',
    });
  });

  it('should sanitize nested objects', () => {
    const payload = {
      uid: 'test-uid-123',
      nested: {
        password: 'secret123',
        token: 'abc123',
        secretKey: 'my-secret',
      },
      password: 'secret123',
      token: 'abc123',
      secretKey: 'my-secret',
    };
    const sanitized = sanitizeObject(payload, sensitiveKeys);
    expect(sanitized).toEqual({
      uid: 'test-uid-123',
      nested: {
        password: '[REDACTED]',
        token: 'abc123', // not in sensitive keys, should not be redacted
        secretKey: '[REDACTED]',
      },
      password: '[REDACTED]',
      token: 'abc123', // not in sensitive keys, should not be redacted
      secretKey: '[REDACTED]',
    });
  });
  it('should sanitize array of objects', () => {
    const payload = [
      {
        uid: 'test-uid-123',
        password: 'secret123',
        token: 'abc123',
        secretKey: 'my-secret',
      },
    ];
    const sanitized = sanitizeObject(payload, sensitiveKeys);
    expect(sanitized).toEqual([
      {
        uid: 'test-uid-123',
        password: '[REDACTED]',
        token: 'abc123', // not in sensitive keys, should not be redacted
        secretKey: '[REDACTED]',
      },
    ]);
  });
  it('should sanitize a nested array of objects with nested objects', () => {
    const payload = {
      uid: 'test-uid-123',
      nestedArray: [
        {
          password: 'secret123',
          token: 'abc123',
          secretKey: 'my-secret',
          nestedObject: {
            password: 'secret123',
            token: 'abc123',
            secretKey: 'my-secret',
          },
        },
      ],
    };
    const sanitized = sanitizeObject(payload, sensitiveKeys);
    expect(sanitized).toEqual({
      uid: 'test-uid-123',
      nestedArray: [
        {
          password: '[REDACTED]',
          token: 'abc123', // not in sensitive keys, should not be redacted
          secretKey: '[REDACTED]',
          nestedObject: {
            password: '[REDACTED]',
            token: 'abc123', // not in sensitive keys, should not be redacted
            secretKey: '[REDACTED]',
          },
        },
      ],
    });
  });

  it('should sanitize keys regardless of case', () => {
    const payload = {
      uid: 'test-uid-123',
      password: 'secret123',
      token: 'abc123',
      secretKey: 'my-secret',
    };
    const sanitized = sanitizeObject(payload, ['Password']);
    expect(sanitized).toEqual({
      uid: 'test-uid-123',
      password: '[REDACTED]', // should be redacted because of case insensitive match
      token: 'abc123',
      secretKey: 'my-secret',
    });
  });
});
