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

/*eslint-disable camelcase */

'use strict';
module.exports = function(config) {
  // this is perhaps a bit janky. In dev mode, a `t` helper needs to be
  // registered to render text in the static templates. Without the helper,
  // all {{#t}} surrounded text is empty.
  const handlebars = require('handlebars');
  // This file is used by both the build system and the server.
  // If part of the build system, `t` is already defined. Do not re-register
  // or else the static templates are not translated.
  if (! (handlebars.helpers && handlebars.helpers.t)) {
    handlebars.registerHelper('t', function(msg) {
      if (msg.fn) {
        return this.format(this.gettext(msg.fn(this)), this);
      }

      return this.format(this.gettext(msg), this);
    });
  }

  const abide = require('i18n-abide');

  // Configure i18n-abide for loading gettext templates.
  // This causes it to process the configuration settings, parse the
  // message files for each language, etc.
  //
  // It actually returns an express application with all that state
  // bundled into a function; we're going to hide that fact with a
  // bit of a wrapper API, returning the function as if it were a
  // stateful object with helper methods.
  const abideMiddleware = abide.abide({
    debug_lang: config.debugLang,
    default_lang: abide.localeFrom(config.defaultLang),
    locale_on_url: true,
    supported_languages: config.supportedLanguages,
    translation_directory: config.translationDirectory,
    translation_type: config.translationType,
  });

  // Wrap the abide middleware so we can set fontSupport
  const abideObj = function(req, res, next) {
    // Call the abide middleware with our own `next` function
    // so that we can modify the request object afterward.
    abideMiddleware(req, res, next);
  };

  // Export the langaugeFrom() function as-is.
  abideObj.languageFrom = function(locale) {
    return abide.languageFrom(locale);
  };
  abideObj.localeFrom = function(lang) {
    return abide.localeFrom(lang);
  };

  abideObj.normalizeLocale = function(locale) {
    return abide.normalizeLocale(locale);
  };

  // Export the parseAcceptLanguage() function as-is.
  abideObj.parseAcceptLanguage = function(header) {
    return abide.parseAcceptLanguage(header);
  };

  // Export the bestLanguage() function, but using defaults from the config.
  abideObj.bestLanguage = function(accepted, supported) {
    if (! supported) {
      supported = config.supportedLanguages;
    }
    return abide.bestLanguage(accepted, supported, config.defaultLang);
  };

  abideObj.normalizeLanguage = function(lang) {
    return abide.normalizeLanguage(lang);
  };

  // A new function to get a stand-alone 'localization context'
  // This gives us the properties that i18n-abide attaches to the request
  // object, without actually having to be an express app.
  abideObj.localizationContext = function(acceptLang) {
    const fakeReq = { headers: {}, url: '' };
    const fakeResp = {};
    if (acceptLang) {
      fakeReq.headers['accept-language'] = acceptLang;
    }
    let callWasSynchronous = false;
    abideObj(fakeReq, fakeResp, function() {
      callWasSynchronous = true;
    });
    if (! callWasSynchronous) {
      throw new Error('uh-oh, the call to i18n-abide was not synchronous!');
    }
    const l10n = {};
    l10n.lang = fakeReq.lang;
    l10n.lang_dir = fakeResp.locals.lang_dir;
    l10n.locale = fakeReq.locale;
    l10n.gettext = fakeReq.gettext.bind(fakeReq);
    l10n.format = fakeReq.format.bind(fakeReq);

    return l10n;
  };

  return abideObj;
};
