/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { getServerReactRouteGroups } = require('./route-groups-server');

/** Add all routes from all route objects for fxa-settings or fxa-content-server to serve.
 * @type {import("./types").AddRoutes}
 */
function addAllReactRoutesConditionally(
  app,
  routeHelpers,
  middleware,
  i18n,
  config
) {
  /** Check if the feature flag passed in is `true`, and either the request contains
   * `?showReactApp=true` or `fullProdRollout` is set to `true`. If true, use the
   * middleware passed ('createSettingsProxy' in dev, else 'modifySettingsStatic') for
   * that route, allowing `fxa-settings` to serve the page. If false, skip the middleware
   * and use the default routing middleware from `fxa-shared/express/routing.ts` to
   * serve the Backbone app.
   * @param {import("./types").ReactRouteGroup}
   */
  function addReactRoutesConditionally({
    featureFlagOn,
    routes,
    fullProdRollout,
  }) {
    if (featureFlagOn === true) {
      routes.forEach(({ definition }) => {
        // possible TODO - `definition.method`s will either be 'get' or 'post'. Not sure if we need
        // this for any 'post' requests but shouldn't hurt anything; 'get' alone may suffice.
        app[definition.method](definition.path, (req, res, next) => {
          if (req.query.showReactApp === 'true' || fullProdRollout) {
            // req.path === '/' seems to match some content-server routes like `/authorization`.
            // To be sure we are only pointing to React for '/' with '?showReactApp=true' and not
            // other routes when only '/' is set in react-app/index.js, explicitly check for
            // `originalUrl` as well.
            if (definition.path === '/') {
              if (req.originalUrl.split('?')[0] === '/') {
                return middleware(req, res, next);
              } else {
                return next('route');
              }
            }
            return middleware(req, res, next);
          }
          next('route');
        });
        // Manually add route for content-server to serve; occurs when above next('route'); is called
        routeHelpers.addRoute(definition);
      });
    }
  }

  const reactRouteGroups = getServerReactRouteGroups(
    config.get('showReactApp'),
    i18n,
    config
  );
  for (const routeGroup in reactRouteGroups) {
    addReactRoutesConditionally(reactRouteGroups[routeGroup]);
  }
}
module.exports = {
  addAllReactRoutesConditionally,
};
