/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'views/base',
  'views/form',
  'stache!templates/sign_in',
  'lib/session',
  'lib/fxa-client',
  'lib/password-mixin',
  'lib/url'
],
function (_, BaseView, FormView, SignInTemplate, Session, FxaClient, PasswordMixin, Url) {
  var t = BaseView.t;

  var View = FormView.extend({
    template: SignInTemplate,
    className: 'sign-in',

    initialize: function (options) {
      options = options || {};

      this.window = options.window || window;

      // reset any force auth status.
      Session.set('forceAuth', false);

      if (options.forceAuth) {
        // forceAuth means a user must sign in as a specific user.

        // kill the user's local session, set forceAuth flag
        Session.clear();
        Session.set('forceAuth', true);

        var email = Url.searchParam('email', this.window.location.search);
        if (email) {
          Session.set('email', email);
        }
      }
    },

    context: function () {
      var error = '';
      if (Session.forceAuth && !Session.email) {
        error = '/force_auth requres an email';
      }

      return {
        email: Session.email,
        forceAuth: Session.forceAuth,
        error: error,
        isSync: Url.searchParam('service') === 'sync'
      };
    },

    events: {
      'change .show-password': 'onPasswordVisibilityChange'
    },

    submitForm: function () {
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
              this.displayError(err.errno || err.message);
            }, this));
    },

    isFormValid: function () {
      return !! (this._validateEmail() && this._validatePassword());
    },

    showValidationErrors: function () {
      if (! this._validateEmail()) {
        this.showValidationError('.email', t('Valid email required'));
      } else if (! this._validatePassword()) {
        var passwordVal = this.$('.password').val();

        if (! passwordVal) {
          this.showValidationError('.password', t('Valid password required'));
        } else {
          this.showValidationError('.password', t('Must be at least 8 characters'));
        }
      }
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

