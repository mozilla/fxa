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
var logger = require('intel').getLogger('route.get-terms-privacy');
var Promise = require('bluebird');

var TOS_ROOT_PATH = path.join(__dirname, '..', '..', 'templates', 'terms');
var PP_ROOT_PATH = path.join(__dirname, '..', '..', 'templates', 'privacy');

var DEFAULT_LANG = 'en-US';

exports.method = 'get';

// Match (allow for optional trailing slash):
// * /legal/terms
// * /<locale>/legal/terms
// * /legal/privacy
// * /<locale>/legal/privacy
exports.path = /^\/(?:([a-zA-Z-\_]*)\/)?legal\/(terms|privacy)(?:\/)?$/;

function getRoot(type) {
  return type === 'terms' ? TOS_ROOT_PATH : PP_ROOT_PATH;
}

function normalizeLanguage(lang) {
  // filenames have a '-' in them, browsers report with a '_'.
  return lang.replace(/_/g, '-');
}

var resolverCache = {};
function getTemplate(type, lang, done) {
  lang = normalizeLanguage(lang);
  var templatePath = path.join(getRoot(type), lang + '.html');

  // cache the promises to avoid multiple concurrent checks for
  // the same template due to async calls to the file system.
  if (resolverCache[templatePath]) {
    return resolverCache[templatePath].promise;
  }

  var resolver = Promise.defer();
  resolverCache[templatePath] = resolver;

  fs.exists(templatePath, function (exists) {
    if (! exists) {
      if (lang === DEFAULT_LANG) {
        var err = new Error(type + ' missing `' + DEFAULT_LANG + '` template');
        return resolver.reject(err);
      }

      return resolver.resolve(null);
    }

    fs.readFile(templatePath, 'utf8', function(err, data) {
      if (err) {
        return resolver.reject(err);
      }

      resolver.resolve(data);
    });
  });

  return resolver.promise;
}

exports.process = function (req, res) {
  var lang = req.params[0];
  var page = req.params[1];

  if (! lang) {
    // abide should put a lang on the request, if not, use the default.
    return res.redirect(getRedirectURL(req.lang || DEFAULT_LANG, page));
  }

  getTemplate(page, lang)
    .then(function (template) {
      if ( ! template) {
        logger.warn('%s->`%s` does not exist, redirecting to `%s`',
                           page, lang, DEFAULT_LANG);
        return res.redirect(getRedirectURL(DEFAULT_LANG, page));
      }

      res.format({
        'text/partial': function () {
          res.send(template);
        },
        'text/html': function () {
          res.render(page, { body: template });
        }
      });
    }, function(err) {
      logger.error(err);
      return res.send(500, 'uh oh: ' + String(err));
    });
};

function getRedirectURL(lang, page) {
  return lang + '/legal/' + page;
}

