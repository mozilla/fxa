/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'views/confirm',
  'views/base',
  'stache!templates/confirm_reset_password',
  'lib/session',
  'lib/constants',
  'lib/auth-errors'
],
function (_, ConfirmView, BaseView, Template, Session, Constants, authErrors) {
  var t = BaseView.t;

  var View = ConfirmView.extend({
    template: Template,
    className: 'confirm-reset-password',

    beforeDestroy: function () {
      if (this._timeout) {
        this.window.clearTimeout(this._timeout);
      }
      ConfirmView.prototype.beforeDestroy.call(this);
    },

    beforeRender: function () {
      // user cannot confirm if they have not initiated a reset password
      if (! Session.passwordForgotToken) {
        this.navigate('reset_password');
        return false;
      }
    },

    afterRender: function () {
      var bounceGraphic = this.$el.find('.graphic');
      bounceGraphic.addClass('pulse');
      var self = this;

      return self.fxaClient.isPasswordResetComplete(Session.passwordForgotToken)
        .then(function (isComplete) {
          if (isComplete) {
            var email = Session.email;
            Session.clear();
            Session.set('prefillEmail', email);
            self.navigate('signin', {
              success: t('Password reset. Sign in to continue.')
            });
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
              }, function (err) {
                if (authErrors.is(err, 'INVALID_TOKEN')) {
                  return self.navigate('reset_password', {
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
