/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Handle signed-in notifications.

define([
  'lib/promise'
],
function (p) {
  'use strict';

  function navigateToSignedInView (event) {
    if (this.broker.hasCapability('handleSignedInNotification')) {
      var self = this;
      return this.user.setSignedInAccount(event)
        .then(function () {
          self.navigate(self._redirectTo || 'settings');
        });
    }

    return p();
  }

  return {
    initialize: function (options) {
      this._notifications = options.notifications;
      this._navigateToSignedInView = navigateToSignedInView.bind(this);
      this._notifications.on(
        this._notifications.EVENTS.SIGNED_IN,
        this._navigateToSignedInView
      );
    },

    destroy: function () {
      this._notifications.off(
        this._notifications.EVENTS.SIGNED_IN,
        this._navigateToSignedInView
      );
    }
  };
});
