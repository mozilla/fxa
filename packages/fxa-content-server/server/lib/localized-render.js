/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Middleware to monkey patch res.render to serve the correct
 * template for the locale.
 *
 * When running in production, each static resource has a locale specific
 * version in `server/templates/pages/dist/<locale_name>`
 *
 * When running in development mode, the original, non-localized template
 * is rendered.
 */


var path = require('path');
var config = require('./configuration');
var useLocalizedTemplates = config.get('are_dist_resources');

module.exports = function (config) {
  var i18n = config.i18n;

  function getLocalizedTemplatePath(req, templateName) {
    return path.join(i18n.normalizeLocale(req.locale), templateName);
  }

  return function (req, res, next) {
    if (useLocalizedTemplates) {
      var _render = res.render;
      res.render = function (_template, args) {
        var template = getLocalizedTemplatePath(req, _template);
        return _render.call(res, template, args);
      };
    }

    next();
  };
};

