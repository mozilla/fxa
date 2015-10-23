/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Not all non-english locales have tranlated some things yet.
// So there are these unfortunate bits of custom mappings that
// will need to change over time.

var translationQuirks = {
  // these locales will be expected to have a SMTP
  // 'content-language' header of 'en-US'
  'content-language': [
  ],

  'Verify your Firefox Account': [
    'en',
    'en-GB',
    'ca',
    'cy',
    'es-AR',
    'eu',
    'ff',
    'he',
    'id',
    'ko',
    'lt',
    'nb-NO',
    'sv',
  ],

  'Firefox Account Verified': [
    'en',
    'en-GB',
    'ca',
    'cy',
    'es-AR',
    'eu',
    'ff',
    'he',
    'hu',
    'id',
    'ko',
    'lt',
    'nb-NO',
    'sr',
    'sr-LATN',
    'sv',
  ],

  'Reset your Firefox Account password': [
    'en',
    'en-GB',
    'ca',
    'cy',
    'es-AR',
    'eu',
    'ff',
    'he',
    'id',
    'ko',
    'lt',
    'nb-NO',
    'sv',
  ],

  'Re-verify your Firefox Account': [
    'en',
    'en-GB',
    'ca',
    'cy',
    'es-AR',
    'eu',
    'ff',
    'he',
    'id',
    'ko',
    'lt',
    'nb-NO',
    'sv',
  ],

  'New sign-in to Firefox': [
    'en',
    'en-GB',
    'ca',
    'cy',
    'es',
    'es-AR',
    'eu',
    'fa',
    'ff',
    'fy',
    'he',
    'hu',
    'id',
    'ko',
    'lt',
    'nb-NO',
    'pa',
    'sq',
    'sr',
    'sr-LATN',
    'sv',
    'tr',
  ],

  'Your Firefox Account password has been changed': [
    'en',
    'en-GB',
    'ca',
    'cy',
    'es-AR',
    'eu',
    'ff',
    'he',
    'id',
    'ko',
    'lt',
    'nb-NO',
    'sv',
  ],

  'Your Firefox Account password has been reset': [
    'en',
    'en-GB',
    'ca',
    'cy',
    'es-AR',
    'eu',
    'ff',
    'he',
    'id',
    'ko',
    'lt',
    'nb-NO',
    'sv',
  ],
}

function ary2map(ary) {
  var map = {}
  ary.forEach(function(val) {
    if (map[val]) {
      console.log('Duplicate!:', val)
    }
    map[val] = 1
  })
  return map
}

Object.keys(translationQuirks).forEach(function(quirk) {
  var locales = translationQuirks[quirk]
  translationQuirks[quirk] = ary2map(locales)
})

module.exports = translationQuirks
