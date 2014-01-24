/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'views/base',
  'stache!templates/sign_in',
  'lib/session',
  'lib/fxa-client',
  'lib/password-mixin'
],
function (_, BaseView, SignInTemplate, Session, FxaClient, PasswordMixin) {
  var View = BaseView.extend({
    template: SignInTemplate,
    className: 'sign-in',

    initialize: function (options) {
      options = options || {};

      // forceAuth means a user must sign in as a specific user.
      Session.set('forceAuth', options.forceAuth || false);
    },

    events: {
      'submit form': BaseView.preventDefaultThen('signIn'),
      'keyup input': 'enableButtonWhenValid',
      'change input': 'enableButtonWhenValid',
      'change .show-password': 'onPasswordVisibilityChange'
    },

    context: function () {
      return {
        email: Session.email,
        forceAuth: Session.forceAuth
      };
    },

    signIn: function () {
      if (! (this.isValid())) {
        return;
      }

      var email = Session.forceAuth ? Session.email : this.$('.email').val();
      var password = this.$('.password').val();

      var client = new FxaClient();
      var self = this;
      client.signIn(email, password)
            .then(function (accountData) {
              if (accountData.verified) {
                self.navigate('settings');
              } else {
                return client.signUpResend()
                  .then(function () {
                    self.navigate('confirm');
                  });
              }
            })
            .done(null, _.bind(function (err) {
              this.displayError(err.message);
            }, this));
    },

    isValid: function () {
      return this._validateEmail() && this._validatePassword();
    },

    _validateEmail: function () {
      // user cannot fill out email in forceAuth mode
      return Session.forceAuth || this.isElementValid('.email');
    },

    _validatePassword: function () {
      return this.isElementValid('.password');
    }
  });

  _.extend(View.prototype, PasswordMixin);

  return View;
});

