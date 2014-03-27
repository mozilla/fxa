/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'views/base',
  'views/form',
  'stache!templates/sign_up',
  'lib/session',
  'lib/fxa-client',
  'lib/password-mixin',
  'lib/auth-errors'
],
function (_, BaseView, FormView, Template, Session, FxaClient, PasswordMixin, AuthErrors) {
  var t = BaseView.t;

  var now = new Date();

  // If COPPA says 13, why 14 here? To make UX simpler, we only ask
  // for their year of birth, we do not ask for month and day.
  // To make this safe and ensure we do not let *any* 12 year olds pass,
  // we are saying that it is acceptable for some 13 year olds to be
  // caught in the snare.
  // This is written on 2014-01-16. 13 years ago is 2001-01-16. Somebody born
  // in 2001-01-15 is now 13. Somebody born 2001-01-17 is still only 12.
  // To avoid letting the 12 year old in, add an extra year.
  var TOO_YOUNG_YEAR = now.getFullYear() - 14;

  var View = FormView.extend({
    template: Template,
    className: 'sign-up',

    initialize: function (options) {
      options = options || {};

      // Reset forceAuth flag so users who visit the reset_password screen
      // see the correct links.
      Session.set('forceAuth', false);
    },

    beforeRender: function () {
      if (document.cookie.indexOf('tooyoung') > -1) {
        this.navigate('cannot_create_account');
        return false;
      }

      return true;
    },

    events: {
      'change .show-password': 'onPasswordVisibilityChange',
      'keydown #fxa-age-year': 'submitOnEnter'
    },

    context: function () {
      return {
        email: Session.prefillEmail,
        service: Session.service,
        isSync: Session.service === 'sync'
      };
    },

    submitOnEnter: function (event) {
      if (event.which === 13) {
        this.validateAndSubmit();
      }
    },

    isValidEnd: function () {
      return this._validateYear();
    },

    showValidationErrorsEnd: function () {
      if (! this._validateYear()) {
        this.showValidationError('#fxa-age-year', t('Year of birth required'));
      }
    },

    submit: function () {
      if (! this._isUserOldEnough()) {
        return this._cannotCreateAccount();
      }

      this._createAccount();
    },

    _validateYear: function () {
      return ! isNaN(this._getYear());
    },

    _getYear: function () {
      return this.$('#fxa-age-year').val();
    },

    _isUserOldEnough: function () {
      var year = parseInt(this._getYear(), 10);

      return year <= TOO_YOUNG_YEAR;
    },

    _cannotCreateAccount: function () {
      // this is a session cookie. It will go away once:
      // 1. the user closes the tab
      // and
      // 2. the user closes the browser
      // Both of these have to happen or else the cookie
      // hangs around like a bad smell.
      document.cookie = 'tooyoung=1;';

      this.navigate('cannot_create_account');
    },

    _createAccount: function () {
      var email = this.$('.email').val();
      var password = this.$('.password').val();
      var customizeSync = this.$('.customize-sync').is(':checked');

      var self = this;
      var client = new FxaClient();
      client.signUp(email, password, { customizeSync: customizeSync })
        .then(function (accountData) {
          // this means a user successfully signed in with an already
          // existing account and should be sent on their merry way.
          if (accountData.verified) {
            self.navigate('settings');
          } else {
            self.navigate('confirm');
          }
        })
        .then(null, function (err) {
          // account already exists, and the user
          // entered a bad password they should sign in insted.
          if (AuthErrors.is(err, 'INCORRECT_PASSWORD')) {
            Session.set('prefillEmail', email);
            var msg = t('Account already exists. <a href="/signin">Sign in</a>');
            return self.displayErrorUnsafe(msg);
          } else if (AuthErrors.is(err, 'USER_CANCELED_LOGIN')) {
            // if user canceled login, just stop
            return;
          }
          self.displayError(err);
        });
    }

  });

  _.extend(View.prototype, PasswordMixin);

  return View;
});
