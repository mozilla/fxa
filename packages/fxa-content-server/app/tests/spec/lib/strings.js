/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// test the interpolated library

define(function (require, exports, module) {
  'use strict';

  var chai = require('chai');
  var Strings = require('lib/strings');

  var assert = chai.assert;

  describe('lib/strings', function () {
    describe('interpolate', function () {
      it('can do string interpolation on unnamed `%s` when given array context', function () {
        var stringToInterpolate = 'Hi %s, this is interpolated.';
        var interpolated = Strings.interpolate(stringToInterpolate, ['testuser@testuser.com']);
        assert.equal(interpolated,
              'Hi testuser@testuser.com, this is interpolated.');
      });

      it('can do string interpolation on named `%(name)s` when given array context', function () {
        var stringToInterpolate = 'Error encountered trying to register: %(email)s.';
        var interpolated = Strings.interpolate(stringToInterpolate, {
          email: 'testuser@testuser.com'
        });
        assert.equal(interpolated,
              'Error encountered trying to register: testuser@testuser.com.');
      });

      it('can do interpolation multiple times with an array', function () {
        var stringToInterpolate = 'Hi %s, you have been signed in since %s';
        var interpolated = Strings.interpolate(stringToInterpolate, [
          'testuser@testuser.com', 'noon'
        ]);

        assert.equal(interpolated,
              'Hi testuser@testuser.com, you have been signed in since noon');
      });

      it('can do interpolation multiple times with an object', function () {
        var stringToInterpolate = 'Hi %(email)s, you have been signed in since %(time)s';
        var interpolated = Strings.interpolate(stringToInterpolate, {
          email: 'testuser@testuser.com',
          time: 'noon'
        });

        assert.equal(interpolated,
              'Hi testuser@testuser.com, you have been signed in since noon');
      });

      it('does no replacement on %s and %(name)s if not in context', function () {
        var stringToInterpolate = 'Hi %s, you have been signed in since %(time)s';
        var interpolated = Strings.interpolate(stringToInterpolate);

        assert.equal(interpolated, stringToInterpolate);
      });

      it('leaves remaining %s if not enough items in context', function () {
        var stringToInterpolate = 'Hi %s, you have been signed in since %s';
        var interpolated = Strings.interpolate(stringToInterpolate, ['testuser@testuser.com']);

        assert.equal(interpolated, 'Hi testuser@testuser.com, you have been signed in since %s');
      });
    });
  });
});


