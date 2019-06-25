/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Helper functions to allow a view to resend, e.g., an email or SMS.
 *
 * Binds a click event to the #resend DOM element which causes
 * the message to be resent.
 *
 * Consumers must expose a `resend` function which returns a promise
 * and actually resends the message.
 *
 * When #resend is clicked, a <viewname>.resend event is logged.
 *
 * @module ResendMixin
 */

import _ from 'underscore';
import Duration from 'duration';
import EmailResend from '../../models/email-resend';
import preventDefaultThen from '../decorators/prevent_default_then';

const t = msg => msg;

const SHOW_RESEND_IN_MS = new Duration('5m').milliseconds();

/**
 * Creates the mixin to be used by views.
 *
 * @param {Object} [options={}] options
 *   @param {String} successMessage success message to display when complete.
 *     Defaults to `Email resent`. If falsey, no message is displayed.
 * @return {Function} the mixin to be consumed by views.
 */
export default function(options = {}) {
  const { successMessage } = _.defaults(options, {
    successMessage: t(
      'Email resent. Add accounts@firefox.com to your contacts to ensure a smooth delivery.'
    ),
  });

  return {
    initialize() {
      this._emailResend = new EmailResend();
      this.listenTo(
        this._emailResend,
        'maxTriesReached',
        this._onMaxTriesReached
      );
    },

    events: {
      'click #resend': preventDefaultThen('_resend'),
    },

    _resend() {
      return Promise.resolve().then(() => {
        this.logViewEvent('resend');
        this._updateSuccessMessage();

        // The button is hidden after the fourth click for 5 minutes, then
        // start the process again.
        this._emailResend.incrementRequestCount();
        if (this._emailResend.shouldResend()) {
          return this.resend()
            .then(() => {
              if (successMessage) {
                this.displaySuccess(successMessage);
              }
            })
            .catch(err => this.displayError(err));
        }
      });
    },

    _updateSuccessMessage() {
      // if a success message is already being displayed, shake it.
      var successEl = this.$('.success:visible');
      if (successEl) {
        successEl
          .one('animationend', () => {
            successEl.removeClass('shake');
          })
          .addClass('shake');
      }
    },

    _onMaxTriesReached() {
      // Hide the button after too many attempts. Redisplay button after a delay.
      this.logViewEvent('too_many_attempts');
      this.$('#resend').hide();
      this.setTimeout(() => {
        this._emailResend.reset();
        this.$('#resend').show();
      }, SHOW_RESEND_IN_MS);
    },
  };
}
