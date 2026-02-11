/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * reportOnlyCspMiddleware is where to declare experimental rules that
 * will not cause a resource to be blocked if it runs afowl of a rule, but
 * will cause the resource to be reported.
 *
 * If no directives other than `reportUri` are declared, the CSP reportOnly
 * middleware will not be added.
 */
module.exports = function (config) {
  return {
    directives: {
      reportUri: config.get('csp.reportOnlyUri'),
    },
    reportOnly: true,
  };
};
