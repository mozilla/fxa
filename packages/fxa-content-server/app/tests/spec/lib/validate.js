/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import Constants from 'lib/constants';
import TestHelpers from '../../lib/helpers';
import Validate from 'lib/validate';

const createRandomBase36String = (length) =>
  TestHelpers.createRandomString(length, 36);
const createRandomHexString = TestHelpers.createRandomHexString;

describe('lib/validate', function () {
  describe('isEmailValid', function () {
    it('returns true for valid email', function () {
      assert.isTrue(Validate.isEmailValid('a@b.c'));
    });

    it('returns false for email without a local part', function () {
      assert.isFalse(Validate.isEmailValid('@b.c'));
    });

    it('returns false for email without a domain', function () {
      assert.isFalse(Validate.isEmailValid('a@'));
    });

    it('returns false for email with a single-part domain', function () {
      assert.isFalse(Validate.isEmailValid('a@b'));
    });

    it('returns true for email with 64-character local part', function () {
      assert.isTrue(Validate.isEmailValid(createRandomHexString(64) + '@b.c'));
    });

    it('returns false for email with 65-character local part', function () {
      assert.isFalse(Validate.isEmailValid(createRandomHexString(65) + '@b.c'));
    });

    it('returns true for email with 256 characters', function () {
      assert.isTrue(
        Validate.isEmailValid('a@' + createRandomHexString(252) + '.b')
      );
    });

    it('returns false for email with 257 characters', function () {
      assert.isFalse(
        Validate.isEmailValid('a@' + createRandomHexString(253) + '.b')
      );
    });

    it('returns true for valid emails from auth server tests', function () {
      [
        'tim@tim-example.net',
        'a+b+c@wibble.example.com',
        '#!?-@t-e-s-t.c-o-m',
        // The next two test cases are commented out until we support
        // unicode email addresses in the content server.
        //String.fromCharCode(1234) + '@example.com',
        //'test@' + String.fromCharCode(5678) + '.com'
      ].forEach(function (email) {
        assert.isTrue(Validate.isEmailValid(email), email + ' should be valid');
      });
    });

    it('returns false for invalid emails from auth server tests', function () {
      [
        'notAnEmailAddress',
        '\n@example.com',
        'me@hello world.com',
        'me@hello+world.com',
        'me@.example',
        'me@example.com-',
        'me@example..com',
        'me@-example-.com',
        'me@example-.com',
        'me@example.-com',
      ].forEach(function (email) {
        assert.isFalse(
          Validate.isEmailValid(email),
          email + ' should not be valid'
        );
      });
    });

    it('returns true if email address contains an apostrophe', function () {
      assert.isTrue(Validate.isEmailValid("a'b@example.com"));
    });

    it('returns false if email address contains a single quote', function () {
      assert.isFalse(Validate.isEmailValid('a’b@example.com'));
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
      assert.isFalse(
        Validate.isCodeValid(createRandomHexString(Constants.CODE_LENGTH - 1))
      );
    });

    it('returns false for one too many characters', function () {
      assert.isFalse(
        Validate.isCodeValid(createRandomHexString(Constants.CODE_LENGTH + 1))
      );
    });

    it('returns true for just the right number', function () {
      assert.isTrue(
        Validate.isCodeValid(createRandomHexString(Constants.CODE_LENGTH))
      );
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
      assert.isFalse(
        Validate.isOAuthCodeValid(
          createRandomHexString(Constants.OAUTH_CODE_LENGTH - 1)
        )
      );
    });

    it('returns false for one too many characters', function () {
      assert.isFalse(
        Validate.isOAuthCodeValid(
          createRandomHexString(Constants.OAUTH_CODE_LENGTH + 1)
        )
      );
    });

    it('returns true for just the right number', function () {
      assert.isTrue(
        Validate.isOAuthCodeValid(
          createRandomHexString(Constants.OAUTH_CODE_LENGTH)
        )
      );
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
      assert.isFalse(
        Validate.isUidValid(createRandomHexString(Constants.UID_LENGTH - 1))
      );
    });

    it('returns false for one too many characters', function () {
      assert.isFalse(
        Validate.isUidValid(createRandomHexString(Constants.UID_LENGTH + 1))
      );
    });

    it('returns true for just the right number', function () {
      assert.isTrue(
        Validate.isUidValid(createRandomHexString(Constants.UID_LENGTH))
      );
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
      assert.isFalse(
        Validate.isPasswordValid(
          createRandomHexString(Constants.PASSWORD_MIN_LENGTH - 1)
        )
      );
    });

    it('returns true with minimum expected characters', function () {
      assert.isTrue(
        Validate.isPasswordValid(
          createRandomHexString(Constants.PASSWORD_MIN_LENGTH)
        )
      );
    });
  });

  describe('isPromptValid', function () {
    describe('consent', function () {
      it('returns true', function () {
        assert.isTrue(Validate.isPromptValid('consent'));
      });
    });

    describe('none', function () {
      it('returns true', function () {
        assert.isTrue(Validate.isPromptValid('none'));
      });
    });

    describe('other values', function () {
      it('returns false', function () {
        assert.isFalse(Validate.isPromptValid('unrecognized'));
      });
    });
  });

  describe('isUrlValid', function () {
    it('is defined', function () {
      assert.isFunction(Validate.isUrlValid);
    });

    var invalidURLs = ['', {}, true, 1, 'asdf', 'http:://invalid.url'];
    invalidURLs.forEach(function (item) {
      it('returns false for ' + item, function () {
        assert.isFalse(Validate.isUrlValid(item));
      });
    });

    var validURLs = [
      'http://imgur.com/gallery/OeEaX',
      'https://bugzilla.mozilla.org/',
      'https://ex.am.ple/path',
      'www.firefox.com',
    ];
    validURLs.forEach(function (item) {
      it('returns true for ' + item, function () {
        assert.isTrue(Validate.isUrlValid(item));
      });
    });
  });

  describe('isAccessTypeValid', function () {
    it('is defined', function () {
      assert.isFunction(Validate.isAccessTypeValid);
    });

    var invalidTypes = ['', 'word', 'crazyType'];
    invalidTypes.forEach(function (item) {
      it('returns false for ' + item, function () {
        assert.isFalse(Validate.isAccessTypeValid(item));
      });
    });

    var validTypes = ['online', 'offline'];
    validTypes.forEach(function (item) {
      it('returns true for ' + item, function () {
        assert.isTrue(Validate.isAccessTypeValid(item));
      });
    });
  });

  describe('isUnblockCodeValid', () => {
    const validUnblockCode = createRandomBase36String(
      Constants.UNBLOCK_CODE_LENGTH
    );
    const containsSpace =
      validUnblockCode.substr(0, 1) +
      ' ' +
      validUnblockCode.substr(1, Constants.UNBLOCK_CODE_LENGTH - 2);

    const invalidTypes = [
      '',
      createRandomBase36String(Constants.UNBLOCK_CODE_LENGTH - 1),
      createRandomBase36String(Constants.UNBLOCK_CODE_LENGTH + 1),
      createRandomBase36String(Constants.UNBLOCK_CODE_LENGTH * 2),
      '#' + createRandomBase36String(Constants.UNBLOCK_CODE_LENGTH - 1),
      containsSpace,
    ];

    invalidTypes.forEach((item) => {
      it('returns false for ' + item, () => {
        assert.isFalse(Validate.isUnblockCodeValid(item));
      });
    });

    it('returns true for valid code', () => {
      assert.isTrue(Validate.isUnblockCodeValid(validUnblockCode));
      assert.isTrue(
        Validate.isUnblockCodeValid(validUnblockCode.toLowerCase())
      );
      assert.isTrue(
        Validate.isUnblockCodeValid(validUnblockCode.toUpperCase())
      );
    });
  });

  describe('isNewslettersArrayValid', () => {
    it('returns false if not an array', () => {
      assert.isFalse(Validate.isNewslettersArrayValid('not-an-array'));
    });

    it('returns true for empty array', () => {
      assert.isTrue(Validate.isNewslettersArrayValid([]));
    });

    it('returns true if all items in the array are valid', () => {
      assert.isTrue(
        Validate.isNewslettersArrayValid([
          'test-pilot',
          'take-action-for-the-internet',
          'firefox-accounts-journey',
        ])
      );
    });

    it('returns false if any item in the array is invalid', () => {
      assert.isFalse(
        Validate.isNewslettersArrayValid([
          'test-pilot',
          'invalid',
          'firefox-accounts-journey',
        ])
      );
    });
  });
});
