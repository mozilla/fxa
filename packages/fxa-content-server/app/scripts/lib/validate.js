/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Do some validation.

define(function (require, exports, module) {
  'use strict';

  var Constants = require('lib/constants');

  // taken from the fxa-auth-server
  var HEX_STRING = /^(?:[a-fA-F0-9]{2})+$/;

  module.exports = {
    /**
     * Check if an email address is valid
     *
     * @return true if email is valid, false otw.
     */
    isEmailValid: function (email) {
      if (typeof email !== 'string') {
        return false;
      }

      var parts = email.split('@');

      var localLength = parts[0] && parts[0].length;
      var domainLength = parts[1] && parts[1].length;

      // Original regexp from:
      //  http://blog.gerv.net/2011/05/html5_email_address_regexp/
      // Modified to remove the length checks, which are done later.
      // IETF spec: http://tools.ietf.org/html/rfc5321#section-4.5.3.1.1
      // NOTE: this does *NOT* allow internationalized domain names.
      return (/^[\w.!#$%&'*+\-\/=?\^`{|}~]+@[a-z\d][a-z\d\-]*(?:\.[a-z\d][a-z\d\-]*)*$/i).test(email) &&
             // total email allwed to be 256 bytes long
             email.length <= 256 &&
             // local side only allowed to be 64 bytes long
             1 <= localLength && localLength <= 64 &&
             // domain side allowed to be up to 255 bytes long which
             // doesn't make much sense unless the local side has 0 length;
             1 <= domainLength && domainLength <= 255;
    },

    /**
     * Check if an email verification code is valid
     */
    isCodeValid: function (code) {
      if (typeof code !== 'string') {
        return false;
      }

      // codes are fixed length hex strings.
      return code.length === Constants.CODE_LENGTH &&
             HEX_STRING.test(code);
    },

    /**
     * Check if an OAuth code is valid
     */
    isOAuthCodeValid: function (code) {
      if (typeof code !== 'string') {
        return false;
      }

      // codes are fixed length hex strings.
      return code.length === Constants.OAUTH_CODE_LENGTH &&
        HEX_STRING.test(code);
    },

    /**
     * Check if a verification token is valid
     */
    isTokenValid: function (token) {
      if (typeof token !== 'string') {
        return false;
      }

      // tokens are variable length hex strings.
      return HEX_STRING.test(token);
    },

    /**
     * Check if a verification uid is valid
     */
    isUidValid: function (uid) {
      if (typeof uid !== 'string') {
        return false;
      }

      // uids are fixed length hex strings.
      return uid.length === Constants.UID_LENGTH &&
             HEX_STRING.test(uid);
    },

    /**
     * Check if a password is valid
     */
    isPasswordValid: function (password) {
      if (typeof password !== 'string') {
        return false;
      }

      return password.length >= Constants.PASSWORD_MIN_LENGTH;
    }
  };
});


