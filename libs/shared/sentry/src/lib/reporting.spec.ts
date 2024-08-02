/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import * as uuid from 'uuid';
import { FILTERED } from './pii/filter-actions';
import { filterObject, ignoreError, isAuthServerError } from './reporting';
import { GraphQLError } from 'graphql';
import { HttpException } from '@nestjs/common';

describe('detects auth server error', () => {
  it('flags when code and errno are present', () => {
    const result = isAuthServerError({
      name: 'foo',
      message: 'bar',
      extensions: {
        code: 401,
        errno: 101,
      },
    });

    expect(result).toBeTruthy();
  });

  it('does not flag when code is missing', () => {
    const result = isAuthServerError({
      name: 'foo',
      message: 'bar',
      extensions: {
        errno: 101,
      },
    });

    expect(result).toBeFalsy();
  });

  it('does not flag when errno is missing', () => {
    const result = isAuthServerError({
      name: 'foo',
      message: 'bar',
      extensions: {
        code: 500,
      },
    });

    expect(result).toBeFalsy();
  });

  it('does not flag general errors', () => {
    const result = isAuthServerError({
      name: 'foo',
      message: 'bar',
    });

    expect(result).toBeFalsy();
  });
});
describe('error ignore policies', () => {
  it('should ignore known auth server errors', () => {
    expect(
      ignoreError({
        extensions: {
          code: 100,
          errno: 100,
        },
      })
    ).toBeTruthy();
  });

  it('should ignore apollo errors', () => {
    // Apollo errors should be sent to clients and we don't report them.
    const err = new GraphQLError('BOOM', {
      extensions: {
        code: 'BAD_REQUEST',
      },
    });
    expect(ignoreError(err)).toBeTruthy();
  });

  it('should ignore non 500 errors', () => {
    // Non-500s are expected responses for clients and we don't report them.
    expect(ignoreError(new HttpException('Not Found', 404))).toBeTruthy();
  });

  it('should ignore errors with originalError specified', () => {
    // This means we are dealing with a wrapped error, so don't report it.
    expect(ignoreError({ originalError: { status: 500 } })).toBeTruthy();
  });

  it('should not ignore general errors', () => {
    expect(ignoreError(new Error('BOOM'))).toBeFalsy();
  });

  it('should not ignore things that look like internal server error', () => {
    expect(ignoreError(new HttpException('BOOM', 500))).toBeFalsy();
  });

  it('should not ignore an unknown error type', () => {
    expect(ignoreError({ not: 'typical' })).toBeFalsy();
  });
});

describe('filterObject', () => {
  it('should be defined', () => {
    expect(filterObject).toBeDefined();
  });

  // Test Sentry QueryParams filtering types
  it('should filter array of key/value arrays', () => {
    const input = {
      type: undefined,
      extra: {
        foo: uuid.v4().replace(/-/g, ''),
        baz: uuid.v4().replace(/-/g, ''),
        bar: 'fred',
      },
    };
    const expected = {
      extra: {
        foo: FILTERED,
        baz: FILTERED,
        bar: 'fred',
      },
    };
    const output = filterObject(input);
    expect(output).toEqual(expected);
  });

  it('should filter an object of key/value pairs', () => {
    const input = {
      type: undefined,
      extra: {
        foo: uuid.v4().replace(/-/g, ''),
        baz: uuid.v4().replace(/-/g, ''),
        bar: 'fred',
      },
    };
    const expected = {
      extra: {
        foo: FILTERED,
        baz: FILTERED,
        bar: 'fred',
      },
    };
    const output = filterObject(input);
    expect(output).toEqual(expected);
  });

  it('should skip nested arrays that are not valid key/value arrays', () => {
    const input = {
      type: undefined,
      extra: {
        foo: uuid.v4().replace(/-/g, ''),
        bar: 'fred',
        fizz: ['buzz', 'parrot'],
      },
    };
    const expected = {
      extra: {
        foo: FILTERED,
        bar: 'fred',
        fizz: ['buzz', 'parrot'],
      },
    };
    const output = filterObject(input);
    expect(output).toEqual(expected);
  });
});
