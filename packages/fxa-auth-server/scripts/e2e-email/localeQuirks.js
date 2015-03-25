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
    'en',
    'dsb',
    'hsb',
    'uk'
  ],

  // SMTP Subject: 'value' will be 'en-US'
  'Verify your account': [
    'dsb',
    'en',
    'hsb',
    'sq',
    'uk'
  ],

  'Reset your password': [
    'dsb',
    'en',
    'hsb',
    'sq',
    'uk'
  ],

  // A *lot* have not been translated, but a number of broadly
  // spoken languages (e.g., de, zh-TW, zh-TW, ja, ru, pt-BR)
  'Re-verify your account': [
    'ca',
    'dsb',
    'en',
    'es',
    'es-AR',
    'es-CL',
    'et',
    'eu',
    'ff',
    'fr',
    'fy',
    'he',
    'hsb',
    'id',
    'ko',
    'lt',
    'nb-NO',
    'pa',
    'pl',
    'rm',
    'sq',
    'sr',
    'sr-LATN',
    'sv',
    'uk',
  ]
}

function ary2map(ary) {
  var map = {}
  ary.forEach(function(val) {
    map[val] = 1
  })
  return map
}

Object.keys(translationQuirks).forEach(function(quirk) {
  var locales = translationQuirks[quirk];
  translationQuirks[quirk] = ary2map(locales);
})

module.exports = translationQuirks
