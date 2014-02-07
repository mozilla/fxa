/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'views/form',
  'stache!templates/reset_password',
  'lib/fxa-client',
  'lib/session'
],
function (_, FormView, Template, FxaClient, Session) {
  var View = FormView.extend({
    template: Template,
    className: 'reset_password',

    context: function () {
      return {
        // forceAuth is used to determine which secondary links to show
        // If set to true, only a back link is displayed. If false, create
        // account and sign in links are displayed.
        forceAuth: Session.forceAuth
      };
    },

    submit: function () {
      var email = this.$('.email').val();

      var client = new FxaClient();
      client.passwordReset(email)
            .done(this._onRequestResetSuccess.bind(this),
                  this._onRequestResetFailure.bind(this));

    },

    _onRequestResetSuccess: function () {
      this.navigate('confirm_reset_password');
    },

    _onRequestResetFailure: function (err) {
      this.displayError(err.errno || err.message);
    }
  });

  return View;
});
