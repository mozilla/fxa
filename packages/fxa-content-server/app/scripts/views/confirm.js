/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'views/form',
  'views/base',
  'stache!templates/confirm',
  'lib/session',
  'lib/auth-errors'
],
function (FormView, BaseView, Template, Session, AuthErrors) {
  var t = BaseView.t;
  var SHOW_RESEND_IN_MS = 5 * 60 * 1000; // 5 minutes.

  var View = FormView.extend({
    template: Template,
    className: 'confirm',

    beforeDestroy: function () {
      if (this._displayResendTimeout) {
        this.window.clearTimeout(this._displayResendTimeout);
      }
    },

    context: function () {
      return {
        email: Session.email
      };
    },

    events: {
      // validateAndSubmit is used to prevent multiple concurrent submissions.
      'click #resend': BaseView.preventDefaultThen('validateAndSubmit')
    },

    beforeRender: function () {
      // user cannot confirm if they have not initiated a sign up.
      if (! Session.sessionToken) {
        this.navigate('signup');
        return false;
      }
    },

    afterRender: function() {
      var graphic = this.$el.find('.graphic');
      graphic.addClass('pulse');
    },

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
        self.$('#resend').hide();
        self._displayResendTimeout = setTimeout(function () {
          self._displayResendTimeout = null;
          self._attemptedSubmits = 0;
          self.$('#resend').show();
        }, SHOW_RESEND_IN_MS);
      }
    },

    submit: function () {
      var self = this;

      return this.fxaClient.signUpResend()
              .then(function () {
                self.displaySuccess();
              }, function (err) {
                if (AuthErrors.is(err, 'INVALID_TOKEN')) {
                  return self.navigate('signup', {
                    error: t('Invalid token')
                  });
                }

                // unexpected error, rethrow for display.
                throw err;
              });
    }
  });

  return View;
});
