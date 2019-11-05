/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Do some validation.

import _ from 'underscore';
import Constants from './constants';
import Newsletters from './newsletters';
import OAuthPrompt from './oauth-prompt';

const UNBLOCK_CODE_LENGTH = Constants.UNBLOCK_CODE_LENGTH;

// taken from the fxa-auth-server
const HEX_STRING = /^(?:[a-fA-F0-9]{2})+$/;
// taken from the fxa-oauth-server
const B64URL_STRING = /^[A-Za-z0-9-_]+$/;

// Crockford base32 Regex. Excludes I, L, O, U
const B32_STRING = /^[0-9A-HJ-NP-TV-Z]+$/;

// URL RegEx taken from http://blog.mattheworiordan.com/post/13174566389/url-regular-expression-for-links-with-or-without
const urlRegEx = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/; //eslint-disable-line max-len

// Matches a UUID, e.g.: 12345678-1234-1234-1234-1234567890ab
const uuidRegEx = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// case insensitive match of an unblock code, e.g.: AB12YU7Z
const unblockCodeRegExpStr = `^[a-z0-9]{${UNBLOCK_CODE_LENGTH}}$`;
const unblockCodeRegExp = new RegExp(unblockCodeRegExpStr, 'i');

// Email regex, accepts punycoded addresses. See:
//   * http://blog.gerv.net/2011/05/html5_email_address_regexp/
// Modifications:
//   * Use case-insensitive regex, delete explicit `A-Z` ranges
//   * Replace `0-9` ranges with `\d`
//   * Replace `a-z` range and `_` in local part with `\w`
//   * Replace `+` in local part with {1,64}
//   * Replace final domain part `*` with `+`, to enforce at least one period
//     in the domain (https://github.com/mozilla/fxa-content-server/issues/2199)
// IETF spec:
//   * http://tools.ietf.org/html/rfc5321#section-4.5.3.1.1
// '/' in the character class is (redundantly) backslash-escaped to produce
// the same minimized form in node 4.x and node 0.10.
const emailRegex = /^[\w.!#$%&'*+\/=?^`{|}~-]{1,64}@[a-z\d](?:[a-z\d-]{0,253}[a-z\d])?(?:\.[a-z\d](?:[a-z\d-]{0,253}[a-z\d])?)+$/i;

// TOTP codes are 6 digits
const TOTP_CODE = /^[0-9]{6}$/;
// Recovery codes can be 8-10 alpha numeric characters
const RECOVERY_CODE = /^([a-zA-Z0-9]{8,10})$/;

var Validate = {
  /**
   * Check if an email address is valid
   * @param {String} email
   * @return {Boolean} true if email is valid, false otw.
   */
  isEmailValid(email) {
    if (typeof email !== 'string' || email.length > 256) {
      return false;
    }

    // At this point, we could punycode the email and pass it to
    // the regex, thus validating unicode addresses. However, doing
    // that would break Firefox versions 45 and lower, because of
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1243594. So, in
    // order to support unicode email addresses in the future, we'll
    // have to pass the punycoded address in all our dealings with
    // the browser and the non-punycoded address in our dealings with
    // the auth server. :-/

    return emailRegex.test(email);
  },

  /**
   * Check if an email verification code is valid
   *
   * @param {String} code
   * @returns {Boolean}
   */
  isCodeValid(code) {
    if (typeof code !== 'string') {
      return false;
    }

    // codes are fixed length hex strings.
    return code.length === Constants.CODE_LENGTH && HEX_STRING.test(code);
  },

  /**
   * Check if an OAuth code is valid
   *
   * @param {String} code
   * @returns {Boolean}
   */
  isOAuthCodeValid(code) {
    if (typeof code !== 'string') {
      return false;
    }

    // codes are fixed length hex strings.
    return code.length === Constants.OAUTH_CODE_LENGTH && HEX_STRING.test(code);
  },

  /**
   * Check if a verification token is valid
   * @param {String} token
   * @returns {Boolean}
   */
  isTokenValid(token) {
    if (typeof token !== 'string') {
      return false;
    }

    // tokens are variable length hex strings.
    return HEX_STRING.test(token);
  },

  /**
   * Check if a verification uid is valid
   * @param {String} uid
   * @returns {Boolean}
   */
  isUidValid(uid) {
    if (typeof uid !== 'string') {
      return false;
    }

    // uids are fixed length hex strings.
    return uid.length === Constants.UID_LENGTH && HEX_STRING.test(uid);
  },

  /**
   * Check if a password is valid
   * @param {String} password
   * @returns {Boolean}
   */
  isPasswordValid(password) {
    if (typeof password !== 'string') {
      return false;
    }

    return password.length >= Constants.PASSWORD_MIN_LENGTH;
  },

  /**
   * Check whether the `prompt` OAuth value is valid
   *
   * @param {String} prompt
   * @returns {Boolean}
   */
  isPromptValid(prompt) {
    const valid = [OAuthPrompt.CONSENT, OAuthPrompt.NONE];

    return _.contains(valid, prompt);
  },

  /**
   * Check whether string is a url. Validates url with or
   * without http(s) and trailing slash.
   *
   * http://blog.mattheworiordan.com/post/13174566389/url-regular-expression-for-links-with-or-without
   *
   * @param {String} url - url to check
   * @returns {Boolean}
   */
  isUrlValid: function isUrlValid(url) {
    return urlRegEx.test(url);
  },

  /**
   * Check if string is valid UUID.
   *
   * @param {String} uuid - uuid to check
   * @returns {Boolean}
   */
  isUuidValid(uuid) {
    return uuidRegEx.test(uuid);
  },

  /**
   * Check if string is valid access type, either "online" or "offline".
   *
   * @param {String} accessType
   * @returns {Boolean}
   */
  isAccessTypeValid: function isAccessTypeValid(accessType) {
    var valid = [Constants.ACCESS_TYPE_OFFLINE, Constants.ACCESS_TYPE_ONLINE];
    return _.contains(valid, accessType);
  },

  /**
   * Checks if value is composed of only hex characters.
   *
   * @param {String} value
   * @returns {Boolean}
   */
  isHexValid: function isHexValid(value) {
    return HEX_STRING.test(value);
  },

  /**
   * Checks if value is composed of only base32 characters.
   *
   * @param {String} value
   * @returns {Boolean}
   */
  isBase32Valid: function isBase32Valid(value) {
    return B32_STRING.test(value);
  },

  /**
   * Check if an unblock code is valid
   *
   * @param {String} value
   * @returns {Boolean}
   */
  isUnblockCodeValid(value) {
    return unblockCodeRegExp.test(value);
  },

  /**
   * Check if an TOTP code is valid
   *
   * @param {String} value
   * @returns {Boolean}
   */
  isTotpCodeValid(value) {
    return TOTP_CODE.test(value);
  },

  /**
   * Check if an recovery code is valid
   *
   * @param {String} value
   * @returns {Boolean}
   */
  isRecoveryCodeValid(value) {
    return RECOVERY_CODE.test(value);
  },

  /**
   * Check if given value is a Base64URL string
   *
   * Ref: https://tools.ietf.org/html/rfc4648#section-5
   * @param {String} value
   * @returns {Boolean}
   */
  isBase64Url(value) {
    return B64URL_STRING.test(value);
  },

  /**
   * Check whether `newsletters` contains only valid newsletter slugs.
   *
   * @param {String[]} newsletters
   * @returns {Boolean}
   */
  isNewslettersArrayValid(newsletters) {
    if (! Array.isArray(newsletters)) {
      return false;
    }

    // This function is called very rarely, generating the list
    // on demand should be fine.
    const validSlugs = _.values(Newsletters).map(newsletter => newsletter.slug);

    const areAllValid = newsletters.reduce((areAllValid, value) => {
      return areAllValid && validSlugs.indexOf(value) > -1;
    }, true);

    return areAllValid;
  },
};

export default Validate;
