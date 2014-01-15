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
      'submit form': 'requestPasswordReset'
    },

    requestPasswordReset: function (event) {
      event.preventDefault();

      if (! this._validateEmail()) {
        return;
      }

      var email = this._getEmail();

      var client = new FxaClient();
      client.requestPasswordReset(email)
            .done(this._onRequestResetSuccess.bind(this),
                  this._onRequestResetFailure.bind(this));

    },

    _onRequestResetSuccess: function () {
      Session.email = this._getEmail();
      router.navigate('confirm_reset_password', { trigger: true });
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
