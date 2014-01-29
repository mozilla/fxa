/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'views/base',
  'stache!templates/delete_account',
  'lib/session',
  'lib/fxa-client',
  'lib/password-mixin',
  'lib/url'
],
function (_, BaseView, Template, Session, FxaClient, PasswordMixin, Url) {
  var View = BaseView.extend({
    // user must be authenticated to delete their account
    mustAuth: true,

    template: Template,
    className: 'delete-account',

    events: {
      'click #back': 'back',
      'keyup #back': 'backOnEnter',
      'submit form': 'deleteAccount',
      'keyup input': 'enableButtonWhenValid',
      'change input': 'enableButtonWhenValid',
      'change .show-password': 'onPasswordVisibilityChange'
    },

    context: function () {
      return {
        isSync: Url.searchParam('service') === 'sync'
      };
    },

    deleteAccount: function (event) {
      if (event) {
        event.preventDefault();
      }

      if (! (this.isValid())) {
        return;
      }

      var email = this.$('.email').val();
      var password = this.$('.password').val();

      var client = new FxaClient();
      var self = this;
      client.deleteAccount(email, password)
            .then(function () {
              self.navigate('signup');
            })
            .done(null, function (err) {
              self.displayError(err.message);
            });
    },

    isValid: function () {
      return this._validateEmail() && this._validatePassword();
    },

    _validateEmail: function () {
      return this.isElementValid('.email');
    },

    _validatePassword: function () {
      return this.isElementValid('.password');
    }
  });

  _.extend(View.prototype, PasswordMixin);

  return View;
});

