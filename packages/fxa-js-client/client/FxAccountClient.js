/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
define(['./lib/request', '../components/sjcl/sjcl', './lib/credentials'], function (Request, sjcl, credentials) {
  'use strict';

  /**
   * @class FxAccountClient
   * @constructor
   * @param {String} uri Auth Server URI
   * @param {Object} config Configuration
   */
  function FxAccountClient(uri, config) {
    if (typeof uri !== 'string') {
      config = uri || {};
      uri = config.uri;
    }
    if (typeof config === "undefined") {
      config = {};
    }

    this.request = new Request(uri, config.xhr);
  }

  /**
   * @method signUp
   * @param {String} email Email input
   * @param {String} password Password input
   * @return {Promise} A promise that will be fulfilled with `result` of an XHR request
   */
  FxAccountClient.prototype.signUp = function (email, password) {
    var self = this;

    return credentials.setup(email, password)
      .then(
        function (result) {
          var data = {
            email: result.emailUTF8,
            authPW: sjcl.codec.hex.fromBits(result.authPW)
          };

          return self.request.send("/account/create", "POST", null, data);
        }
      );
  };

  /**
   * @method signIn
   * @param {String} email Email input
   * @param {String} password Password input
   * @return {Promise} A promise that will be fulfilled with `result` of an XHR request
   */
  FxAccountClient.prototype.signIn = function (email, password) {
    var self = this;

    return credentials.setup(email, password)
      .then(
        function (result) {
          var data = {
            email: result.emailUTF8,
            authPW: sjcl.codec.hex.fromBits(result.authPW)
          };

          return self.request.send("/account/login", "POST", null, data);
        }
      );
  };

  /**
   * @method verifyCode
   * @param {String} uid Account ID
   * @param {String} code Verification code
   * @return {Promise} A promise that will be fulfilled with `result` of an XHR request
   */
  FxAccountClient.prototype.verifyCode = function(uid, code) {
    return this.request.send("/recovery_email/verify_code", "POST", null, {
      uid: uid,
      code: code
    });
  };

  return FxAccountClient;
});


