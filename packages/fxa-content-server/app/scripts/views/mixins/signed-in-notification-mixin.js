/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Handle signed-in notifications.

define(function (require, exports, module) {
  'use strict';

  var Notifier = require('lib/channels/notifier');
  var p = require('lib/promise');

  var Mixin = {
    notifications: {
      // populated below using event name aliases
    },

    _navigateToSignedInView: function (event) {
      if (this.broker.hasCapability('handleSignedInNotification')) {
        var self = this;
        return this.user.setSignedInAccount(event)
          .then(function () {
            self.navigate(self._redirectTo || 'settings');
          });
      }

      return p();
    }
  };

  Mixin.notifications[Notifier.SIGNED_IN] =
              '_navigateToSignedInView';

  module.exports = Mixin;
});
