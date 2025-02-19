/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { getReactRouteGroups } = require('.');
const { ReactRouteServer } = require('./react-route-server');

/**
 * The react route group used on the server-side, containing route definitions.

 *  @type {import("./types").GetReactRouteGroups}
 */
const getServerReactRouteGroups = (showReactApp, i18n, config) => {
  const reactRoute = new ReactRouteServer(i18n, config);
  return getReactRouteGroups(showReactApp, reactRoute);
};

module.exports = {
  getServerReactRouteGroups,
};
