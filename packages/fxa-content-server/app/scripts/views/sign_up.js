/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'views/base',
  'stache!templates/sign_up',
  'lib/session',
  'lib/fxa-client'
],
function (_, BaseView, SignUpTemplate, Session, FxaClient) {
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

  var SignUpView = BaseView.extend({
    initialize: function (options) {
      options = options || {};
      this.router = options.router || window.router;
    },

    beforeRender: function () {
      if (document.cookie.indexOf('tooyoung') > -1) {
        this.router.navigate('cannot_create_account', { trigger: true });
        return false;
      }

      return true;
    },

    template: SignUpTemplate,
    className: 'sign-up',

    events: {
      'submit form': 'onSubmit',
      'keyup form': 'enableButtonWhenValid',
      'change form': 'enableButtonWhenValid'
    },

    onSubmit: function (event) {
      event.preventDefault();
      this.signUp();
    },

    signUp: function () {
      if (! (this.isValid())) {
        return;
      }

      if (! this._isUserOldEnough()) {
        return this._cannotCreateAccount();
      }

      this._createAccount();
    },

    isValid: function () {
      return !! (this._validateEmail() &&
                  this._validatePassword() &&
                  this._validateYear());
    },

    _validateEmail: function () {
      return this.isElementValid('.email');
    },

    _validatePassword: function () {
      return this.isElementValid('.password');
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

      this.router.navigate('cannot_create_account', { trigger: true });
    },

    _createAccount: function () {
      var email = this.$('.email').val();
      var password = this.$('.password').val();

      var client = new FxaClient();
      client.signUp(email, password)
        .done(_.bind(function (accountData) {
          // This info will be sent to the channel in the confirm screen.
          Session.sessionToken = accountData.sessionToken;
          Session.keyFetchToken = accountData.keyFetchToken;
          Session.unwrapBKey = accountData.unwrapBKey;
          Session.uid = accountData.uid;

          this.router.navigate('confirm', { trigger: true });
        }, this),
        _.bind(function (err) {
          this.$('.spinner').hide();
          this.$('.error').html(err.message);

          console.error('Error?', err);
        }, this));
    }

  });

  return SignUpView;
});
