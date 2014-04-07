/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([], function () {
  'use strict';

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

  return {
    createRandomHexString: createRandomHexString
  };
});

