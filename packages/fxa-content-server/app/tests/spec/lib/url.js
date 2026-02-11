/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import Url from 'lib/url';

describe('lib/url', () => {
  describe('searchParam', () => {
    it('returns a parameter from window.location.search, if it exists', () => {
      assert.equal(Url.searchParam('color', '?color=green'), 'green');
    });

    it('returns empty if parameter is empty', () => {
      assert.equal(Url.searchParam('color', '?color='), '');
    });

    it('returns empty if parameter is a space', () => {
      assert.equal(Url.searchParam('color', '?color= '), '');
    });

    it('returns undefined if parameter does not exist', () => {
      assert.isUndefined(Url.searchParam('animal', '?color=green'));
    });
  });

  describe('searchParams', () => {
    const search = `?color=green&email=${encodeURIComponent(
      'testuser@testuser.com'
    )}#color=brown&email=${encodeURIComponent('hash@testuser.com')}`;

    it('converts search string to an object, returns all key/value pairs if no allowlist specified', () => {
      const params = Url.searchParams(search);
      assert.equal(params.color, 'green');
      assert.equal(params.email, 'testuser@testuser.com');
    });

    it('returns only items in allow list of one is specified', () => {
      const params = Url.searchParams(search, ['color', 'notDefined']);
      assert.equal(params.color, 'green');
      assert.isFalse('email' in params);
      assert.isFalse('notDefined' in params);
    });

    it('returns an empty object if no query params', () => {
      let params = Url.searchParams('');
      assert.lengthOf(Object.keys(params), 0);

      params = Url.searchParams('', ['blue']);
      assert.lengthOf(Object.keys(params), 0);
    });
  });

  describe('hashParams', () => {
    const search = `?color=green&email=${encodeURIComponent(
      'testuser@testuser.com'
    )}#color=brown&email=${encodeURIComponent('hash@testuser.com')}`;

    it('converts hash string to an object, returns all key/value pairs if no allowlist specified', () => {
      const params = Url.hashParams(search);
      assert.equal(params.color, 'brown');
      assert.equal(params.email, 'hash@testuser.com');
    });

    it('returns only items in allow list of one is specified', () => {
      const params = Url.hashParams(search, ['color', 'notDefined']);
      assert.equal(params.color, 'brown');
      assert.isFalse('email' in params);
      assert.isFalse('notDefined' in params);
    });

    it('returns an empty object if no hash params', () => {
      let params = Url.hashParams('');
      assert.lengthOf(Object.keys(params), 0);

      params = Url.hashParams('', ['blue']);
      assert.lengthOf(Object.keys(params), 0);
    });
  });

  describe('objToSearchString', () => {
    it('includes all keys with values', () => {
      var params = {
        hasValue: 'value',
        nullNotIncluded: null,
        undefinedNotIncluded: undefined,
      };

      assert.equal(Url.objToSearchString(params), '?hasValue=value');
    });

    it('returns an empty string if no parameters are passed in', () => {
      assert.equal(Url.objToSearchString({}), '');
    });
  });

  describe('objToHashString', () => {
    it('includes all keys with values', () => {
      var params = {
        hasValue: 'value',
        nullNotIncluded: null,
        undefinedNotIncluded: undefined,
      };

      assert.equal(Url.objToHashString(params), '#hasValue=value');
    });

    it('returns an empty string if no parameters are passed in', () => {
      assert.equal(Url.objToSearchString({}), '');
    });
  });

  describe('_getObjPairs', () => {
    it('returns an array containing an array of parent positioning values, and the current value', () => {
      assert.deepEqual(Url._getObjPairs(['howdy', 'sup']), [
        [['0'], 'howdy'],
        [['1'], 'sup'],
      ]);
    });

    it('can receive additional parent values and append them', () => {
      assert.deepEqual(Url._getObjPairs(['howdy', 'sup'], ['variations']), [
        [['variations', '0'], 'howdy'],
        [['variations', '1'], 'sup'],
      ]);
    });
  });

  describe('objToUrlString', () => {
    it('includes all keys with values', () => {
      var params = {
        hasValue: 'value',
        nullNotIncluded: null,
        undefinedNotIncluded: undefined,
      };

      assert.equal(Url.objToUrlString(params, '#'), '#hasValue=value');
    });

    it('supports nested objects and arrays', () => {
      var params = {
        phrase: 'hello',
        variations: ['howdy', 'sup'],
        translations: {
          french: ['bonjour', 'salut'],
          spanish: 'hola',
        },
      };

      assert.equal(
        Url.objToUrlString(params, '?'),
        `?phrase=hello&
          variations[0]=howdy&
          variations[1]=sup&
          translations[french][0]=bonjour&
          translations[french][1]=salut&
          translations[spanish]=hola`.replace(/\n|\s/g, '')
      );
    });

    it('returns an empty string if no parameters are passed in', () => {
      assert.equal(Url.objToUrlString({}), '');
    });
  });

  describe('getOrigin', () => {
    it('returns the origin portion of the URL', () => {
      assert.equal(
        Url.getOrigin('https://marketplace.firefox.com/redirect/to_this_page'),
        'https://marketplace.firefox.com'
      );
    });

    it('works with non-standard ports', () => {
      assert.equal(
        Url.getOrigin('http://testdomain.org:8443/strips/this'),
        'http://testdomain.org:8443'
      );
    });

    it('returns correct origin if query directly follows hostname', () => {
      assert.equal(
        Url.getOrigin('http://testdomain.org?query'),
        'http://testdomain.org'
      );
    });

    it('returns correct origin if query directly follows port', () => {
      assert.equal(
        Url.getOrigin('http://testdomain.org:8443?query'),
        'http://testdomain.org:8443'
      );
    });

    it('returns correct origin if hash directly follows hostname', () => {
      assert.equal(
        Url.getOrigin('http://testdomain.org#hash'),
        'http://testdomain.org'
      );
    });

    it('returns correct origin if hash directly follows port', () => {
      assert.equal(
        Url.getOrigin('http://testdomain.org:8443#hash'),
        'http://testdomain.org:8443'
      );
    });

    it('returns `null` if scheme is missing', () => {
      assert.equal(Url.getOrigin('testdomain.org'), null);
    });

    it('returns `null` if scheme is missing and port specified', () => {
      assert.equal(Url.getOrigin('testdomain.org:8443'), null);
    });

    it('returns `null` if hostname is missing', () => {
      assert.equal(Url.getOrigin('http://'), null);
    });
  });

  describe('updateSearchString', () => {
    it('adds new params while leaving the old ones intact', () => {
      var updated = Url.updateSearchString('?foo=one', {
        bar: 'two',
        baz: 'three',
      });
      assert.equal(updated, '?foo=one&bar=two&baz=three');
    });

    it('updates values for existing params', () => {
      var updated = Url.updateSearchString('?foo=one', {
        foo: 'two',
      });
      assert.equal(updated, '?foo=two');
    });

    it('adds a search string if none exists', () => {
      var updated = Url.updateSearchString('http://example.com', {
        bar: 'two',
        foo: 'one',
      });
      assert.equal(updated, 'http://example.com?bar=two&foo=one');
    });
  });

  describe('cleanSearchString', () => {
    it('works correctly if no search params are passed', () => {
      const cleanedSearchString = Url.cleanSearchString(
        'https://accounts.firefox.com/'
      );

      assert.equal(cleanedSearchString, 'https://accounts.firefox.com/');
    });

    it('removes any undeclared search parameters', () => {
      const cleanedSearchString = Url.cleanSearchString(
        'https://accounts.firefox.com/?allowed=true&notAllowed=false',
        ['allowed']
      );

      assert.equal(
        cleanedSearchString,
        'https://accounts.firefox.com/?allowed=true'
      );
    });
  });
});
