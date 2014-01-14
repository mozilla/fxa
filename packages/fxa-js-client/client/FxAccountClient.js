/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
define(['./lib/request', '../components/sjcl/sjcl', './lib/credentials', './lib/hawkCredentials'], function (Request, sjcl, credentials, hawkCredentials) {
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
   * @param {Object} [options={}] Options
   *   @param {Boolean} [options.keys]
   *   If `true`, calls the API with `?keys=true` to get the keyFetchToken
   * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
   */
  FxAccountClient.prototype.signIn = function (email, password, options) {
    var self = this;


    return credentials.setup(email, password)
      .then(
        function (result) {
          var endpoint = "/account/login";
          var keys = options && options.keys === true;

          var data = {
            email: result.emailUTF8,
            authPW: sjcl.codec.hex.fromBits(result.authPW)
          };

          if (keys) {
            endpoint += '?keys=true';
          }

          return self.request.send(endpoint, "POST", null, data)
          .then(function(accountData) {
            if (keys) {
              accountData.unwrapBKey = result.unwrapBKey;
            }
            return accountData;
          });
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

  /**
   * @method recoveryEmailStatus
   * @param {String} sessionToken sessionToken obtained from signIn
   * @return {Promise} A promise that will be fulfilled with `result` of an XHR request
   */
  FxAccountClient.prototype.recoveryEmailStatus = function(sessionToken) {
    var self = this;
    return hawkCredentials(sessionToken, "sessionToken",  2 * 32)
      .then(function(creds) {
        return self.request.send("/recovery_email/status", "GET", creds);
      });
  };

  /**
   * Used to ask the server to send a recovery code.
   * The API returns passwordForgotToken to the client.
   *
   * @method passwordForgotSendCode
   * @param {String} email
   * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
   */
  FxAccountClient.prototype.passwordForgotSendCode = function(email) {
    return this.request.send('/password/forgot/send_code', 'POST', null, {
      email: email
    });
  };

  /**
   * Re-sends a verification code to the account's recovery email address.
   * HAWK-authenticated with the passwordForgotToken.
   *
   * @method passwordForgotResendCode
   * @param {String} email
   * @param {String} passwordForgotToken
   * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
   */
  FxAccountClient.prototype.passwordForgotResendCode = function(email, passwordForgotToken) {
    var self = this;

    return hawkCredentials(passwordForgotToken, "passwordForgotToken",  2 * 32)
      .then(function(creds) {
        return self.request.send('/password/forgot/resend_code', 'POST', creds, {
          email: email
        });
      });
  };

  /**
   * Submits the verification token to the server.
   * The API returns accountResetToken to the client.
   * HAWK-authenticated with the passwordForgotToken.
   *
   * @method passwordForgotVerifyCode
   * @param {String} code
   * @param {String} passwordForgotToken
   * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
   */
  FxAccountClient.prototype.passwordForgotVerifyCode = function(code, passwordForgotToken) {
    var self = this;

    return hawkCredentials(passwordForgotToken, "passwordForgotToken",  2 * 32)
      .then(function(creds) {
        return self.request.send('/password/forgot/verify_code', 'POST', creds, {
          code: code
        });
      });
  };

  /**
   * The API returns reset result to the client.
   * HAWK-authenticated with accountResetToken
   *
   * @method accountReset
   * @param {String} email
   * @param {String} newPassword
   * @param {String} accountResetToken
   * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
   */
  FxAccountClient.prototype.accountReset = function(email, newPassword, accountResetToken) {
    var self = this;
    var authPW;

    return credentials.setup(email, newPassword)
      .then(
        function (result) {
          authPW = sjcl.codec.hex.fromBits(result.authPW);

          return hawkCredentials(accountResetToken, 'accountResetToken',  2 * 32);
        }
      ).then(
        function (creds) {
          return self.request.send('/account/reset', 'POST', creds, {
            authPW: authPW
          });
        }
      );
  };

  /**
   * Get the base16 bundle of encrypted kA|wrapKb.
   *
   * @method accountKeys
   * @param {String} keyFetchToken
   * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
   */
  FxAccountClient.prototype.accountKeys = function(keyFetchToken) {
    var self = this;

    return hawkCredentials(keyFetchToken, "keyFetchToken",  2 * 32)
      .then(function(creds) {
        return self.request.send('/account/keys', 'POST', creds);
      });
  };


  return FxAccountClient;
});


