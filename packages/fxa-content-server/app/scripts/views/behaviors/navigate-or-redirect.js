/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A behavior that navigates to the relier's redirectTo value if present, or navigates to a fixed endpoint
 */

import _ from 'underscore';
import AuthErrors from '../../lib/auth-errors';
import NavigationBehavior from './navigate.js';

const NavigateOrRedirectBehavior = function(endpoint, options = {}) {
  const behavior = function(view, account) {
    let redirectTo = view.relier.get('redirectTo');
    if (redirectTo) {
      redirectTo = new URL(redirectTo, location.href);
      if (redirectTo.origin !== location.origin) {
        const err = AuthErrors.toError('INVALID_REDIRECT_TO');
        this.logError(err);
        throw err;
      }
      redirectTo = redirectTo.pathname + redirectTo.search;
    }
    const redirectEndpoint = redirectTo || endpoint;
    const navigateBehavior = new NavigationBehavior(redirectEndpoint, options);
    return navigateBehavior(view, account);
  };

  // used for testing
  _.assign(behavior, options, {
    endpoint: endpoint,
    halt: true,
    type: 'navigateOrRedirect',
  });

  return behavior;
};

export default NavigateOrRedirectBehavior;
