/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const path = require('path');
const i18n = require('i18n-abide');
const Jed = require('jed');
const P = require('bluebird');
const po2json = require('po2json');
const poParseFile = P.promisify(po2json.parseFile);

Jed.prototype.format = i18n.format;

const parseCache = {};

function parseLocale(locale) {
  if (parseCache[locale]) {
    return P.resolve(parseCache[locale]);
  }

  return poParseFile(
    path.join(
      __dirname,
      '../../fxa-content-server-l10n/locale',
      i18n.normalizeLocale(locale),
      'LC_MESSAGES/server.po'
    ),
    {
      fuzzy: true,
      format: 'jed',
    }
  ).then(parsed => {
    parseCache[locale] = parsed;
    return parsed;
  });
}

module.exports = function(locales, defaultLanguage) {
  return P.all(locales.map(parseLocale)).then(translations => {
    const languageTranslations = {};
    const supportedLanguages = [];
    for (let i = 0; i < translations.length; i++) {
      const t = translations[i];
      const localeMessageData = t.locale_data.messages[''];

      if (localeMessageData.lang === 'ar') {
        // NOTE: there seems to be some incompatibility with Jed and Arabic plural forms from Pontoon
        // We disable plural forms manually below, we don't use them anyway. Issue #2714
        localeMessageData.plural_forms = null;
      }

      const language = i18n.normalizeLanguage(
        i18n.languageFrom(localeMessageData.lang)
      );
      supportedLanguages.push(language);
      const translator = new Jed(t);
      translator.language = language;
      languageTranslations[language] = translator;
    }

    return {
      getTranslator: function(acceptLanguage) {
        return languageTranslations[getLocale(acceptLanguage)];
      },

      getLocale: getLocale,
    };

    function getLocale(acceptLanguage) {
      const languages = i18n.parseAcceptLanguage(acceptLanguage);
      const bestLanguage = i18n.bestLanguage(
        languages,
        supportedLanguages,
        defaultLanguage
      );
      return i18n.normalizeLanguage(bestLanguage);
    }
  });
};
