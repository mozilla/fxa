/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Redirects to settings if `account` is signed in,
 * returns `defaultBehavior` otherwise.
 */

import NavigateBehavior from '../behaviors/navigate';
const t = msg => msg;

/**
 * Creates navigation behavior that displays a success message
 * and redirects to settings.
 *
 * @param {Object} defaultBehavior - default behavior to invoke if not signed in
 * @param {Object} [options]
 *   @param {String} [options.success] - success message when redirected
 * @return {Object} promise
 */
export default function(defaultBehavior, options = {}) {
  const behavior = function(view, account) {
    return account.isSignedIn().then(isSignedIn => {
      if (isSignedIn) {
        let success = t('Account verified successfully');
        let endpoint = 'settings';

        // Strict comparison because undefined == null, but undefined !== null, and
        // we want to be able to intentionally unset this value via options.success.
        if (options.success !== null) {
          success = options.success;
        }

        // Check the `redirectTo` param sent from server, if it matches
        // a known path redirect there, else just go to settings.
        let redirectTo = view.relier.get('redirectTo');
        if (redirectTo) {
          redirectTo = new URL(redirectTo, window.location.origin);
          if (redirectTo.origin === window.location.origin) {
            redirectTo = redirectTo.pathname + redirectTo.search;
            if (redirectTo.indexOf('/settings/emails') >= 0) {
              endpoint = '/settings/emails';
            } else if (
              redirectTo.indexOf('/settings/two_step_authentication') >= 0
            ) {
              endpoint = '/settings/two_step_authentication';
            } else if (redirectTo.indexOf('/subscriptions/products') === 0) {
              endpoint = redirectTo;
            }
          }
        }

        return new NavigateBehavior(endpoint, { success });
      }

      return defaultBehavior;
    });
  };

  behavior.type = 'settings';

  return behavior;
}
