/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const {
  getIndexRouteDefinition,
} = require('./react-app/route-definition-index');

/**
 * Remove index route ('/') from list if React feature flag is set to true
 * and route is included in the emailFirstRoutes route group.
 */
/** @type {import("./react-app/types").GetBackboneRouteDefinition} */
function getIndex(reactRouteGroups, config) {
  const isOnReact =
    reactRouteGroups.emailFirstRoutes.featureFlagOn &&
    reactRouteGroups.emailFirstRoutes.routes.find(
      (route) => route.name === '/'
    );
  return isOnReact ? null : getIndexRouteDefinition(config);
}

module.exports = {
  default: getIndex,
};
