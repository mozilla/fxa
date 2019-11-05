/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Constants = require('../../app/scripts/lib/constants');

function createRandomHexString(length) {
  var str = '';
  var lettersToChooseFrom = 'abcdefABCDEF01234567890';
  var numberOfPossibilities = lettersToChooseFrom.length;

  for (var i = 0; i < length; ++i) {
    var indexToUse = Math.floor(Math.random() * numberOfPossibilities);
    str += lettersToChooseFrom.charAt(indexToUse);
  }

  return str;
}

function createUID() {
  return createRandomHexString(Constants.UID_LENGTH);
}

function createEmail(template) {
  if (! template) {
    template = 'signin{id}';
  }
  return template.replace('{id}', Math.random()) + '@restmail.net';
}

/**
 * Create a phone number with `prefix` with `length` digits.
 *
 * @param {String} [prefix='9164']
 * @param {Number} [length=10]
 * @returns {String}
 */
function createPhoneNumber(prefix, length) {
  if (typeof prefix === 'undefined') {
    prefix = '9164';
  }
  if (typeof length === 'undefined') {
    length = 10;
  }
  // start with an area code and known good first number,
  // append a 6 character suffix.
  const suffixLength = length - prefix.length;
  let suffix = Math.floor(Math.random() * Math.pow(10, suffixLength));
  suffix = padright(suffix, suffixLength, '0');
  return `${prefix}${suffix}`;
}

function padright(str, len, filler) {
  let padded = '' + str;
  while (padded.length < len) {
    padded += filler;
  }
  return padded;
}

function emailToUser(email) {
  return email.split('@')[0];
}

module.exports = {
  createEmail,
  createPhoneNumber,
  createRandomHexString,
  createUID,
  emailToUser,
};
