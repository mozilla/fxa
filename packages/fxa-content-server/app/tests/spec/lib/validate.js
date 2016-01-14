/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var chai = require('chai');
  var Constants = require('lib/constants');
  var TestHelpers = require('../../lib/helpers');
  var Validate = require('lib/validate');

  var assert = chai.assert;

  var createRandomHexString = TestHelpers.createRandomHexString;

  describe('lib/validate', function () {
    describe('isEmailValid', function () {
      it('returns false for email without a domain', function () {
        assert.isFalse(Validate.isEmailValid('a'));
      });

      it('returns true for email with a one part domain', function () {
        assert.isTrue(Validate.isEmailValid('a@b'));
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
      it('returns false for non-string value', function () {
        assert.isFalse(Validate.isOAuthCodeValid(1235));
      });

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
      it('returns false for non-string password', function () {
        assert.isFalse(Validate.isPasswordValid(1234));
      });

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

    describe('isDataValid', function () {
      /*eslint-disable sorting/sort-object-props */

      it('is defined', function () {
        assert.isFunction(Validate.isDataValid);
      });

      it('expects two arguments', function () {
        assert.lengthOf(Validate.isDataValid, 2);
      });

      it('returns true when simple type matches the schema', function () {
        assert.isTrue(Validate.isDataValid('foo', 'String'));
      });

      it('returns false when simple type does not match the schema', function () {
        assert.isFalse(Validate.isDataValid('foo', 'Number'));
      });

      it('handles null', function () {
        assert.isTrue(Validate.isDataValid(null, 'Null'));
      });

      it('handles undefined', function () {
        assert.isTrue(Validate.isDataValid(undefined, 'Undefined'));
      });

      it('handles false', function () {
        assert.isTrue(Validate.isDataValid(false, 'Boolean'));
      });

      it('handles zero', function () {
        assert.isTrue(Validate.isDataValid(0, 'Number'));
      });

      it('handles empty string', function () {
        assert.isTrue(Validate.isDataValid('', 'String'));
      });

      it('returns true when complex type matches the schema', function () {
        assert.isTrue(Validate.isDataValid(
          [ 'foo', 3.14159265359, {} ],
          [ 'String', 'Number', 'Object' ]
        ));
      });

      it('returns false when complex type does not match the schema', function () {
        assert.isFalse(Validate.isDataValid(
          [ 'foo', 3.14159265359, [] ],
          [ 'String', 'Number', 'Object' ]
        ));
      });

      it('handles different key order', function () {
        assert.isTrue(Validate.isDataValid(
          { foo: 'bar', baz: 'qux' },
          { baz: 'String', foo: 'String' }
        ));
      });

      it('handles nested objects', function () {
        assert.isTrue(Validate.isDataValid(
          { foo: { bar: [ 'baz', 'qux' ] } },
          { foo: { bar: [ 'String', 'String' ] } }
        ));
        assert.isFalse(Validate.isDataValid(
          { foo: { bar: [ 'baz', 'qux' ] } },
          { foo: { bar: [ 'String', 'Number' ] } }
        ));
      });

      it('does not ignore undefined properties if schema property is undefined', function () {
        assert.isFalse(Validate.isDataValid(
          { foo: 'bar', baz: undefined },
          { foo: 'String' }
        ));
      });

      it('does not ignore undefined properties if schema property is defined', function () {
        assert.isFalse(Validate.isDataValid(
          { foo: 'bar', baz: undefined },
          { foo: 'String', baz: 'String' }
        ));
      });

      it('returns false if a property is not in the schema', function () {
        assert.isFalse(Validate.isDataValid(
          { foo: 'bar', baz: 'qux' },
          { foo: 'String' }
        ));
      });

      it('leading ? in schema property indicates optional', function () {
        assert.isTrue(Validate.isDataValid(null, '?String'));
        assert.isTrue(Validate.isDataValid(undefined, '?String'));
        assert.isFalse(Validate.isDataValid(false, '?String'));
        assert.isFalse(Validate.isDataValid(0, '?String'));
        assert.isTrue(Validate.isDataValid('', '?String'));
        assert.isTrue(Validate.isDataValid(
          { foo: 'bar', baz: undefined },
          { foo: 'String', baz: '?String' }
        ));
      });

      /*eslint-enable sorting/sort-object-props */
    });
  });
});
