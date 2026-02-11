/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { FRONTEND_ROUTES } = require('./react-app/content-server-routes');
const { getFrontEndRouteDefinition } = require('./react-app/route-definitions');

/**
 * Remove route from list if React feature flag is set to true and route is included in
 * any react route group. Route definitions for the excluded routes are created
 * separately in `fxa-content-server.js`. */
function getRoutesExcludingAllReact(reactRouteGroups, routeNames) {
  return routeNames.filter((routeName) => {
    for (const routeGroup in reactRouteGroups) {
      if (
        reactRouteGroups[routeGroup].featureFlagOn &&
        !!reactRouteGroups[routeGroup].routes.find(
          (route) => routeName === route.name
        )
      ) {
        return false;
      }
    }
    return true;
  });
}

/** @type {import("./react-app/types").GetBackboneRouteDefinition} */
function getFrontEnd(reactRouteGroups, routeNames = FRONTEND_ROUTES) {
  const routesExcludingAllReact = getRoutesExcludingAllReact(
    reactRouteGroups,
    routeNames
  );
  return routesExcludingAllReact.length > 0
    ? getFrontEndRouteDefinition(routesExcludingAllReact)
    : null;
}

module.exports = {
  default: getFrontEnd,
  getRoutesExcludingAllReact, // exported for testing
};
