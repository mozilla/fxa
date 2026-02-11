/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { PAIRING_ROUTES } = require('./react-app/content-server-routes');
const {
  getFrontEndPairingRouteDefinition,
} = require('./react-app/route-definitions');

// This route handler prevents REFRESH behaviour for the pairing flow
// If the user refreshes the browser during pairing, we instruct them to start over

function getRoutesExcludingPairingReact({ pairRoutes }, routeNames) {
  return pairRoutes.featureFlagOn
    ? routeNames.filter(
        (routeName) =>
          !pairRoutes.routes.find((route) => routeName === route.name)
      )
    : routeNames;
}

/** @type {import("./react-app/types").GetBackboneRouteDefinition} */
function getFrontEndPairing(reactRouteGroups, routeNames = PAIRING_ROUTES) {
  const routesExcludingPairingReact = getRoutesExcludingPairingReact(
    reactRouteGroups,
    routeNames
  );

  return routesExcludingPairingReact.length > 0
    ? getFrontEndPairingRouteDefinition(routesExcludingPairingReact)
    : null;
}

module.exports = {
  default: getFrontEndPairing,
  getRoutesExcludingPairingReact, // exported for testing
};
