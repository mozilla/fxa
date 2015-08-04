/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'cocktail',
  'lib/promise',
  'views/base',
  'views/form',
  'views/sign_in',
  'views/mixins/password-mixin',
  'views/mixins/resume-token-mixin',
  'stache!templates/force_auth',
  'lib/session',
  'lib/auth-errors'
],
function (Cocktail, p, BaseView, FormView, SignInView, PasswordMixin,
    ResumeTokenMixin, Template, Session, AuthErrors) {
  'use strict';

  function getFatalErrorMessage(self, fatalError) {
    if (fatalError) {
      return self.translateError(fatalError);
    }

    return '';
  }


  var View = SignInView.extend({
    template: Template,
    className: 'sign-in',

    initialize: function (options) {
      options = options || {};

      this._formPrefill = options.formPrefill;

      // forceAuth means a user must sign in as a specific user.
      // kill the user's local session.
      Session.clear();
      this.user.clearSignedInAccount();
    },

    context: function () {
      var fatalError = '';
      var email = this.relier.get('email');

      if (! email) {
        fatalError = AuthErrors.toError('FORCE_AUTH_EMAIL_REQUIRED');
      }

      return {
        email: email,
        password: this._formPrefill.get('password'),
        fatalError: getFatalErrorMessage(this, fatalError),
        isPasswordAutoCompleteDisabled: this.isPasswordAutoCompleteDisabled()
      };
    },

    events: {
      'click a[href="/confirm_reset_password"]': BaseView.cancelEventThen('resetPasswordNow')
    },

    beforeDestroy: function () {
      this._formPrefill.set('password', this.getElementValue('.password'));
    },

    submit: function () {
      var account = this.user.initAccount({
        email:  this.relier.get('email'),
        password: this.$('.password').val()
      });

      return this._signIn(account);
    },

    onSignInError: function (account, err) {
      if (AuthErrors.is(err, 'UNKNOWN_ACCOUNT')) {
        // dead end, do not allow the user to sign up.
        this.displayError(err);
      } else {
        return SignInView.prototype.onSignInError.call(this, account, err);
      }
    },

    resetPasswordNow: function () {
      var self = this;
      return p().then(function () {
        // If the user is already making a request, ban submission.
        if (self.isSubmitting()) {
          throw new Error('submit already in progress');
        }

        var email = self.relier.get('email');
        self._isSubmitting = true;

        return self.fxaClient.passwordReset(
          email,
          self.relier,
          {
            resume: self.getStringifiedResumeToken()
          }
        )
        .then(function (result) {
          self._isSubmitting = false;
          self.navigate('confirm_reset_password', {
            data: {
              email: email,
              passwordForgotToken: result.passwordForgotToken
            }
          });
        })
        .fail(function (err) {
          self._isSubmitting = false;
          self.displayError(err);
        });
      });
    },

    /**
     * Displays the account's avatar
     */

    afterVisible: function () {
      var email = this.relier.get('email');
      var account = this.user.getAccountByEmail(email);

      // Use FormView's afterVisible because SignIn attemps to
      // display a profile image for the "suggested" account.
      FormView.prototype.afterVisible.call(this);
      // Display the profile image if possible, otherwise show a placeholder.
      return this.displayAccountProfileImage(account);
    }
  });

  Cocktail.mixin(
    View,
    PasswordMixin,
    ResumeTokenMixin
  );

  return View;
});
