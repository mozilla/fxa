/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Do some validation.

define(function (require, exports, module) {
  'use strict';

  var _ = require('underscore');
  var Constants = require('lib/constants');

  // taken from the fxa-auth-server
  var HEX_STRING = /^(?:[a-fA-F0-9]{2})+$/;

  // URL RegEx taken from http://blog.mattheworiordan.com/post/13174566389/url-regular-expression-for-links-with-or-without
  // jscs:disable maximumLineLength
  var urlRegEx = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;
  // jscs:enable maximumLineLength

  // URN Regex
  var urnRegEx = /^urn:[a-zA-Z0-9][a-zA-Z0-9-]{1,31}:([a-zA-Z0-9()+,.:=@;$_!*'-]|%[0-9A-Fa-f]{2})+$/;

  var self = {
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
    },

    /**
     * Check whether data matches schema, depth-first.
     * Compares using Object.prototype.toString. Prefix
     * schema types with `?` to indicate optional.
     *
     * e.g.:
     *   Validate.isDataValid(
     *     { foo: 'bar', baz: { qux: [] } },
     *     { foo: 'String', baz: { qux: 'Array', optional: '?String' } }
     *   ); // returns true
     *
     *   Validate.isDataValid(
     *     { foo: 'bar', baz: { qux: [] } },
     *     { foo: 'String', baz: { qux: 'Array', required: 'String' } }
     *   ); // returns false
     */
    isDataValid: function isDataValid(data, schema) {
      if (! schema) {
        return false;
      }

      if (_.isString(schema)) {
        if (schema[0] === '?') {
          if (_.isNull(data) || _.isUndefined(data)) {
            return true;
          }

          schema = schema.substr(1);
        }

        return Object.prototype.toString.call(data) === '[object ' + schema + ']';
      }

      if (! data) {
        return false;
      }

      return _.all(_.keys(data), function (key) {
        return isDataValid(data[key], schema[key]);
      });
    },

    /**
     * Check whether the `prompt` OAuth value is valid
     *
     * @param {string} prompt
     * @returns {boolean}
     */
    isPromptValid: function (prompt) {
      var valid = [
        Constants.OAUTH_PROMPT_CONSENT
      ];

      return _.contains(valid, prompt);
    },

    /**
     * Check whether string is a url. Validates url with or
     * without http(s) and trailing slash.
     *
     * http://blog.mattheworiordan.com/post/13174566389/url-regular-expression-for-links-with-or-without
     *
     * @param url  - url to check
     * @returns {boolean}
     */
    isUrlValid: function isUrlValid(url) {
      return urlRegEx.test(url);
    },

    /**
     * Check if string is valid urn per RFC 2141.
     *
     * @param urn - urn to check
     * @returns {boolean}
     */
    isUrnValid: function isUrnValid(urn) {
      return urnRegEx.test(urn);
    },

    /**
     * Check if string is valid uri.
     *
     * @param uri - uri to check
     * @returns {boolean}
     */
    isUriValid: function isUriValid(uri) {
      return self.isUrlValid(uri) || self.isUrnValid(uri);
    },

    /**
     * Check if string is valid access type, either "online" or "offline".
     *
     * @param accessType
     * @returns {boolean}
     */
    isAccessTypeValid: function isAccessTypeValid(accessType) {
      var valid = [
        Constants.ACCESS_TYPE_OFFLINE,
        Constants.ACCESS_TYPE_ONLINE
      ];
      return _.contains(valid, accessType);
    },

    /**
     * Checks if value is composed of only hex characters.
     *
     * @param value
     * @returns {boolean}
     */
    isHexValid: function isHexValid(value) {
      return HEX_STRING.test(value);
    },

    /**
     * Check if the verification redirect value is valid
     *
     * @param value
     * @returns {boolean}
     */
    isVerificationRedirectValid: function isVerificationRedirectValid(value) {
      var valid = [
        Constants.VERIFICATION_REDIRECT_ALWAYS,
        Constants.VERIFICATION_REDIRECT_NO
      ];

      return _.contains(valid, value);
    }
  };

  module.exports = self;
});
