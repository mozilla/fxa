/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'views/base',
  'stache!templates/create_account',
  'lib/session',
  'processed/constants'
],
function (BaseView, CreateAccountTemplate, Session, Constants) {
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
      var client;

      require(['gherkin'], function (gherkin) {
        gherkin.Client.create(Constants.FXA_ACCOUNT_SERVER, email, password)
          .then(function (x) {
            client = x;

            return client.login();
          })
          .done(function () {
            Session.token = client.sessionToken;


            // email: email,
            // sessionToken: client.sessionToken,
            // keyFetchToken: client.keyFetchToken,
            // unwrapBKey: client.unwrapBKey

            router.navigate('confirm', { trigger: true });
          },
          function (err) {
            this.$('.error').html(err.message);

            console.error('Error?', err);
          }.bind(this));
      }.bind(this));
    }
  });

  return CreateAccountView;
});
