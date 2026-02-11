/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const {
  FRONTEND_ROUTES,
  PAIRING_ROUTES,
  OAUTH_SUCCESS_ROUTES,
  TERMS_PRIVACY_REGEX,
} = require('./content-server-routes');
const {
  getFrontEndRouteDefinition,
  getFrontEndPairingRouteDefinition,
  getOAuthSuccessRouteDefinition,
  getTermsPrivacyRouteDefinition,
} = require('./route-definitions');
const { getIndexRouteDefinition } = require('./route-definition-index');

/**
 * Returns a route object with the `name` of the route and the route `definition`.
 */
class ReactRouteServer {
  /** @param {any} i18n
   * */
  constructor(i18n, config) {
    this.i18n = i18n;
    this.config = config;
  }

  /** @param {String|RegExp} name */
  getRoute(name) {
    if (typeof name === 'string') {
      if (name === '/') {
        return this.getIndex(name);
      }
      if (FRONTEND_ROUTES.includes(name)) {
        return this.getFrontEnd(name);
      }
      if (PAIRING_ROUTES.includes(name)) {
        return this.getFrontEndPairing(name);
      }
      if (OAUTH_SUCCESS_ROUTES.includes(name)) {
        return this.getOAuthSuccess(name);
      }
    }
    if (name instanceof RegExp && name.source === TERMS_PRIVACY_REGEX.source) {
      return this.getTermsPrivacy(TERMS_PRIVACY_REGEX);
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
      definition,
    };
  }

  /** @private */
  getFrontEnd(name) {
    return this.getRouteObject(name, getFrontEndRouteDefinition([name]));
  }

  /** @private */
  getIndex(name) {
    return this.getRouteObject(name, getIndexRouteDefinition(this.config));
  }

  /** @private */
  getFrontEndPairing(name) {
    return this.getRouteObject(name, getFrontEndPairingRouteDefinition([name]));
  }

  /** @private */
  getOAuthSuccess(name) {
    return this.getRouteObject(name, getOAuthSuccessRouteDefinition([name]));
  }

  /** @private */
  getTermsPrivacy(regex) {
    return this.getRouteObject(
      regex,
      getTermsPrivacyRouteDefinition(regex, this.i18n)
    );
  }
}

module.exports = {
  ReactRouteServer,
};
