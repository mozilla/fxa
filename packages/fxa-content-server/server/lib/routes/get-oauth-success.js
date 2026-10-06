/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { OAUTH_SUCCESS_ROUTES } = require('./react-app/content-server-routes');
const {
  getOAuthSuccessRouteDefinition,
} = require('./react-app/route-definitions');

function getBackboneOAuthSuccessRouteNames({ oauthSuccessRoutes }, routeNames) {
  return oauthSuccessRoutes.featureFlagOn
    ? routeNames.filter(
        (routeName) =>
          !oauthSuccessRoutes.routes.find((route) => routeName === route.name)
      )
    : routeNames;
}

/** @type {import("./react-app/types").GetBackboneRouteDefinition} */
function getOAuthSuccessRoutes(
  reactRouteGroups,
  routeNames = OAUTH_SUCCESS_ROUTES
) {
  const backboneRouteNames = getBackboneOAuthSuccessRouteNames(
    reactRouteGroups,
    routeNames
  );
  return backboneRouteNames.length > 0
    ? getOAuthSuccessRouteDefinition(backboneRouteNames)
    : null;
}

module.exports = {
  default: getOAuthSuccessRoutes,
  getBackboneOAuthSuccessRouteNames, // exported for testing
};
