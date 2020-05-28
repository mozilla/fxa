/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { deepMerge, searchParam, searchParams } from './utilities';

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
