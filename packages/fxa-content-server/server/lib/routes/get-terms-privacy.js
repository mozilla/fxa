/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * <locale>/legal/terms, <locale>/legal/privacy
 * Translation done by fetching appropriate template for language.
 * If language is not found, fall back to en-US.
 *
 * Either full HTML or a partial can be requested. Partials are
 * requested by the front end to request translated documents and
 * insert them into the DOM. Full HTML is used whenever a user
 * browses to one of the pages directly.
 *
 * Partials are requested by setting the `Accepts` header to `text/partial`
 * HTML is returned if `Accepts` is `text/html`
 */

'use strict';
const {
  getTermsPrivacyRouteDefinition,
} = require('./react-app/route-definitions');
const { TERMS_PRIVACY_REGEX } = require('./react-app/content-server-routes');

// /** @type {import("./react-app/types").GetBackboneRouteDefinition} */
function getTermsPrivacy(reactRouteGroups, i18n, regex = TERMS_PRIVACY_REGEX) {
  return reactRouteGroups.simpleRoutes.featureFlagOn &&
    reactRouteGroups.simpleRoutes.routes.find(
      (route) =>
        route.name instanceof RegExp && route.name.source === regex.source
    )
    ? null
    : getTermsPrivacyRouteDefinition(regex, i18n);
}

module.exports = {
  default: getTermsPrivacy,
};
