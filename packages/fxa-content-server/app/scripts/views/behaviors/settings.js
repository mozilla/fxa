/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Redirects to settings if `account` is signed in,
 * returns `defaultBehavior` otherwise.
 */

define(function (require, exports, module) {
  'use strict';

  const NavigateBehavior = require('views/behaviors/navigate');

  const t = (msg) => msg;
  const success = t('Account verified successfully');

  module.exports = function (defaultBehavior) {
    const behavior = function (view, account) {
      return account.isSignedIn()
        .then((isSignedIn) => {
          if (isSignedIn) {
            return new NavigateBehavior('settings', { success });
          }

          return defaultBehavior;
        });
    };

    behavior.type = 'settings';

    return behavior;
  };
});
