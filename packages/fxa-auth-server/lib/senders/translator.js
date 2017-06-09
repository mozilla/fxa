/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var path = require('path')
var i18n = require('i18n-abide')
var Jed = require('jed')
var P = require('bluebird')
var po2json = require('po2json')
var poParseFile = P.promisify(po2json.parseFile)

Jed.prototype.format = i18n.format

var parseCache = {}

function parseLocale(locale) {
  if (parseCache[locale]) {
    return P.resolve(parseCache[locale])
  }

  return poParseFile(
    path.join(
      __dirname,
      '../../node_modules/fxa-content-server-l10n/locale',
      i18n.normalizeLocale(locale),
      'LC_MESSAGES/server.po'
    ),
    {
      fuzzy: true,
      format: 'jed'
    }
  ).then(function (parsed) {
    parseCache[locale] = parsed
    return parsed
  })
}

module.exports = function (locales, defaultLanguage) {
  return P.all(
    locales.map(parseLocale)
  )
  .then(
    function (translations) {
      var languageTranslations = {}
      var supportedLanguages = []
      for (var i = 0; i < translations.length; i++) {
        var t = translations[i]
        var language = i18n.normalizeLanguage(i18n.languageFrom(t.locale_data.messages[''].lang))
        supportedLanguages.push(language)
        var translator = new Jed(t)
        translator.language = language
        languageTranslations[language] = translator
      }

      return {
        getTranslator: function (acceptLanguage) {
          return languageTranslations[getLocale(acceptLanguage)]
        },

        getLocale: getLocale
      }

      function getLocale (acceptLanguage) {
        var languages = i18n.parseAcceptLanguage(acceptLanguage)
        var bestLanguage = i18n.bestLanguage(languages, supportedLanguages, defaultLanguage)
        return i18n.normalizeLanguage(bestLanguage)
      }
    }
  )
}
