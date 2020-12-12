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

  describe('isUtmValid', () => {
    it('returns false if more than 128 chars', () => {
      assert.isFalse(Validate.isUtmValid(createRandomHexString(129)));
    });

    it('returns false for empty string', () => {
      assert.isFalse(Validate.isUtmValid(''));
    });

    it('returns false for invalid chars', () => {
      assert.isFalse(Validate.isUtmValid('(not valid)'));
    });

    it('returns true for valid chars', () => {
      assert.isTrue(Validate.isUtmValid('marketing-snippet'));
    });
  });
});
