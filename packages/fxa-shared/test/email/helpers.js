/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const Helpers = require('../../email/helpers');

function createRandomHexString(length) {
  let str = '';
  const lettersToChooseFrom = 'abcdefABCDEF01234567890';
  const numberOfPossibilities = lettersToChooseFrom.length;

  for (var i = 0; i < length; ++i) {
    var indexToUse = Math.floor(Math.random() * numberOfPossibilities);
    str += lettersToChooseFrom.charAt(indexToUse);
  }

  return str;
}

describe('email/helpers:', () => {
  describe('isEmailValid', () => {
    it('returns true for valid email', () => {
      assert.isTrue(Helpers.isEmailValid('a@b.c'));
    });

    it('returns false for email without a local part', () => {
      assert.isFalse(Helpers.isEmailValid('@b.c'));
    });

    it('returns false for email without a domain', () => {
      assert.isFalse(Helpers.isEmailValid('a@'));
    });

    it('returns false for email with a single-part domain', () => {
      assert.isFalse(Helpers.isEmailValid('a@b'));
    });

    it('returns true for email with 64-character local part', () => {
      assert.isTrue(Helpers.isEmailValid(createRandomHexString(64) + '@b.c'));
    });

    it('returns false for email with 65-character local part', () => {
      assert.isFalse(Helpers.isEmailValid(createRandomHexString(65) + '@b.c'));
    });

    it('returns true for email with 256 characters', () => {
      assert.isTrue(
        Helpers.isEmailValid('a@' + createRandomHexString(252) + '.b')
      );
    });

    it('returns false for email with 257 characters', () => {
      assert.isFalse(
        Helpers.isEmailValid('a@' + createRandomHexString(253) + '.b')
      );
    });

    it('returns true for valid emails from auth server tests', () => {
      [
        'tim@tim-example.net',
        'a+b+c@wibble.example.com',
        '#!?-@t-e-s-t.c-o-m',
        // The next two test cases are commented out until we support
        // unicode email addresses in the content server.
        //String.fromCharCode(1234) + '@example.com',
        //'test@' + String.fromCharCode(5678) + '.com'
      ].forEach(function (email) {
        assert.isTrue(Helpers.isEmailValid(email), email + ' should be valid');
      });
    });

    it('returns false for invalid emails from auth server tests', () => {
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
          Helpers.isEmailValid(email),
          email + ' should not be valid'
        );
      });
    });

    it('returns true if email address contains an apostrophe', () => {
      assert.isTrue(Helpers.isEmailValid("a'b@example.com"));
    });

    it('returns false if email address contains a single quote', () => {
      assert.isFalse(Helpers.isEmailValid('a’b@example.com'));
    });
  });
});
