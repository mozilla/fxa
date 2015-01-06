/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'cocktail',
  'views/base',
  'views/form',
  'stache!templates/reset_password',
  'lib/session',
  'lib/auth-errors',
  'views/mixins/service-mixin'
],
function (Cocktail, BaseView, FormView, Template, Session,
  AuthErrors, ServiceMixin) {
  var t = BaseView.t;

  var View = FormView.extend({
    template: Template,
    className: 'reset_password',

    _getPrefillEmail: function () {
      return this.relier.get('email') || Session.prefillEmail || '';
    },

    context: function () {
      return {
        email: this._getPrefillEmail()
      };
    },

    afterRender: function () {
      var value = this.$('.email').val();
      if (value) {
        this.focus('.email');
      }

      if (this.relier.isOAuth()) {
        this.transformLinks();
      }

      FormView.prototype.afterRender.call(this);
    },

    submit: function () {
      var email = this.$('.email').val();

      var self = this;
      return self.fxaClient.passwordReset(email, self.relier)
        .then(function (result) {
          self.navigate('confirm_reset_password', {
            data: {
              email: email,
              passwordForgotToken: result.passwordForgotToken
            }
          });
        })
        .then(null, function (err) {
          // clear oauth session
          Session.clear('oauth');
          if (AuthErrors.is(err, 'UNKNOWN_ACCOUNT')) {
            // email indicates the signed in email. Use prefillEmail
            // to avoid collisions across sessions.
            Session.set('prefillEmail', email);
            err.forceMessage = t('Unknown account. <a href="/signup">Sign up</a>');
            return self.displayErrorUnsafe(err);
          } else if (AuthErrors.is(err, 'USER_CANCELED_LOGIN')) {
            self.logEvent('login.canceled');
            // if user canceled login, just stop
            return;
          }
          // re-throw error, it will be handled at a lower level.
          throw err;
        });
    }
  });

  Cocktail.mixin(
    View,
    ServiceMixin
  );

  return View;
});
