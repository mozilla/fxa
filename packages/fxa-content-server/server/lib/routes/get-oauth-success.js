/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { OAUTH_SUCCESS_ROUTES } = require('./react-app/content-server-routes');
const {
  getOAuthSuccessRouteDefinition,
} = require('./react-app/route-definitions');

function getRoutesExcludingOAuthSuccessReact(routeNames) {
  return routeNames;
}

/** @type {import("./react-app/types").GetBackboneRouteDefinition} */
function getOAuthSuccessRoutes(
  reactRouteGroups,
  routeNames = OAUTH_SUCCESS_ROUTES
) {
  const routesExcludingOAuthSuccessReact =
    getRoutesExcludingOAuthSuccessReact(routeNames);
  return routesExcludingOAuthSuccessReact.length > 0
    ? getOAuthSuccessRouteDefinition(routesExcludingOAuthSuccessReact)
    : null;
}

module.exports = {
  default: getOAuthSuccessRoutes,
  getRoutesExcludingOAuthSuccessReact, // exported for testing
};
