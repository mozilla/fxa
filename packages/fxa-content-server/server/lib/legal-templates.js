/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';
const fs = require('fs');
const path = require('path');
const logger = require('./logging/log')('legal-templates');

module.exports = function(i18n, root) {
  const TOS = 'terms';
  const PP = 'privacy';
  const SUBPLAT_TOS = 'subscription_terms';
  const TOS_ROOT_PATH = path.join(root, TOS);
  const PP_ROOT_PATH = path.join(root, PP);
  // const SUBPLAT_TOS_ROOT_PATH = path.join(root, SUBPLAT_TOS);

  function getRoot(type) {
    switch (type) {
      case PP:
        return PP_ROOT_PATH;
      case SUBPLAT_TOS:
        // TODO! Fix once we have legal copy template for the subplat tos
        // return SUBPLAT_TOS_ROOT_PATH;
        return TOS_ROOT_PATH;
      case TOS:
        return TOS_ROOT_PATH;
      default:
        return TOS_ROOT_PATH;
    }
  }

  const templateCache = {};
  function getTemplate(type, lang, defaultLang, defaultLegalLang) {
    const DEFAULT_LOCALE = i18n.localeFrom(defaultLegalLang);

    // Filenames are normalized to locale, not language.
    const locale = i18n.localeFrom(lang);
    const templatePath = path.join(getRoot(type), locale + '.html');

    return new Promise(function(resolve, reject) {
      // cache the promises to avoid multiple concurrent checks for
      // the same template due to async calls to the file system.
      if (templateCache[templatePath]) {
        return resolve(templateCache[templatePath]);
      }

      fs.exists(templatePath, function(exists) {
        if (!exists) {
          let bestLang = i18n.bestLanguage(i18n.parseAcceptLanguage(lang));
          // If bestLang resolves to the default lang, replace it with
          // the default legal lang since they may differ. E.g. en-US
          // is the legal default while en is the general default.
          if (bestLang === defaultLang) {
            bestLang = defaultLegalLang;
          }

          if (locale === DEFAULT_LOCALE) {
            const err = new Error(
              type +
                ' missing `' +
                DEFAULT_LOCALE +
                '` template: ' +
                templatePath
            );
            return reject(err);
          } else if (lang !== bestLang) {
            logger.warn(
              '`%s` does not exist, trying next best `%s`',
              lang,
              bestLang
            );
            return resolve(getTemplate(type, bestLang, defaultLang));
          }

          templateCache[templatePath] = null;
          return resolve(null);
        }

        fs.readFile(templatePath, 'utf8', function(err, data) {
          if (err) {
            return reject(err);
          }

          templateCache[templatePath] = data;
          resolve(data);
        });
      });
    });
  }

  return getTemplate;
};
