/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

/**
 * <locale>/legal/terms and <locale>/legal/privacy
 * Translation done by fetching appropriate template for language.
 * If language is not found, fall back to en-US.
 *
 * Either full HTML or a partial can be requested. Partials are
 * requested by the front end to request translated documents and
 * insert them into the DOM. Full HTML is used whenever a user
 * browses to one of the pages directly.
 *
 * Partials are requested by setting the `Accepts` header to `text/partial`
 * HTML is returned if `Accepts` is `text/html`
 */

var fs = require('fs');
var path = require('path');
var logger = require('mozlog')('route.get-terms-privacy');
var Promise = require('bluebird');
var config = require('../configuration');

var PAGE_TEMPLATE_DIRECTORY = path.join(config.get('page_template_root'), 'dist');

var templates = require('../legal-templates');

module.exports = function verRoute (i18n) {
  var DEFAULT_LANG = config.get('i18n.defaultLang');
  var DEFAULT_LEGAL_LANG = config.get('i18n.defaultLegalLang');

  var getTemplate = templates(i18n, PAGE_TEMPLATE_DIRECTORY);

  var route = {};
  route.method = 'get';

  // Match (allow for optional trailing slash):
  // * /legal/terms
  // * /<locale>/legal/terms
  // * /legal/privacy
  // * /<locale>/legal/privacy
  route.path = /^\/(?:([a-zA-Z-\_]*)\/)?legal\/(terms|privacy)(?:\/)?$/;

  route.process = function (req, res) {
    var lang = req.params[0] || req.lang;
    var page = req.params[1];

    getTemplate(page, lang, DEFAULT_LANG, DEFAULT_LEGAL_LANG)
      .then(function (template) {
        if (! template) {
          logger.warn('%s->`%s` does not exist, redirecting to `%s`',
                             page, lang, DEFAULT_LANG);
          return res.redirect(getRedirectURL(DEFAULT_LANG, page));
        }

        res.format({
          'text/html': function () {
            var context = {};
            context[page] = template;

            // the HTML page removes the header to allow embedding.
            res.removeHeader('X-FRAME-OPTIONS');
            res.render(page, context);
          },
          'text/partial': function () {
            res.send(template);
          }
        });
      }, function (err) {
        logger.error(err);
        return res.send(500, 'uh oh: ' + String(err));
      });
  };

  function getRedirectURL(lang, page) {
    // lang at this point may use `_` as the separator. Abide matches
    // URLs with `-`. Use i18n.languageFrom to do any conversions and
    // ensure abide is able to match the language.
    return i18n.languageFrom(lang) + '/legal/' + page;
  }

  return route;

};
