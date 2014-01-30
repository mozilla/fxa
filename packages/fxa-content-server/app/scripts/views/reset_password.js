/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'views/base',
  'stache!templates/reset_password',
  'lib/fxa-client',
  'lib/session'
],
function (_, BaseView, Template, FxaClient, Session) {
  var View = BaseView.extend({
    template: Template,
    className: 'reset_password',

    events: {
      'submit form': 'requestPasswordReset',
      'keyup input': 'enableButtonWhenValid',
      'change input': 'enableButtonWhenValid'
    },

    context: function () {
      return {
        // forceAuth is used to determine which secondary links to show
        // If set to true, only a back link is displayed. If false, create
        // account and sign in links are displayed.
        forceAuth: Session.forceAuth
      };
    },

    requestPasswordReset: function (event) {
      event.preventDefault();

      if (! this.isValid()) {
        return;
      }

      var email = this._getEmail();

      var client = new FxaClient();
      client.passwordReset(email)
            .done(this._onRequestResetSuccess.bind(this),
                  this._onRequestResetFailure.bind(this));

    },

    isValid: function () {
      return this._validateEmail();
    },

    _onRequestResetSuccess: function () {
      this.navigate('confirm_reset_password');
    },

    _onRequestResetFailure: function (err) {
      this.displayError(err.message);
    },

    _getEmail: function () {
      return this.$('.email').val();
    },

    _validateEmail: function () {
      return this.isElementValid('.email');
    }
  });

  return View;
});
