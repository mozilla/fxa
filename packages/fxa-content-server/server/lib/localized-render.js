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

'use strict';
const path = require('path');
const config = require('./configuration');
const localeSubdirSuffix = config.get('i18n.localeSubdirSuffix');
const useLocalizedTemplates = config.get('are_dist_resources');

module.exports = function(config) {
  const i18n = config.i18n;

  function getLocalizedTemplatePath(req, templateName) {
    return path.join(
      i18n.normalizeLocale(req.locale) + localeSubdirSuffix,
      templateName
    );
  }

  return function(req, res, next) {
    if (useLocalizedTemplates) {
      const _render = res.render;
      res.render = function(_template, args) {
        const template = getLocalizedTemplatePath(req, _template);
        return _render.call(res, template, args);
      };
    }

    next();
  };
};
