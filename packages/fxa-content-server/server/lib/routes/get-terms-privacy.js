/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * <locale>/legal/terms, <locale>/legal/privacy
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

'use strict';
const path = require('path');
const logger = require('../logging/log')('route.get-terms-privacy');
const config = require('../configuration');

const PAGE_TEMPLATE_DIRECTORY = path.join(
  config.get('page_template_root'),
  'dist'
);

const templates = require('../legal-templates');

module.exports = function verRoute(i18n) {
  const DEFAULT_LANG = config.get('i18n.defaultLang');
  const DEFAULT_LEGAL_LANG = config.get('i18n.defaultLegalLang');
  const STATIC_RESOURCE_URL = config.get('static_resource_url');

  const getTemplate = templates(i18n, PAGE_TEMPLATE_DIRECTORY);

  const route = {};
  route.method = 'get';

  // Match (allow for optional trailing slash):
  // * /legal/terms
  // * /<locale>/legal/terms
  // * /legal/privacy
  // * /<locale>/legal/privacy
  route.path = /^\/(?:([a-zA-Z-\_]*)\/)?legal\/(terms|privacy)(?:\/)?$/;

  route.process = function(req, res, next) {
    const lang = req.params[0] || req.lang;
    const page = req.params[1];

    if (isUserRefreshingPage(req)) {
      // The user refreshed the TOS/PP page. Let the app handle
      // everything so the user can correctly go "back".
      req.url = '/';
      return next();
    }

    getTemplate(page, lang, DEFAULT_LANG, DEFAULT_LEGAL_LANG).then(
      function(template) {
        if (! template) {
          logger.warn(
            '%s->`%s` does not exist, redirecting to `%s`',
            page,
            lang,
            DEFAULT_LANG
          );
          return res.redirect(getRedirectURL(DEFAULT_LANG, page));
        }

        res.format({
          'text/html': function() {
            const context = {
              // Note that staticResourceUrl is added to templates as a
              // build step
              staticResourceUrl: STATIC_RESOURCE_URL,
            };
            context[page] = template;

            res.render(page, context);
          },
          'text/partial': function() {
            res.send(template);
          },
        });
      },
      function(err) {
        logger.error(err);
        return res.send(500, 'uh oh: ' + String(err));
      }
    );
  };

  function getRedirectURL(lang, page) {
    // lang at this point may use `_` as the separator. Abide matches
    // URLs with `-`. Use i18n.languageFrom to do any conversions and
    // ensure abide is able to match the language.
    return '/' + i18n.languageFrom(lang) + '/legal/' + page;
  }

  function wantsFullPage(acceptHeader) {
    return /text\/html/.test(acceptHeader);
  }

  function cameFromApp(cookies) {
    // the canGoBack cookie is scoped to the /legal path,
    // so it will not match if the user browses directly to,
    // e.g., /de/legal/terms
    return cookies.canGoBack === '1';
  }

  function isUserRefreshingPage(req) {
    return wantsFullPage(req.get('Accept')) && cameFromApp(req.cookies);
  }

  return route;
};
