/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Returns a route object with the `name` of the route and the route `definition`.
 */
const reactRouteServer = {
  /** @param {String} name */
  getRoute(name) {
    // Names that start with '/' are already Express paths, e.g. '/oauth/success/:clientId'
    const path = name.startsWith('/') ? name : new RegExp(`^/${name}/?$`);
    return { name, definition: { method: 'get', path } };
  },

  /** @param {Array<String>} names */
  getRoutes(names) {
    return names.map((name) => this.getRoute(name));
  },
};

module.exports = {
  reactRouteServer,
};
