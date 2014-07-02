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
  'lib/auth-errors',
  'views/mixins/service-mixin'
],
function (_, ConfirmView, BaseView, Template, Session, Constants, AuthErrors, ServiceMixin) {
  var t = BaseView.t;

  var View = ConfirmView.extend({
    template: Template,
    className: 'confirm-reset-password',

    events: {
      'click #resend': BaseView.preventDefaultThen('validateAndSubmit'),
      'click a[href="/signin"]': 'savePrefillEmailForSignin',
      'click a[href="/oauth/signin"]': 'savePrefillEmailForSignin'
    },

    context: function () {
      return {
        email: Session.email,
        encodedEmail: encodeURIComponent(Session.email),
        forceAuth: Session.forceAuth
      };
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
      var signInRoute = 'signin';
      var self = this;

      if (this.isOAuthSameBrowser()) {
        signInRoute = 'oauth/signin';
        this.setupOAuthLinks();
      }

      return self.fxaClient.isPasswordResetComplete(Session.passwordForgotToken)
        .then(function (isComplete) {
          if (isComplete) {
            var email = Session.email;
            Session.load();
            if (self.isOAuthSameBrowser() && Session.sessionToken) {
              self.navigate('reset_password_complete');
            } else {
              Session.clear();
              Session.set('prefillEmail', email);
              self.navigate(signInRoute, {
                success: t('Password reset. Sign in to continue.')
              });
            }
          } else {
            var retryCB = _.bind(self.afterRender, self);
            self.setTimeout(retryCB, Constants.RESET_PASSWORD_POLL_INTERVAL);
          }

          return isComplete;
        }, function (err) {
          // an unexpected error occurred
          console.error(err);
        });
    },

    submit: function () {
      var self = this;

      self.logEvent('confirm_reset_password:resend');
      return this.fxaClient.passwordResetResend()
              .then(function () {
                self.displaySuccess();
              }, function (err) {
                if (AuthErrors.is(err, 'INVALID_TOKEN')) {
                  return self.navigate('reset_password', {
                    error: err
                  });
                }

                // unexpected error, rethrow for display.
                throw err;
              });
    },

    savePrefillEmailForSignin: function () {
      Session.set('prefillEmail', Session.email);
    }
  });

  _.extend(View.prototype, ServiceMixin);

  return View;
});
