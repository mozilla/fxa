/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { getReactRouteGroups } = require('.');
const { reactRouteServer } = require('./react-route-server');

/** Add all routes from route groups with the feature flag on for fxa-settings to serve,
 * with the middleware passed ('createSettingsProxy' in dev, else 'modifySettingsStatic').
 * @type {import("./types").AddRoutes}
 */
function addAllReactRoutesConditionally(app, middleware, config) {
  const reactRouteGroups = getReactRouteGroups(
    config.get('showReactApp'),
    reactRouteServer
  );
  for (const { featureFlagOn, routes } of Object.values(reactRouteGroups)) {
    if (featureFlagOn === true) {
      routes.forEach(({ definition }) => {
        app[definition.method](definition.path, middleware);
      });
    }
  }
}
module.exports = {
  addAllReactRoutesConditionally,
};
