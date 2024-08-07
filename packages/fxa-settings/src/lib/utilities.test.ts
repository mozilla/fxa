/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  constructHrefWithUtm,
  deepMerge,
  isBase32Crockford,
  once,
  resetOnce,
  searchParam,
  searchParams,
} from './utilities';

describe('deepMerge', () => {
  it('recursively merges multiple objects', () => {
    const objectOne = {
      value1: 'a',
      // replaced in objectTwo
      value2: 'b',
    };
    const objectTwo = {
      // replaces value in objectOne
      value2: 'c',
      value3: {
        nested1: {
          // replaced in objectThree
          nested2: 'd',
        },
      },
    };
    const objectThree = {
      value3: {
        nested1: {
          // replaces value in objectTwo
          nested2: 'f',
        },
        // added to value in objectTwo
        nested3: 'g',
      },
      value4: 'h',
    };

    const mergedObject = deepMerge(objectOne, objectTwo, objectThree);

    expect(mergedObject).toStrictEqual({
      value1: 'a',
      value2: 'c',
      value3: {
        nested1: {
          nested2: 'f',
        },
        nested3: 'g',
      },
      value4: 'h',
    });
  });
});

describe('searchParam', () => {
  it('returns a parameter from window.location.search, if it exists', () => {
    expect(searchParam('color', '?color=green')).toStrictEqual('green');
  });

  it('returns empty if parameter is empty', () => {
    expect(searchParam('color', '?color=')).toStrictEqual('');
  });

  it('returns empty if parameter is a space', () => {
    expect(searchParam('color', '?color= ')).toStrictEqual('');
  });

  it('returns undefined if parameter does not exist', () => {
    expect(searchParam('animal', '?color=green')).toBeUndefined();
  });
});

describe('searchParams', () => {
  const search = `?color=green&email=${encodeURIComponent(
    'testuser@testuser.com'
  )}#color=brown&email=${encodeURIComponent('hash@testuser.com')}`;

  it('converts search string to an object, returns all key/value pairs if no allowlist specified', () => {
    const params = searchParams(search);
    expect(params.color).toStrictEqual('green');
    expect(params.email).toStrictEqual('testuser@testuser.com');
  });

  it('returns only items in allow list of one is specified', () => {
    const params = searchParams(search, ['color', 'notDefined']);
    expect(params.color).toStrictEqual('green');
    expect('email' in params).toBeFalsy();
    expect('notDefined' in params).toBeFalsy();
  });

  it('returns an empty object if no query params', () => {
    let params = searchParams('');
    expect(Object.keys(params)).toHaveLength(0);

    params = searchParams('', ['blue']);
    expect(Object.keys(params)).toHaveLength(0);
  });
});

describe('isBase32Crockford', () => {
  it('is case insensitive', () => {
    expect(isBase32Crockford('ADF2EGK4HJJ4BTKF')).toBe(true);
    expect(isBase32Crockford('adf2egk4hjj4btkf')).toBe(true);
    expect(isBase32Crockford('Adf2eGk4hjJ4BtKF')).toBe(true);
  });

  it('rejects I, L, O, U', () => {
    expect(isBase32Crockford('0123456789ABCDEFGHJKMNPQRSTVWXYZ')).toBe(true);

    expect(isBase32Crockford('I')).toBe(false);
    expect(isBase32Crockford('L')).toBe(false);
    expect(isBase32Crockford('O')).toBe(false);
    expect(isBase32Crockford('U')).toBe(false);
  });
});

describe('once', () => {
  let count = 0;
  const cb = () => {
    count++;
  };

  beforeEach(() => {
    count = 0;
    resetOnce();
  });

  it('calls at least once', () => {
    once('foo', cb);
    expect(count).toEqual(1);
  });

  it('calls no more than once', () => {
    once('foo', cb);
    once('foo', cb);
    expect(count).toEqual(1);
  });

  it('call no more than once per key', () => {
    once('foo', cb);
    once('bar', cb);
    once('bar', cb);
    expect(count).toEqual(2);
  });
});

describe('constructHrefWithUtm', () => {
  test('should construct URL with given UTM parameters', () => {
    const pathname = 'https://example.com';
    const utmMedium = 'mozilla-websites';
    const utmSource = 'moz-account';
    const utmTerm = 'bento';
    const utmContent = 'fx-desktop';
    const utmCampaign = 'permanent';

    const result = constructHrefWithUtm(
      pathname,
      utmMedium,
      utmSource,
      utmTerm,
      utmContent,
      utmCampaign
    );

    const expected =
      'https://example.com?utm_source=moz-account&utm_medium=mozilla-websites&utm_term=bento&utm_content=fx-desktop&utm_campaign=permanent';
    expect(result).toBe(expected);
  });

  test('should construct URL with different UTM parameters', () => {
    const pathname = 'https://example.com';
    const utmMedium = 'product-partnership';
    const utmSource = 'moz-account';
    const utmTerm = 'sidebar';
    const utmContent = 'vpn';
    const utmCampaign = 'connect-device';

    const result = constructHrefWithUtm(
      pathname,
      utmMedium,
      utmSource,
      utmTerm,
      utmContent,
      utmCampaign
    );

    const expected =
      'https://example.com?utm_source=moz-account&utm_medium=product-partnership&utm_term=sidebar&utm_content=vpn&utm_campaign=connect-device';
    expect(result).toBe(expected);
  });
});
