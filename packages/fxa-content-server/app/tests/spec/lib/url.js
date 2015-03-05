/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'underscore',
  'lib/url'
],
function (chai, _, Url) {
  var assert = chai.assert;

  describe('lib/url', function () {
    describe('searchParam', function () {
      it('returns a parameter from window.location.search, if it exists',
          function () {
            assert.equal(Url.searchParam('color', '?color=green'), 'green');
          });

      it('returns undefined if parameter does not exist', function () {
        assert.isUndefined(Url.searchParam('animal', '?color=green'));
      });

      it('does not throw if str override is not specified', function () {
        assert.isUndefined(Url.searchParam('animal'));
      });
    });

    describe('searchParams', function () {
      var search = '?color=green&email=' + encodeURIComponent('testuser@testuser.com');

      it('returns all parameters from window.location.search, if no whitelist specified',
          function () {
            var params = Url.searchParams(search);
            assert.equal(params.color, 'green');
            assert.equal(params.email, 'testuser@testuser.com');
          });

      it('only returns whitelisted parameters from window.location.search, if whitelist specified',
          function () {
            var params = Url.searchParams(search, ['color', 'notDefined']);
            assert.equal(params.color, 'green');
            assert.isFalse('email' in params);
            assert.isFalse('notDefined' in params);
          });

    });

    describe('objToSearchString', function () {
      it('includes all keys with values', function () {
        var params = {
          hasValue: 'value',
          notIncluded: undefined
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
  });
});


