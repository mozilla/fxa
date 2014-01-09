/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'views/base',
  'stache!templates/create_account',
  'lib/session',
  'lib/fxa-client'
],
function (BaseView, CreateAccountTemplate, Session, FxaClient) {
  var CreateAccountView = BaseView.extend({
    template: CreateAccountTemplate,
    className: 'create_account',

    context: function () {
      return {
        email: Session.email
      };
    },

    initialize: function () {
      this._createAccount(Session.email, Session.password);
    },

    _createAccount: function (email, password) {
      var client = new FxaClient();
      client.signUp(email, password)
        .done(function (result) {
          Session.token = result.sessionToken;
          Session.uid = result.uid;

          router.navigate('confirm', { trigger: true });
        },
        function (err) {
          this.$('.error').html(err.message);

          console.error('Error?', err);
        }.bind(this));
    }
  });

  return CreateAccountView;
});
