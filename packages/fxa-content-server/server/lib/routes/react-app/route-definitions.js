/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/** @type {import("./types").GetRouteDefinition} */
function getFrontEndRouteDefinition(routes) {
  const path = routes.join('|'); // prepare for use in a RegExp
  return {
    method: 'get',
    path: new RegExp('^/(' + path + ')/?$'),
    process: function (req, res, next) {
      // setting the url to / will use the correct
      // index.html for either dev or prod mode.
      req.url = '/';
      next();
    },
  };
}

/** @type {import("./types").GetRouteDefinition} */
function getFrontEndPairingRouteDefinition(routes) {
  const path = routes.join('|'); // prepare for use in a RegExp
  return {
    method: 'get',
    path: new RegExp('^/(' + path + ')/?$'),
    process: function (req, res) {
      res.redirect(302, '/pair/failure');
    },
  };
}

/** @type {import("./types").GetRouteDefinition} */
function getOAuthSuccessRouteDefinition(routes) {
  const path = routes.join('|'); // prepare for use in a RegExp
  return {
    method: 'get',
    path,
    process: function (req, res, next) {
      req.url = '/';
      next();
    },
  };
}

/** @type {import("./types").GetRouteDefinitionSingle} */
function getTermsPrivacyRouteDefinition(regex, i18n) {
  return {
    method: 'get',
    path: regex,
    process: function (req, res, next) {
      req.url = '/';
      next();
    },
  };
}

module.exports = {
  getFrontEndRouteDefinition,
  getFrontEndPairingRouteDefinition,
  getOAuthSuccessRouteDefinition,
  getTermsPrivacyRouteDefinition,
};
