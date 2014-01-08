/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// a very light wrapper around the real FxaClient to reduce boilerplate code
// and to allow us to develop to features that are not yet present in the real
// client.

'use strict';

define([
  'fxaClient',
  'processed/constants'
],
function (FxaClient, Constants) {
  // placeholder promise to stand in for FxaClient functionality that is
  // not yet ready.
  function PromiseMock() {
  }
  PromiseMock.prototype = {
    then: function (callback) {
      var promise = new PromiseMock();
      if (callback) {
        callback();
      }
      return promise;
    },
    done: function (callback) {
      if (callback) {
        callback();
      }
    }
  };

  function FxaClientWrapper() {
    this.client = new FxaClient(Constants.FXA_ACCOUNT_SERVER);
  }

  FxaClientWrapper.prototype = {
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
    },

    verifyCode: function (uid, code) {
      return this.client.verifyCode(uid, code);
    },

    requestPasswordReset: function () {
      return new PromiseMock();
    },

    completePasswordReset: function () {
      return new PromiseMock();
    }
  };

  return FxaClientWrapper;
});

