import { cleanUpQueryParam, filterObject } from './utils';
import * as uuid from 'uuid';
import { FILTERED } from '@fxa/shared/sentry-utils';

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

describe('cleanUpQueryParam', () => {
  it('properly erases sensitive information', () => {
    const fixtureUrl1 =
      'https://accounts.firefox.com/complete_reset_password?token=foo&code=bar&email=some%40restmail.net';
    const expectedUrl1 =
      'https://accounts.firefox.com/complete_reset_password?token=VALUE&code=VALUE&email=VALUE';
    const resultUrl1 = cleanUpQueryParam(fixtureUrl1);

    expect(resultUrl1).toEqual(expectedUrl1);
  });

  it('properly erases sensitive information, keeps allowed fields', () => {
    const fixtureUrl2 =
      'https://accounts.firefox.com/signup?client_id=foo&service=sync';
    const expectedUrl2 =
      'https://accounts.firefox.com/signup?client_id=foo&service=sync';
    const resultUrl2 = cleanUpQueryParam(fixtureUrl2);

    expect(resultUrl2).toEqual(expectedUrl2);
  });

  it('properly returns the url when there is no query', () => {
    const expectedUrl = 'https://accounts.firefox.com/signup';
    const resultUrl = cleanUpQueryParam(expectedUrl);

    expect(resultUrl).toEqual(expectedUrl);
  });
});
