/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { reactRouteClient } = require('./react-route-client');
const { getReactRouteGroups } = require('.');

/**
 * The react route group used on the client-side. It does not contain route definitions.
 *
 *  @type {import("./types").GetReactRouteGroups}
 */
const getClientReactRouteGroups = (showReactApp) => {
  return getReactRouteGroups(showReactApp, reactRouteClient);
};

module.exports = {
  getClientReactRouteGroups,
};
