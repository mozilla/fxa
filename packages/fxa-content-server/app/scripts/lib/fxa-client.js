/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// a very light wrapper around gherkin to reduce boilerplate code.

'use strict';

define([
  'gherkin',
  'processed/constants'
],
function (Gherkin, Constants) {
  function FxaClient() {
    this.client = new Gherkin(Constants.FXA_ACCOUNT_SERVER);
  }

  FxaClient.prototype = {
    signIn: function (email, password) {
      return this.client.signIn(email, password);
    },

    signUp: function (email, password) {
      return this.client
                 .signUp(email, password)
                 .then(function () {
                    // when a user signs up, sign them in immediately
                    return this.signIn(email, password);
                  }.bind(this));
    }
  };

  return FxaClient;
});

