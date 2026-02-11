/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This is an abbreviated version of the function from
// fxa-auth-server/lib/routes/utils/subscriptions.js
exports.determineClientVisibleSubscriptionCapabilities = function (
  clientId,
  allCapabilities
) {
  const capabilitiesToReveal = new Set([
    ...(allCapabilities['*'] || []),
    ...(allCapabilities[clientId] || []),
  ]);
  return capabilitiesToReveal.size > 0
    ? Array.from(capabilitiesToReveal).sort()
    : undefined;
};
