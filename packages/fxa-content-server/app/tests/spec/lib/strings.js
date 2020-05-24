/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// test the interpolated library

import chai from 'chai';
import Strings from 'lib/strings';

var assert = chai.assert;

describe('lib/strings', function () {
  describe('interpolate', function () {
    it('can do string interpolation on unnamed `%s` when given array context', function () {
      var stringToInterpolate = 'Hi %s, this is interpolated.';
      var interpolated = Strings.interpolate(stringToInterpolate, [
        'testuser@testuser.com',
      ]);
      assert.equal(
        interpolated,
        'Hi testuser@testuser.com, this is interpolated.'
      );
    });

    it('can do string interpolation on named `%(name)s` when given array context', function () {
      var stringToInterpolate =
        'Error encountered trying to register: %(email)s.';
      var interpolated = Strings.interpolate(stringToInterpolate, {
        email: 'testuser@testuser.com',
      });
      assert.equal(
        interpolated,
        'Error encountered trying to register: testuser@testuser.com.'
      );
    });

    it('can do interpolation multiple times with an array', function () {
      var stringToInterpolate = 'Hi %s, you have been signed in since %s';
      var interpolated = Strings.interpolate(stringToInterpolate, [
        'testuser@testuser.com',
        'noon',
      ]);

      assert.equal(
        interpolated,
        'Hi testuser@testuser.com, you have been signed in since noon'
      );
    });

    it('can do interpolation multiple times with an object', function () {
      var stringToInterpolate =
        'Hi %(email)s, you have been signed in since %(time)s';
      var interpolated = Strings.interpolate(stringToInterpolate, {
        email: 'testuser@testuser.com',
        time: 'noon',
      });

      assert.equal(
        interpolated,
        'Hi testuser@testuser.com, you have been signed in since noon'
      );
    });

    it('does no replacement on %s and %(name)s if not in context', function () {
      var stringToInterpolate = 'Hi %s, you have been signed in since %(time)s';
      var interpolated = Strings.interpolate(stringToInterpolate);

      assert.equal(interpolated, stringToInterpolate);
    });

    it('leaves remaining %s if not enough items in context', function () {
      var stringToInterpolate = 'Hi %s, you have been signed in since %s';
      var interpolated = Strings.interpolate(stringToInterpolate, [
        'testuser@testuser.com',
      ]);

      assert.equal(
        interpolated,
        'Hi testuser@testuser.com, you have been signed in since %s'
      );
    });
  });

  describe('hasHTML', () => {
    it('returns `false` if the string contains no HTML', () => {
      assert.isFalse(Strings.hasHTML(''));
      assert.isFalse(Strings.hasHTML('contains no HTML'));
      assert.isFalse(Strings.hasHTML('contains no <html'));
      assert.isFalse(Strings.hasHTML('contains no >html'));
    });

    it('returns `true` if the string contains HTML', () => {
      assert.isTrue(Strings.hasHTML('contains <html>'));
      assert.isTrue(Strings.hasHTML('contains <html/>'));
      assert.isTrue(Strings.hasHTML('contains < html/>'));
      assert.isTrue(Strings.hasHTML('contains < html />'));
      assert.isTrue(Strings.hasHTML('contains <html />'));
      assert.isTrue(Strings.hasHTML('contains <> HTML like construct'));
      assert.isTrue(Strings.hasHTML('contains </> HTML like construct'));
      assert.isTrue(Strings.hasHTML('contains &nbsp; HTML escaped character'));
      assert.isTrue(Strings.hasHTML('contains &#63; HTML escaped character'));
    });
  });

  describe('hasUnsafeVariables', () => {
    it('returns `false` if the string contains no variables', () => {
      assert.isFalse(Strings.hasUnsafeVariables(''));
      assert.isFalse(Strings.hasUnsafeVariables('nothing to interpolate'));
    });

    it('returns `false` if variables are escaped', () => {
      assert.isFalse(
        Strings.hasUnsafeVariables('this has a %(escapedVariable)s')
      );
      assert.isFalse(
        Strings.hasUnsafeVariables(
          'this has multiple %(escapedVariable)s, here %(escapedToo)s'
        )
      );
    });

    it('returns `true` for unnamed variables', () => {
      assert.isTrue(Strings.hasUnsafeVariables('%s'));
    });

    it('returns `true` for variables w/o an `escaped` prefix', () => {
      assert.isTrue(
        Strings.hasUnsafeVariables('this has an %(unsafeVariable)s')
      );
      assert.isTrue(
        Strings.hasUnsafeVariables(
          'this has both %(escapedSafeVariable)s and %(unsafeVariable)s'
        )
      );
    });
  });
});
