/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A behavior that navigates to a new view.
 */

import _ from 'underscore';

const NavigationBehavior = function (endpoint, options = {}) {
  const behavior = function (view, account) {
    const navigateOptions = _.assign({}, options, { account });
    view.navigate(endpoint, navigateOptions);

    // halt the flow after navigating.
    return new Promise(() => {});
  };

  // used for testing
  _.assign(behavior, options, {
    endpoint: endpoint,
    halt: true,
    type: 'navigate',
  });

  return behavior;
};

export default NavigationBehavior;
