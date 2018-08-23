/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import Url from 'lib/url';

describe('lib/url', function () {
  describe('searchParam', function () {
    it('returns a parameter from window.location.search, if it exists',
      function () {
        assert.equal(Url.searchParam('color', '?color=green'), 'green');
      });

    it('returns empty if parameter is empty', function () {
      assert.equal(Url.searchParam('color', '?color='), '');
    });

    it('returns empty if parameter is a space', function () {
      assert.equal(Url.searchParam('color', '?color= '), '');
    });

    it('returns undefined if parameter does not exist', function () {
      assert.isUndefined(Url.searchParam('animal', '?color=green'));
    });

    it('throws if str override is not specified', function () {
      assert.throws(() => Url.searchParam('animal'));
    });
  });

  describe('searchParams', () => {
    const search = '?color=green&email=' + encodeURIComponent('testuser@testuser.com');

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

  describe('objToSearchString', function () {
    it('includes all keys with values', function () {
      var params = {
        hasValue: 'value',
        nullNotIncluded: null,
        undefinedNotIncluded: undefined
      };

      assert.equal(Url.objToSearchString(params), '?hasValue=value');
    });

    it('returns an empty string if no parameters are passed in', function () {
      assert.equal(Url.objToSearchString({}), '');
    });
  });

  describe('getOrigin', function () {
    it('returns the origin portion of the URL', function () {
      assert.equal(
        Url.getOrigin('https://marketplace.firefox.com/redirect/to_this_page'),
        'https://marketplace.firefox.com'
      );
    });

    it('works with non-standard ports', function () {
      assert.equal(
        Url.getOrigin('http://testdomain.org:8443/strips/this'),
        'http://testdomain.org:8443'
      );
    });

    it('returns correct origin if query directly follows hostname', function () {
      assert.equal(
        Url.getOrigin('http://testdomain.org?query'),
        'http://testdomain.org'
      );
    });

    it('returns correct origin if query directly follows port', function () {
      assert.equal(
        Url.getOrigin('http://testdomain.org:8443?query'),
        'http://testdomain.org:8443'
      );
    });

    it('returns correct origin if hash directly follows hostname', function () {
      assert.equal(
        Url.getOrigin('http://testdomain.org#hash'),
        'http://testdomain.org'
      );
    });

    it('returns correct origin if hash directly follows port', function () {
      assert.equal(
        Url.getOrigin('http://testdomain.org:8443#hash'),
        'http://testdomain.org:8443'
      );
    });

    it('returns `null` if scheme is missing', function () {
      assert.equal(
        Url.getOrigin('testdomain.org'),
        null
      );
    });

    it('returns `null` if scheme is missing and port specified', function () {
      assert.equal(
        Url.getOrigin('testdomain.org:8443'),
        null
      );
    });

    it('returns `null` if hostname is missing', function () {
      assert.equal(
        Url.getOrigin('http://'),
        null
      );
    });
  });

  describe('updateSearchString', function () {
    it('adds new params while leaving the old ones intact', function () {
      var updated = Url.updateSearchString('?foo=one', {
        bar: 'two',
        baz: 'three'
      });
      assert.equal(updated, '?foo=one&bar=two&baz=three');
    });

    it('updates values for existing params', function () {
      var updated = Url.updateSearchString('?foo=one', {
        foo: 'two'
      });
      assert.equal(updated, '?foo=two');
    });

    it('adds a search string if none exists', function () {
      var updated = Url.updateSearchString('http://example.com', {
        bar: 'two',
        foo: 'one'
      });
      assert.equal(updated, 'http://example.com?bar=two&foo=one');
    });
  });

  describe('cleanSearchString', () => {
    it('works correctly if no search params are passed', () => {
      const cleanedSearchString =
          Url.cleanSearchString('https://accounts.firefox.com/');

      assert.equal(
        cleanedSearchString, 'https://accounts.firefox.com/');
    });

    it('removes any undeclared search parameters', () => {
      const cleanedSearchString = Url.cleanSearchString(
        'https://accounts.firefox.com/?allowed=true&notAllowed=false',
        [ 'allowed' ]
      );

      assert.equal(
        cleanedSearchString, 'https://accounts.firefox.com/?allowed=true');
    });
  });
});
