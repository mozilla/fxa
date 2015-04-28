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

  'Verify your account': [
    'en'
  ],

  'Reset your password': [
    'en'
  ],

  // A *lot* have not been translated, but a number of broadly
  // spoken languages (e.g., de, zh-TW, zh-TW, ja, ru, pt-BR)
  // have been.
  'Re-verify your account': [
    'ca',
    'en',
    'es-AR',
    'et',
    'eu',
    'ff',
    'he',
    'id',
    'ko',
    'lt',
    'nb-NO',
    'pa',
    'pl',
    'rm',
    'sv',
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
