/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Helper functions to allow a view to resend an email.
//
// Binds a click event to the #resend DOM element which causes
// an email to be resent.
//
// Consumers must expose a `resend` function which returns a promise
// and actually sends the email.
//
// When #resend is clicked, a <viewname>.resend event is logged.

define(function (require, exports, module) {
  'use strict';

  const Duration = require('duration');
  const EmailResend = require('models/email-resend');
  const p = require('lib/promise');
  const { preventDefaultThen, t } = require('views/base');

  const SHOW_RESEND_IN_MS = new Duration('5m').milliseconds();

  module.exports = {
    initialize () {
      this._emailResend = new EmailResend();
      this.listenTo(this._emailResend, 'maxTriesReached', this._onMaxTriesReached);
    },

    events: {
      'click #resend': preventDefaultThen('_resend')
    },

    _resend () {
      return p().then(() => {
        this.logViewEvent('resend');
        this._updateSuccessMessage();

        // The button is hidden after the fourth click for 5 minutes, then
        // start the process again.
        this._emailResend.incrementRequestCount();
        if (this._emailResend.shouldResend()) {
          return this.resend()
            .then(() => this.displaySuccess(t('Email resent')))
            .fail((err) => this.displayError(err));
        }
      });
    },

    _updateSuccessMessage () {
      // if a success message is already being displayed, shake it.
      var successEl = this.$('.success:visible');
      if (successEl) {
        successEl.one('animationend', () => {
          successEl.removeClass('shake');
        }).addClass('shake');
      }
    },

    _onMaxTriesReached () {
      // Hide the button after too many attempts. Redisplay button after a delay.
      this.logViewEvent('too_many_attempts');
      this.$('#resend').hide();
      this.setTimeout(() => {
        this._emailResend.reset();
        this.$('#resend').show();
      }, SHOW_RESEND_IN_MS);
    }
  };
});
