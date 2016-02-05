/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var allowOnlyOneSubmit = require('views/decorators/allow_only_one_submit');
  var AuthErrors = require('lib/auth-errors');
  var BaseView = require('views/base');
  var Cocktail = require('cocktail');
  var FormView = require('views/form');
  var PasswordResetMixin = require('views/mixins/password-reset-mixin');
  var SignInView = require('views/sign_in');
  var Template = require('stache!templates/force_auth');

  function getFatalErrorMessage(self, fatalError) {
    if (fatalError) {
      return self.translateError(fatalError);
    }

    return '';
  }

  var View = SignInView.extend({
    template: Template,
    className: 'force-auth',

    context: function () {
      var fatalError = '';
      var email = this.relier.get('email');

      if (! email) {
        fatalError = AuthErrors.toError('FORCE_AUTH_EMAIL_REQUIRED');
      }

      return {
        email: email,
        fatalError: getFatalErrorMessage(this, fatalError),
        isPasswordAutoCompleteDisabled: this.isPasswordAutoCompleteDisabled(),
        password: this._formPrefill.get('password')
      };
    },

    events: {
      'click a[href="/confirm_reset_password"]': BaseView.cancelEventThen('resetPasswordNow')
    },

    beforeDestroy: function () {
      this._formPrefill.set('password', this.getElementValue('.password'));
    },

    onSignInError: function (account, password, err) {
      if (AuthErrors.is(err, 'UNKNOWN_ACCOUNT')) {
        // dead end, do not allow the user to sign up.
        this.displayError(err);
      } else {
        return SignInView.prototype.onSignInError.call(
            this, account, password, err);
      }
    },

    onSignInSuccess: function (account) {
      var self = this;
      self.logViewEvent('success');
      return self.invokeBrokerMethod('afterForceAuth', account)
        .then(function () {
          self.navigate(self.model.get('redirectTo') || 'settings', {}, {
            clearQueryParams: true
          });
        });
    },

    resetPasswordNow: allowOnlyOneSubmit(function () {
      var self = this;
      var email = self.relier.get('email');

      return self.resetPassword(email)
        .fail(function (err) {
          self.displayError(err);
        });
    }),

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
      return this.displayAccountProfileImage(account, { spinner: true });
    }
  });

  Cocktail.mixin(
    View,
    PasswordResetMixin
  );

  module.exports = View;
});
