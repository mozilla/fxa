/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


/*  Helper API for dealing with internationalization/localization.
 *
 *  This is a hacky little wrapper around the i18n-abide module, to give
 *  it a nice API for use outside the context of an express app.  If it
 *  works out OK, we should propse the API changes upstream and get rid
 *  of this module.
 *
 */


module.exports = function (config) {

  var abide = require('i18n-abide')

  // Configure i18n-abide for loading gettext templates.
  // This causes it to process the configuration settings, parse the
  // message files for each language, etc.
  //
  // It actually returns an express application with all that state
  // bundled into a function; we're going to hide that fact with a
  // bit of a wrapper API, returning the function as if it were a
  // stateful object with helper methods.
  var abideObj = abide.abide(
    {
      default_lang: config.defaultLang,
      supported_languages: config.supportedLanguages,
      translation_directory: config.translationDirectory,
      translation_type: config.translationType
    }
  )


  // Export the parseAcceptLanguage() function as-is.
  abideObj.parseAcceptLanguage = function(header) {
    return abide.parseAcceptLanguage(header)
  }


  // Export the bestLanguage() function, but using defaults from the config.
  abideObj.bestLanguage = function(accepted, supported) {
    if (!supported) {
      supported = config.supportedLanguages
    }
    return abide.bestLanguage(accepted, supported)
  }

  // A new function to get a stand-alone 'localization context'
  // This gives us the properties that i18n-abide attaches to the request
  // object, without actually having to be an express app.
  abideObj.localizationContext = function(acceptLang) {
    var fakeReq = {headers: {}}
    var fakeResp = {locals: function(){}}
    if (acceptLang) {
      fakeReq.headers['accept-language'] = acceptLang
    }
    var callWasSynchronous = false;
    abideObj(fakeReq, fakeResp, function() { callWasSynchronous = true })
    if (!callWasSynchronous) {
      throw new Error('uh-oh, the call to i18n-abide was not synchronous!')
    }
    var l10n = {}
    l10n.lang = fakeReq.lang
    l10n.lang_dir = fakeReq.lang_dir
    l10n.locale = fakeReq.locale
    l10n.gettext = fakeReq.gettext.bind(fakeReq)
    l10n.format = fakeReq.format.bind(fakeReq)
    return l10n
  }

  abideObj.defaultLang = config.defaultLang

  return abideObj
}
