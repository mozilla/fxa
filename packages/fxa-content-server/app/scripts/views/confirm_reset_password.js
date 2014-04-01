/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'views/form',
  'views/base',
  'stache!templates/confirm_reset_password',
  'lib/session',
  'lib/constants'
],
function (_, FormView, BaseView, Template, Session, Constants) {
  var View = FormView.extend({
    template: Template,
    className: 'confirm-reset-password',

    context: function () {
      return {
        // HTML is written here to simplify the l10n community's job
        email: '<strong id="confirm-email" class="email">' + Session.email + '</strong>'
      };
    },

    events: {
      // validateAndSubmit is used to prevent multiple concurrent submissions.
      'click #resend': BaseView.preventDefaultThen('validateAndSubmit')
    },

    beforeDestroy: function () {
      if (this._timeout) {
        this.window.clearTimeout(this._timeout);
      }
    },

    afterRender: function () {
      var self = this;
      return self.fxaClient.isPasswordResetComplete()
        .then(function (isComplete) {
          if (isComplete) {
            var email = Session.email;
            Session.clear();
            Session.set('prefillEmail', email);
            self.navigate('signin');
          } else {
            var retryCB = _.bind(self.afterRender, self);
            self._timeout = self.window.setTimeout(retryCB,
                              Constants.RESET_PASSWORD_POLL_INTERVAL);
          }

          return isComplete;
        }, function (err) {
          // an unexpected error occurred
          console.error(err);
        });
    },

    submit: function () {
      var self = this;

      return this.fxaClient.passwordResetResend()
              .then(function () {
                self.displaySuccess();
              });
    }

  });

  return View;
});
