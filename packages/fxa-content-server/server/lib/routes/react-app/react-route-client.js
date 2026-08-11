/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const {
  FRONTEND_ROUTES,
  PAIRING_ROUTES,
  OAUTH_SUCCESS_ROUTES,
} = require('./content-server-routes');

/**
 *  Returns a route object with the `name` of the route.
 */
const reactRouteClient = {
  /** @param {String} name */
  getRoute(name) {
    if (
      typeof name === 'string' &&
      (name === '/' ||
        FRONTEND_ROUTES.includes(name) ||
        PAIRING_ROUTES.includes(name) ||
        OAUTH_SUCCESS_ROUTES.includes(name))
    ) {
      return name;
    }

    throw new Error(
      `"${name}" was not found in any existing content-server routes. Check for typos and path slash mismatches. Otherwise, the route might need to be accounted for in "server/lib/routes/react-app/".`
    );
  },

  /** @param {Array<String>} names */
  getRoutes(names) {
    return names.map((name) => this.getRoute(name));
  },
};

module.exports = {
  reactRouteClient,
};
