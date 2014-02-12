/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'views/form',
  'stache!templates/delete_account',
  'lib/session',
  'lib/fxa-client',
  'lib/password-mixin'
],
function (_, FormView, Template, Session, FxaClient, PasswordMixin) {
  var View = FormView.extend({
    // user must be authenticated to delete their account
    mustAuth: true,

    template: Template,
    className: 'delete-account',

    events: {
      'click #back': 'back',
      'keyup #back': 'backOnEnter',
      'change .show-password': 'onPasswordVisibilityChange'
    },

    context: function () {
      return {
        isSync: Session.service === 'sync'
      };
    },

    submit: function () {
      var email = this.$('.email').val();
      var password = this.$('.password').val();

      var client = new FxaClient();
      var self = this;
      client.deleteAccount(email, password)
            .then(function () {
              self.navigate('signup');
            })
            .done(null, function (err) {
              self.displayError(err.errno || err.message);
            });
    }
  });

  _.extend(View.prototype, PasswordMixin);

  return View;
});

