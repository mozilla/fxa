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

    describe('pathToScreenName', function () {
      it('strips leading /', function () {
        assert.equal(Url.pathToScreenName('/signin'), 'signin');
      });

      it('strips trailing /', function () {
        assert.equal(Url.pathToScreenName('signup/'), 'signup');
      });

      it('leaves middle / alone', function () {
        assert.equal(Url.pathToScreenName('/legal/tos/'), 'legal/tos');
      });

      it('strips search parameters', function () {
        assert.equal(Url.pathToScreenName('complete_sign_up?email=testuser@testuser.com'), 'complete_sign_up');
      });
    });

    describe('isHTTP', function () {
      it('detects HTTP and HTTPS properly', function () {
        assert.isFalse(Url.isHTTP('urn:ietf:wg:oauth:2.0:fx:webchannel'));
        assert.isTrue(Url.isHTTP('https://find.firefox.com'));
        assert.isTrue(Url.isHTTP('http://find.firefox.com'));
        assert.isFalse(Url.isHTTP(''));
        assert.isFalse(Url.isHTTP());
      });
    });
  });
});


