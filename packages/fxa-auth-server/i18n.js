/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (supportedLanguages, defaultLanguage) {

  function qualityCmp(a, b) {
    if (a.quality === b.quality) {
      return 0
    } else if (a.quality < b.quality) {
      return 1
    } else {
      return -1
    }
  }

  function parseAcceptLanguage(header) {
    // pl,fr-FR;q=0.3,en-US;q=0.1
    if (! header || ! header.split) {
      return []
    }
    var rawLanguages = header.split(',')
    var languages = rawLanguages.map(
      function(rawLanguage) {
        var parts = rawLanguage.split(';')
        var q = 1
        if (parts.length > 1 && parts[1].indexOf('q=') === 0) {
          var qval = parseFloat(parts[1].split('=')[1])
          if (isNaN(qval) === false) {
            q = qval
          }
        }
        return { lang: parts[0].trim(), quality: q }
      }
    )
    languages.sort(qualityCmp)
    return languages
  }

  function bestLanguage(languages, supportedLanguages, defaultLanguage) {
    var lower = supportedLanguages.map(function(l) { return l.toLowerCase() })
    for(var i=0; i < languages.length; i++) {
      var lq = languages[i]
      if (lower.indexOf(lq.lang.toLowerCase()) !== -1) {
        return lq.lang
      } else if (lower.indexOf(lq.lang.split('-')[0].toLowerCase()) !== -1) {
        return lq.lang.split('-')[0]
      }
    }
    return defaultLanguage
  }

  return {
    language: function (header) {
      return bestLanguage(
        parseAcceptLanguage(header),
        supportedLanguages,
        defaultLanguage
      ).toLowerCase()
    }
  }
}
