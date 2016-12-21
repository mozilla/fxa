/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Handle signed-out notifications.

define(function (require, exports, module) {
  'use strict';

  const BaseView = require('views/base');
  const Notifier = require('lib/channels/notifier');
  const Session = require('lib/session');

  var Mixin = {
    notifications: {
      // populated below using event name aliases
    },

    clearSessionAndNavigateToSignIn () {
      // Unset uid otherwise it will henceforth be impossible
      // to sign in to different accounts inside this tab.
      this.relier.unset('uid');
      this.relier.unset('email');
      this.user.clearSignedInAccountUid();
      if (this._formPrefill) {
        // The user has manually signed out, a pretty strong indicator
        // the user does not want any of their information pre-filled
        // on the signin page. Clear any remaining formPrefill info
        // to ensure their data isn't sticking around in memory.
        this._formPrefill.clear();
      }
      Session.clear();
      this.navigateToSignIn();
    },

    navigateToSignIn () {
      this.navigate('signin', {
        success: BaseView.t('Signed out successfully')
      }, {
        clearQueryParams: true
      });
    }
  };

  Mixin.notifications[Notifier.SIGNED_OUT] =
              'clearSessionAndNavigateToSignIn';

  module.exports = Mixin;
});
