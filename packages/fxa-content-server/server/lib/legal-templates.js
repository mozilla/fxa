/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


var fs = require('fs');
var path = require('path');
var Promise = require('bluebird');
var logger = require('mozlog')('legal-templates');

module.exports = function (i18n, root) {

  var TOS_ROOT_PATH = path.join(root, 'terms');
  var PP_ROOT_PATH = path.join(root, 'privacy');

  function getRoot(type) {
    return type === 'terms' ? TOS_ROOT_PATH : PP_ROOT_PATH;
  }

  var templateCache = {};
  function getTemplate(type, lang, defaultLang, defaultLegalLang) {
    var DEFAULT_LOCALE = i18n.localeFrom(defaultLegalLang);

    // Filenames are normalized to locale, not language.
    var locale = i18n.localeFrom(lang);
    var templatePath = path.join(getRoot(type), locale + '.html');
    var resolver = Promise.defer();

    // cache the promises to avoid multiple concurrent checks for
    // the same template due to async calls to the file system.
    if (templateCache[templatePath]) {
      resolver.resolve(templateCache[templatePath]);
      return resolver.promise;
    }

    fs.exists(templatePath, function (exists) {
      if (! exists) {
        var bestLang = i18n.bestLanguage(i18n.parseAcceptLanguage(lang));
        // If bestLang resolves to the default lang, replace it with
        // the default legal lang since they may differ. E.g. en-US
        // is the legal default while en is the general default.
        if (bestLang === defaultLang) {
          bestLang = defaultLegalLang;
        }

        if (locale === DEFAULT_LOCALE) {
          var err = new Error(type + ' missing `' + DEFAULT_LOCALE + '` template: ' + templatePath);
          return resolver.reject(err);
        } else if (lang !== bestLang) {
          logger.warn('`%s` does not exist, trying next best `%s`', lang, bestLang);
          return resolver.resolve(getTemplate(type, bestLang, defaultLang));
        }


        templateCache[templatePath] = null;
        return resolver.resolve(null);
      }

      fs.readFile(templatePath, 'utf8', function (err, data) {
        if (err) {
          return resolver.reject(err);
        }

        templateCache[templatePath] = data;
        resolver.resolve(data);
      });
    });

    return resolver.promise;
  }

  return getTemplate;

};
