/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var fs = require('fs')

var request = require('request')

var config = require('../config').root()

// now, fetch all of the templates we know about from the content server
console.log(config)
console.log(config.i18n.supportedLanguages)

// This list is from fxa-content-server/locale/* (minus README.md, templates/, linux/ and win32/).
//
// The reason we do this is because if we were to read our own config, it wouldn't
// be what is running in production and is actually used. Therefore, for now, we need
// to just get everything.
//
// So, when running fxa-content-server, you need to have all of these set up in
// the fxa-content-server/server/config/local.json.
var langs = [
  'af',
  'an',
  'ar',
  'as',
  'ast',
  'be',
  'bg',
  'bn-BD',
  'bn-IN',
  'br',
  'bs',
  'ca',
  'cs',
  'cy',
  'da',
  'de',
  'el',
  'en-GB',
  'en-US',
  'en-ZA',
  'eo',
  'es',
  'es-AR',
  'es-CL',
  'es-ES',
  'es-MX',
  'et',
  'eu',
  'fa',
  'ff',
  'fi',
  'fr',
  'fy-NL',
  'ga-IE',
  'gd',
  'gl',
  'gu',
  'gu-IN',
  'he',
  'hi-IN',
  'hr',
  'ht',
  'hu',
  'hy-AM',
  'id',
  'is',
  'it',
  'ja',
  'ja-JP-mac',
  'kk',
  'km',
  'kn',
  'ko',
  'ku',
  'lij',
  'lt',
  'lv',
  'mai',
  'mk',
  'ml',
  'mr',
  'ms',
  'nb-NO',
  'ne-NP',
  'nl',
  'nn-NO',
  'or',
  'osx',
  'pa',
  'pa-IN',
  'pl',
  'pt-BR',
  'pt-PT',
  'rm',
  'ro',
  'ru',
  'si',
  'sk',
  'sl',
  'son',
  'sq',
  'sr',
  'sr-Cyrl',
  'sr-Latn',
  'sv-SE',
  'ta',
  'te',
  'th',
  'tr',
  'uk',
  'ur',
  'vi',
  'xh',
  'zh-CN',
  'zh-TW',
  'zu',
]

var types = [ 'verify', 'reset' ]
var remaining = langs.length

langs.forEach(function(lang) {
  types.forEach(function(type) {
    var opts = {
      uri : config.templateServer.url + '/template/' + lang + '/' + type,
      json : true,
    }
    request(opts, function(err, res, body) {
      console.log('Fetched lang=%s, type=%s', lang, type)

      var filename = lang + '_' + type + '.json'
      console.log('Saving %s', filename)
      fs.writeFile(filename, JSON.stringify(body), function(err) {
        if (err) return console.warn(err)

        remaining -= 1
        if ( remaining === 0 ) {
          console.log('Done')
        }
      })
    })
  })
})
