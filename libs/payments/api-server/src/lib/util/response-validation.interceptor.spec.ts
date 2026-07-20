/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  CallHandler,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as Sentry from '@sentry/node';
import { firstValueFrom, of } from 'rxjs';
import { z } from 'zod';
import {
  ResponseValidationInterceptor,
  sanitizeZodIssues,
} from './response-validation.interceptor';

jest.mock('@sentry/node', () => ({
  captureException: jest.fn(),
}));

describe('ResponseValidationInterceptor', () => {
  let interceptor: ResponseValidationInterceptor;
  let reflector: Reflector;

  const mockSchema = z.object({
    id: z.string(),
    value: z.number(),
  });

  function createMockContext(): ExecutionContext {
    return {
      getHandler: () => function testHandler() {},
      getClass: () => class TestController {},
    } as unknown as ExecutionContext;
  }

  function createMockCallHandler(data: unknown): CallHandler {
    return { handle: () => of(data) };
  }

  beforeEach(() => {
    jest.clearAllMocks();
    reflector = new Reflector();
    interceptor = new ResponseValidationInterceptor(reflector);
  });

  it('passes through unchanged when no schema is defined', async () => {
    jest.spyOn(reflector, 'get').mockReturnValue(undefined);
    const data = { anything: 'goes' };

    const result = await firstValueFrom(
      interceptor.intercept(createMockContext(), createMockCallHandler(data))
    );

    expect(result).toBe(data);
  });

  it('passes through valid responses without error logging', async () => {
    jest.spyOn(reflector, 'get').mockReturnValue(mockSchema);
    const errorSpy = jest
      .spyOn(interceptor['logger'], 'error')
      .mockImplementation();
    const data = { id: 'abc', value: 42 };

    const result = await firstValueFrom(
      interceptor.intercept(createMockContext(), createMockCallHandler(data))
    );

    expect(result).toEqual(data);
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('throws InternalServerErrorException when validation fails', async () => {
    jest.spyOn(reflector, 'get').mockReturnValue(mockSchema);
    jest.spyOn(interceptor['logger'], 'error').mockImplementation();
    const invalidData = { id: 123, value: 'not-a-number' };

    await expect(
      firstValueFrom(
        interceptor.intercept(
          createMockContext(),
          createMockCallHandler(invalidData)
        )
      )
    ).rejects.toThrow(InternalServerErrorException);
  });

  it('reports validation failures to Sentry', async () => {
    jest.spyOn(reflector, 'get').mockReturnValue(mockSchema);
    jest.spyOn(interceptor['logger'], 'error').mockImplementation();
    const invalidData = { id: 123, value: 'not-a-number' };

    await firstValueFrom(
      interceptor.intercept(
        createMockContext(),
        createMockCallHandler(invalidData)
      )
    ).catch(() => {});

    expect(Sentry.captureException).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Response validation failed for TestController.testHandler',
      }),
      expect.objectContaining({
        tags: {
          source: 'ResponseValidationInterceptor',
          controller: 'TestController',
          handler: 'testHandler',
        },
      })
    );
  });

  it('captures logging errors to Sentry via safeLogError', async () => {
    jest.spyOn(reflector, 'get').mockReturnValue(mockSchema);
    jest.spyOn(interceptor['logger'], 'error').mockImplementation(() => {
      throw new Error('logging broke');
    });
    const invalidData = { id: 123, value: 'not-a-number' };

    await firstValueFrom(
      interceptor.intercept(
        createMockContext(),
        createMockCallHandler(invalidData)
      )
    ).catch(() => {});

    // First call: safeLogError catches the logging failure
    expect(Sentry.captureException).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'logging broke' }),
      expect.objectContaining({
        tags: { source: 'ResponseValidationInterceptor' },
      })
    );
    // Second call: the validation failure itself
    expect(Sentry.captureException).toHaveBeenCalledTimes(2);
  });
});

describe('sanitizeZodIssues', () => {
  it('keeps only code and path, stripping message and other fields', () => {
    const issues = [
      {
        code: 'invalid_type',
        expected: 'string',
        path: ['email'],
        message: 'Invalid input: expected string, received number',
      },
    ] as z.core.$ZodIssue[];

    const result = sanitizeZodIssues(issues);

    expect(result).toEqual([{ code: 'invalid_type', path: ['email'] }]);
    expect(result[0]).not.toHaveProperty('message');
    expect(result[0]).not.toHaveProperty('expected');
  });

  it('sanitizes multiple issues', () => {
    const issues = [
      {
        code: 'invalid_type',
        expected: 'string',
        path: ['name'],
        message: 'Required',
      },
      {
        code: 'invalid_value',
        values: ['a', 'b'],
        path: ['status'],
        message: 'Invalid option: expected one of "a"|"b"',
      },
    ] as z.core.$ZodIssue[];

    const result = sanitizeZodIssues(issues);

    expect(result).toEqual([
      { code: 'invalid_type', path: ['name'] },
      { code: 'invalid_value', path: ['status'] },
    ]);
  });

  it('returns an empty array for no issues', () => {
    expect(sanitizeZodIssues([])).toEqual([]);
  });
});
