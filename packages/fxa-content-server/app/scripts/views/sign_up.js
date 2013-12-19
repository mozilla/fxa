/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'views/base',
  'stache!templates/sign_up',
  'lib/session',
  'processed/constants'
],
function(BaseView, SignUpTemplate, Session, Constants) {
  var SignUpView = BaseView.extend({
    template: SignUpTemplate,
    className: 'sign-up',

    events: {
      'submit form': 'signUp'
    },

    signUp: function(event) {
      event.preventDefault();

      if (! (this._validateEmail() && this._validatePassword())) {
        return;
      }

      var email = this.$('.email').val();
      var password = this.$('.password').val();

      var client;


      require(['gherkin'], function(gherkin) {
        gherkin.Client.create(Constants.FXA_ACCOUNT_SERVER, email, password)
          .then(function (x) {
            client = x;

            return client.login();
          })
          .done(function () {
            Session.email = email;
            Session.token = client.sessionToken;

            router.navigate('confirm', { trigger: true });

            // email: email,
            // sessionToken: client.sessionToken,
            // keyFetchToken: client.keyFetchToken,
            // unwrapBKey: client.unwrapBKey

          },
          function (err) {
            this.$('.error').html(err.message);

            console.error('Error?', err);
          }.bind(this));
      }.bind(this));
    },

    _validateEmail: function() {
      return this._isElementValid('.email');
    },

    _validatePassword: function() {
      return this._isElementValid('.password');
    },

    _isElementValid: function(selector) {
      var el = this.$(selector);
      var value = el.val();
      return value && el[0].validity.valid;
    }
  });

  return SignUpView;
});
