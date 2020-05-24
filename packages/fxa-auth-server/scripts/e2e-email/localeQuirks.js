/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

// Not all non-english locales have tranlated some things yet.
// So there are these unfortunate bits of custom mappings that
// will need to change over time.

const translationQuirks = {
  // these locales will be expected to have a SMTP
  // 'content-language' header of 'en-US'
  'content-language': [],

  'Verify your Firefox Account': [
    'en',
    'en-GB',
    'ar',
    'bg',
    'es-AR',
    'ff',
    'he',
    'lt',
  ],

  'Firefox Account Verified': [
    'en',
    'en-GB',
    'ar',
    'es-AR',
    'ff',
    'he',
    'hi-IN',
    'lt',
  ],

  'Reset your Firefox Account password': [
    'en',
    'en-GB',
    'ar',
    'bg',
    'es-AR',
    'ff',
    'he',
    'lt',
  ],

  'Re-verify your Firefox Account': [
    'en',
    'en-GB',
    'ar',
    'bg',
    'es-AR',
    'ff',
    'he',
    'lt',
  ],

  'New sign-in to Firefox': [
    'en',
    'en-GB',
    'ar',
    'bg',
    'es',
    'es-AR',
    'fa',
    'ff',
    'fy',
    'he',
    'hu',
    'lt',
    'pa',
    'sq',
    'sr',
    'sr-LATN',
    'tr',
  ],

  'Your Firefox Account password has been changed': [
    'en',
    'en-GB',
    'ar',
    'bg',
    'es-AR',
    'ff',
    'he',
    'lt',
  ],

  'Your Firefox Account password has been reset': [
    'en',
    'en-GB',
    'ar',
    'bg',
    'es-AR',
    'ff',
    'he',
    'ko',
    'lt',
  ],
};

function ary2map(ary) {
  const map = {};
  ary.forEach((val) => {
    if (map[val]) {
      console.log('Duplicate!:', val);
    }
    map[val] = 1;
  });
  return map;
}

Object.keys(translationQuirks).forEach((quirk) => {
  const locales = translationQuirks[quirk];
  translationQuirks[quirk] = ary2map(locales);
});

module.exports = translationQuirks;
