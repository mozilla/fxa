/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'mocha',
  'chai',
  'underscore',
  'lib/url',
  'processed/constants'
],
function (mocha, chai, _, Url, Constants) {
  var assert = chai.assert;
  var channel;

  describe('lib/url', function () {
    describe('searchParam', function () {
      it('returns a parameter from window.location.serach, if it exists',
          function() {
        assert.equal(Url.searchParam('color', '?color=green'), 'green');
      });

      it('returns undefined if parameter does not exist', function() {
        assert.isUndefined(Url.searchParam('animal', '?color=green'));
      });

      it('does not throw if str override is not specified', function() {
        assert.isUndefined(Url.searchParam('animal'));
      });
    });
  });
});


