/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// helper functions for views with passwords. Meant to be mixed into views.
// Note, this mixin overrides beforeSubmit and is incompatible with Cocktail.

define(function (require, exports, module) {
  'use strict';

  var EmailResend = require('models/email-resend');

  var SHOW_RESEND_IN_MS = 5 * 60 * 1000; // 5 minutes.

  module.exports = {

    initialize: function () {
      this._emailResend = new EmailResend();
      this._emailResend.on('maxTriesReached', this._onMaxTriesReached.bind(this));
    },

    beforeSubmit: function () {
      // See https://github.com/mozilla/fxa-content-server/issues/885.
      // The first click of the resend button sends an email.
      // The forth click of the resend button sends an email.
      // All other clicks are ignored.
      // The button is hidden after the forth click for 5 minutes, then
      // start the process again.

      this._emailResend.incrementRequestCount();
      this._updateSuccessMessage();

      return this._emailResend.shouldResend();
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

    _onMaxTriesReached: function () {
      var self = this;
      // Hide the button after too many attempts. Redisplay button after a delay.
      self.logViewEvent('too_many_attempts');
      self.$('#resend').hide();
      self.setTimeout(function () {
        self._emailResend.reset();
        self.$('#resend').show();
      }, SHOW_RESEND_IN_MS);
    }
  };
});
