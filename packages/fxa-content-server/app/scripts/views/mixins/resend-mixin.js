/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// helper functions for views with passwords. Meant to be mixed into views.

'use strict';

define([
], function () {
  var SHOW_RESEND_IN_MS = 5 * 60 * 1000; // 5 minutes.

  return {
    _attemptedSubmits: 0,

    beforeSubmit: function () {
      // See https://github.com/mozilla/fxa-content-server/issues/885.
      // The first click of the resend button sends an email.
      // The forth click of the resend button sends an email.
      // All other clicks are ignored.
      // The button is hidden after the forth click for 5 minutes, then
      // start the process again.

      this._attemptedSubmits++;

      this._updateSuccessMessage();
      this._updateResendButton();

      return this._attemptedSubmits === 1 || this._attemptedSubmits === 4;
    },

    _updateSuccessMessage: function () {
      // if a success message is already being displayed, shake it.
      var successEl = this.$('.success:visible');
      if (successEl) {
        successEl.one('animationend', function () {
          successEl.removeClass('shake');
        }).addClass('shake');
      }
    },

    _updateResendButton: function () {
      var self = this;
      // Hide the button after 4 attempts. Redisplay button after a delay.
      if (self._attemptedSubmits === 4) {
        self.logEvent(self.className + ':too_many_attempts');
        self.$('#resend').hide();
        self.setTimeout(function () {
          self._attemptedSubmits = 0;
          self.$('#resend').show();
        }, SHOW_RESEND_IN_MS);
      }
    }
  };
});
