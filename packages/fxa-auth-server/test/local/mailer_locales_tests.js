/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

require('ass')
var test = require('tap').test
var config = require('../../config').root()
var log = {}

require('../../mailer')(config, log)
  .done(
    function(mailer) {

      test(
        'All configured supportedLanguages are available',
        function (t) {
          var locales = config.i18n.supportedLanguages
          locales.forEach(function(lang) {
            if (lang === 'sr-LATN') {
              // sr-LATN is sr, but in Latin characters, not Cyrillic
              t.equal('sr', mailer.translator(lang).language)
            } else {
              t.equal(lang, mailer.translator(lang).language)
            }
          })
          t.end()
        }
      )

      test(
        'unsupported languages get default/fallback content',
        function (t) {
          // These are locales for which we do not have explicit translations
          var locales = [
            // [ locale, expected result ]
            [ '',      'en' ],
            [ 'en-US', 'en' ],
            [ 'en-CA', 'en' ],
            [ 'db-LB', 'en' ],
            [ 'el-GR', 'en' ],
            [ 'es-BO', 'es' ],
            [ 'fr-FR', 'fr' ],
            [ 'fr-CA', 'fr' ],
          ]

          locales.forEach(function(lang) {
            t.equal(lang[1], mailer.translator(lang[0]).language)
          })
          t.end()
        }
      )

      test(
        'accept-language handled correctly',
        function (t) {
          // These are the Accept-Language headers from Firefox 37 L10N builds
          var locales = [
            // [ accept-language, expected result ]
            [ 'bogus-value',                         'en'    ],
            [ 'en-US,en;q=0.5',                      'en'    ],
            [ 'es-AR,es;q=0.8,en-US;q=0.5,en;q=0.3', 'es-AR' ],
            [ 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3', 'es'    ],
            [ 'sv-SE,sv;q=0.8,en-US;q=0.5,en;q=0.3', 'sv-SE' ],
            [ 'zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3', 'zh-CN' ],
            // Yes, this line is the official accept-language in the nb-NO build
            [ 'nb-NO,nb;q=0.9,no-NO;q=0.8,no;q=0.6,nn-NO;q=0.5,nn;q=0.4,en-US;q=0.3,en;q=0.1', 'nb-NO' ],
          ]

          locales.forEach(function(lang) {
            t.equal(lang[1], mailer.translator(lang[0]).language)
          })
          t.end()
        }
      )

      test(
        'teardown',
        function (t) {
          mailer.stop()
          t.end()
        }
      )
    }
  )


