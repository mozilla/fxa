/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { FRONTEND_ROUTES } = require('../get-frontend');
const { PAIRING_ROUTES } = require('../get-frontend-pairing');
const { OAUTH_SUCCESS_ROUTES } = require('../get-oauth-success');
const {
  getFrontEndRouteDefinition,
  getFrontEndPairingRouteDefinition,
  getOAuthSuccessRouteDefinition,
} = require('./route-definitions');

/**
 * Returns a route object with the `name` of the route and the route `definition`
 * if used on the server-side.
 */
class ReactRoute {
  /** @param {Boolean} isServer Is access coming from the server? The client
   * doesn't need route definitions. */
  constructor(isServer) {
    this.isServer = isServer;
  }

  /** @param {String} name */
  getRoute(name) {
    if (FRONTEND_ROUTES.includes(name)) {
      return this.getFrontEnd(name);
    }
    if (PAIRING_ROUTES.includes(name)) {
      return this.getFrontEndPairing(name);
    }
    if (OAUTH_SUCCESS_ROUTES.includes(name)) {
      return this.getOAuthSuccess(name);
    }

    throw new Error(
      `"${name}" was not found in any existing content-server routes. Check for typos and path slash mismatches. Otherwise, the route might need to be accounted for in "server/lib/routes/react-app/".`
    );
  }

  /** @param {Array<string>} names */
  getRoutes(names) {
    const routes = [];
    for (const name of names) {
      routes.push(this.getRoute(name));
    }
    return routes;
  }

  /**
   * @type {import("./types").GetRoute}
   * @private
   * */
  getRouteObject(name, definition) {
    return {
      name,
      ...(this.isServer && { definition }),
    };
  }

  /** @private */
  getFrontEnd(name) {
    return this.getRouteObject(name, getFrontEndRouteDefinition([name]));
  }

  /** @private */
  getFrontEndPairing(name) {
    return this.getRouteObject(name, getFrontEndPairingRouteDefinition([name]));
  }

  /** @private */
  getOAuthSuccess(name) {
    return this.getRouteObject(name, getOAuthSuccessRouteDefinition([name]));
  }
}

module.exports = {
  ReactRoute,
};
