/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { getReactRouteGroups } = require('.');
const config = require('../../configuration');

/** Add all routes routes from all route objects for fxa-settings or fxa-content-server to serve.
 * @type {import("./types").AddRoutes}
 */
function addAllReactRoutesConditionally(app, routeHelpers, middleware) {
  /** Check if the feature flag passed in is `true` and the request contains `?showReactApp=true`.
   * If true, use the middleware passed ('createSettingsProxy' in dev, else 'modifySettingsStatic')
   * for that route, allowing `fxa-settings` to serve the page. If false, skip the middleware and
   * use the default routing middleware from `fxa-shared/express/routing.ts`.
   * @param {import("./types").ReactRouteGroup}
   */
  function addReactRoutesConditionally({ featureFlagOn, routes }) {
    if (featureFlagOn === true) {
      routes.forEach(({ definition }) => {
        // possible TODO - `definition.method`s will either be 'get' or 'post'. Not sure if we need
        // this for any 'post' requests but shouldn't hurt anything; 'get' alone may suffice.
        app[definition.method](definition.path, (req, res, next) => {
          if (req.query.showReactApp === 'true') {
            return middleware(req, res, next);
          } else {
            next('route');
          }
        });
        // Manually add route for content-server to serve; occurs when above next('route'); is called
        routeHelpers.addRoute(definition);
      });
    }
  }

  const reactRouteGroups = getReactRouteGroups(config.get('showReactApp'));
  for (const routeGroup in reactRouteGroups) {
    addReactRoutesConditionally(reactRouteGroups[routeGroup]);
  }
}
module.exports = {
  addAllReactRoutesConditionally,
};
