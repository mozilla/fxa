/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

/*  Helper API for dealing with internationalization/localization.
 *
 *  This is a hacky little wrapper around the i18n-abide module, to give
 *  it a nice API for use outside the context of an express app.  If it
 *  works out OK, we should propse the API changes upstream and get rid
 *  of this module.
 *
 */


module.exports = function (config) {

  var abide = require('i18n-abide');

  // Convert the array to an object for faster lookups
  var fontSupportDisabled = config.fonts.unsupportedLanguages
     .reduce(function (prev, val) {
       prev[val] = true;
       return prev;
     }, {});

  // Configure i18n-abide for loading gettext templates.
  // This causes it to process the configuration settings, parse the
  // message files for each language, etc.
  //
  // It actually returns an express application with all that state
  // bundled into a function; we're going to hide that fact with a
  // bit of a wrapper API, returning the function as if it were a
  // stateful object with helper methods.
  var abideMiddleware = abide.abide(
    {
      default_lang: abide.localeFrom(config.defaultLang),
      debug_lang: config.debugLang,
      supported_languages: config.supportedLanguages,
      translation_directory: config.translationDirectory,
      translation_type: config.translationType
    }
  );

  // Wrap the abide middleware so we can set fontSupport
  var abideObj = function (req, res, next) {
    // Call the abide middleware with our own `next` function
    // so that we can modify the request object afterward.
    abideMiddleware(req, res, function (val) {
      var lang = abide.normalizeLanguage(req.lang);
      res.locals.fontSupportDisabled = req.fontSupportDisabled = fontSupportDisabled[lang];
      next(val);
    });
  };

  // Export the langaugeFrom() function as-is.
  abideObj.languageFrom = function (locale) {
    return abide.languageFrom(locale);
  };
  abideObj.localeFrom = function (lang) {
    return abide.localeFrom(lang);
  };

  abideObj.normalizeLocale = function (locale) {
    return abide.normalizeLocale(locale);
  };

  // Export the parseAcceptLanguage() function as-is.
  abideObj.parseAcceptLanguage = function (header) {
    return abide.parseAcceptLanguage(header);
  };


  // Export the bestLanguage() function, but using defaults from the config.
  abideObj.bestLanguage = function (accepted, supported) {
    if (!supported) {
      supported = config.supportedLanguages;
    }
    return abide.bestLanguage(accepted, supported, config.defaultLang);
  };

  abideObj.normalizeLanguage = function (lang) {
    return abide.normalizeLanguage(lang);
  };

  // A new function to get a stand-alone 'localization context'
  // This gives us the properties that i18n-abide attaches to the request
  // object, without actually having to be an express app.
  abideObj.localizationContext = function (acceptLang) {
    var fakeReq = {headers: {}};
    var fakeResp = {};
    if (acceptLang) {
      fakeReq.headers['accept-language'] = acceptLang;
    }
    var callWasSynchronous = false;
    abideObj(fakeReq, fakeResp, function () { callWasSynchronous = true; });
    if (!callWasSynchronous) {
      throw new Error('uh-oh, the call to i18n-abide was not synchronous!');
    }
    var l10n = {};
    l10n.lang = fakeReq.lang;
    l10n.lang_dir = fakeResp.locals.lang_dir;
    l10n.locale = fakeReq.locale;
    l10n.gettext = fakeReq.gettext.bind(fakeReq);
    l10n.format = fakeReq.format.bind(fakeReq);

    l10n.fontSupportDisabled = fontSupportDisabled[l10n.lang];

    return l10n;
  };


  return abideObj;
};
