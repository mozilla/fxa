/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'chai',
  'underscore',
  'lib/validate',
  'lib/constants',
  '../../lib/helpers'
],
function (chai, _, Validate, Constants, TestHelpers) {
  'use strict';

  var assert = chai.assert;

  var createRandomHexString = TestHelpers.createRandomHexString;

  describe('lib/validate', function () {
    describe('isEmailValid', function () {
      it('returns false for email without a domain', function () {
        assert.isFalse(Validate.isEmailValid('a'));
      });

      it('returns false for email without a one part domain', function () {
        assert.isFalse(Validate.isEmailValid('a@b'));
      });

      it('returns true for valid email', function () {
        assert.isTrue(Validate.isEmailValid('a@b.c'));
      });
    });

    describe('isTokenValid', function () {
      it('returns false for non-hex value', function () {
        assert.isFalse(Validate.isTokenValid('this is a normal string'));
      });

      it('returns false for an odd-length hex value', function () {
        assert.isFalse(Validate.isTokenValid('abc'));
      });

      it('returns false for an empty string', function () {
        assert.isFalse(Validate.isTokenValid(''));
      });

      it('returns true for an even-length hex value', function () {
        assert.isTrue(Validate.isTokenValid('abcd'));
      });
    });

    describe('isCodeValid', function () {
      it('returns false for non-hex value', function () {
        assert.isFalse(Validate.isCodeValid('this is a normal string'));
      });

      it('returns false for an empty string', function () {
        assert.isFalse(Validate.isCodeValid(''));
      });

      it('returns false for one too few characters', function () {
        assert.isFalse(Validate.isCodeValid(createRandomHexString(Constants.CODE_LENGTH - 1)));
      });

      it('returns false for one too many characters', function () {
        assert.isFalse(Validate.isCodeValid(createRandomHexString(Constants.CODE_LENGTH + 1)));
      });

      it('returns true for just the right number', function () {
        assert.isTrue(Validate.isCodeValid(createRandomHexString(Constants.CODE_LENGTH)));
      });
    });

    describe('isOAuthCodeValid', function () {
      it('returns false for non-hex value', function () {
        assert.isFalse(Validate.isOAuthCodeValid('this is a normal string'));
      });

      it('returns false for an empty string', function () {
        assert.isFalse(Validate.isOAuthCodeValid(''));
      });

      it('returns false for one too few characters', function () {
        assert.isFalse(Validate.isOAuthCodeValid(createRandomHexString(Constants.OAUTH_CODE_LENGTH - 1)));
      });

      it('returns false for one too many characters', function () {
        assert.isFalse(Validate.isOAuthCodeValid(createRandomHexString(Constants.OAUTH_CODE_LENGTH + 1)));
      });

      it('returns true for just the right number', function () {
        assert.isTrue(Validate.isOAuthCodeValid(createRandomHexString(Constants.OAUTH_CODE_LENGTH)));
      });
    });

    describe('isUidValid', function () {
      it('returns false for non-hex value', function () {
        assert.isFalse(Validate.isUidValid('this is a normal string'));
      });

      it('returns false for an empty string', function () {
        assert.isFalse(Validate.isUidValid(''));
      });

      it('returns false for one too few characters', function () {
        assert.isFalse(Validate.isUidValid(createRandomHexString(Constants.UID_LENGTH - 1)));
      });

      it('returns false for one too many characters', function () {
        assert.isFalse(Validate.isUidValid(createRandomHexString(Constants.UID_LENGTH + 1)));
      });

      it('returns true for just the right number', function () {
        assert.isTrue(Validate.isUidValid(createRandomHexString(Constants.UID_LENGTH)));
      });
    });

    describe('isPasswordValid', function () {
      it('returns false with empty password', function () {
        assert.isFalse(Validate.isPasswordValid(''));
      });

      it('returns false with one too few characters', function () {
        assert.isFalse(Validate.isPasswordValid(createRandomHexString(Constants.PASSWORD_MIN_LENGTH - 1)));
      });

      it('returns true with minimum expected characters', function () {
        assert.isTrue(Validate.isPasswordValid(createRandomHexString(Constants.PASSWORD_MIN_LENGTH)));
      });
    });
  });
});
