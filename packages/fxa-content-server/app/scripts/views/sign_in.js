/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'views/base',
  'hgn!templates/sign_in',
  'gherkin',
  'lib/session',
  'constants'
],
function(BaseView, SignInTemplate, gherkin, Session, Constants) {
  var SignInView = BaseView.extend({
    template: SignInTemplate,
    className: 'sign-in',

    events: {
      'submit form': 'signIn'
    },

    signIn: function(event) {
      event.preventDefault();

      if (! (this._validateEmail() && this._validatePassword())) {
        return;
      }

      var email = this.$('.email').val();
      var password = this.$('.password').val();

      gherkin.Client.login(Constants.FXA_ACCOUNT_SERVER, email, password)
        .then(function (client) {
          Session.email = email;
          Session.token = client.sessionToken;

          router.navigate('settings', { trigger: true });
        })
        .done(null, function (err) {
          this.$('.error').html(err.message);

          console.error('Error?', err);
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

  return SignInView;
});

