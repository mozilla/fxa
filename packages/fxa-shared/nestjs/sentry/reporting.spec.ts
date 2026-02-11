/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import * as uuid from 'uuid';

import { filterObject, isAuthServerError } from './reporting';

const FILTERED = '[Filtered]';

function getUid() {
  return uuid.v4().replace(/-/g, '');
}

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

describe('filterObject', () => {
  it('should be defined', () => {
    expect(filterObject).toBeDefined();
  });

  // Test Sentry QueryParams filtering types
  it('should filter array of key/value arrays', () => {
    const input = {
      type: undefined,
      extra: {
        foo: getUid(),
        baz: getUid(),
        bar: 'fred',
      },
    };
    const expected = {
      type: undefined,
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
        foo: getUid(),
        baz: getUid(),
        bar: 'fred',
      },
    };
    const expected = {
      type: undefined,
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
        foo: getUid(),
        bar: 'fred',
        fizz: ['buzz', 'parrot'],
      },
    };
    const expected = {
      type: undefined,
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
