/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import _ from 'underscore';
import chai from 'chai';
import Constants from 'lib/constants';
import XSS from 'lib/xss';

var assert = chai.assert;

describe('lib/xss', function() {
  describe('href', function() {
    function expectEmpty(url) {
      assert.isUndefined(XSS.href(url));
    }

    it('allows http href', function() {
      assert.equal(XSS.href('http://all.good'), 'http://all.good');
    });

    it('allows https href', function() {
      assert.equal(XSS.href('https://all.good'), 'https://all.good');
    });

    it('allows href with query parameters', function() {
      assert.equal(
        XSS.href('https://all.good?with_query'),
        'https://all.good?with_query'
      );
    });

    it('allows but escapes URLs that try to break out', function() {
      assert.equal(
        XSS.href('http://href.gone.bad" onclick="javascript(1)"'),
        'http://href.gone.bad%22%20onclick=%22javascript(1)%22'
      );
    });

    it('disallows javascript: href', function() {
      expectEmpty('javascript:alert(1)'); //eslint-disable-line no-script-url
    });

    it('disallows href without a scheme', function() {
      expectEmpty('no.scheme');
    });

    it('disallows relative scheme', function() {
      expectEmpty('//relative.scheme');
    });

    it('disallows data URI scheme', function() {
      expectEmpty('data:text/plain;base64,SGVsbG8sIFdvcmxkIQ%3D%3D');
    });

    it('only allows strings', function() {
      var disallowedItems = [1, true, new Date(), {}, []];

      _.each(disallowedItems, expectEmpty);
    });

    it('allows hrefs of the max length', function() {
      var maxLength = Constants.URL_MAX_LENGTH;
      var allowed = 'http://';

      while (allowed.length < maxLength) {
        allowed += 'a';
      }

      assert.equal(XSS.href(allowed), allowed);
    });

    it('disallowed hrefs that are too long', function() {
      var maxLength = Constants.URL_MAX_LENGTH;
      var tooLong = 'http://';

      while (tooLong.length < maxLength + 1) {
        tooLong += 'a';
      }

      expectEmpty(tooLong);
    });
  });
});
