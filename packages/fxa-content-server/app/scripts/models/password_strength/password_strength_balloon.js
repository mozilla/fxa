/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Manage state needed to display the password strength balloon, aka, Design F
 *
 * @export
 * @class PasswordStrengthBalloonModel
 * @extends {Model}
 */
import { assign } from 'underscore';
import AuthErrors from '../../lib/auth-errors';
import { Model } from 'backbone';
import { PASSWORD_MIN_LENGTH } from '../../lib/constants';

// Ban passwords that start with firefox, fxaccounts, lockbox, addons, sumo
const BANNED_SERVICE_REGEXP = /^(firefox|fxaccounts|lockbox|addons|sumo).*$/;
const BANNED_URL_REGEXP = /^(?:firefox|mozilla)\.(?:com|org)$/;

export default class PasswordStrengthBalloonModel extends Model {
  constructor (attrs = {}, config = {}) {
    const attrsWithDefaults = assign({
      hasEnteredPassword: false,
      isCommon: false,
      isSameAsEmail: false,
      isTooShort: true,
      isValid: false,
    }, attrs);
    super(attrsWithDefaults, config);

    // Asynchronously load the common password list as soon as the model is created.
    this._getCommonPasswordList();
  }

  _getCommonPasswordList () {
    return import(/* webpackChunkName: "fxa-common-password-list" */ 'fxa-common-password-list');
  }

  /**
   * Calculate model values for `password`
   *
   * @param {String} password
   * @returns {Promise} resolves when complete
   */
  updateForPassword (password) {
    return this._getCommonPasswordList().then((commonPasswordList => {
      // The password list only stores lowercase words,
      // use the lowercase password for comparison everywhere.
      const lowercasePassword = password.toLowerCase();

      // each criterion can only be true if the previous criterion is `false`,
      // except hasEnteredPassword must be `true`.
      const hasEnteredPassword = !! (this.get('hasEnteredPassword') || lowercasePassword.length);
      const isTooShort = hasEnteredPassword && lowercasePassword.length < PASSWORD_MIN_LENGTH;
      const isSameAsEmail = ! isTooShort && this.isSameAsEmail(lowercasePassword);
      const isCommon = ! isSameAsEmail && this.isCommon(commonPasswordList, lowercasePassword);

      this.set({
        hasEnteredPassword,
        isCommon,
        isSameAsEmail,
        isTooShort,
      });

      const isValid = hasEnteredPassword && ! isTooShort && ! isSameAsEmail && ! isCommon;
      const previousIsValid = this.get('isValid');
      // isValid is for internal use and should not cause a `changed` event to be emit
      this.set({ isValid }, { silent: true });
      if (isValid && ! previousIsValid) {
        this.trigger('valid');
      } else if (! isValid && previousIsValid) {
        this.trigger('invalid');
      }
    }));
  }

  isSameAsEmail (lowercasePassword) {
    const email = this.get('email').toLowerCase();
    return this.doesPasswordContainFullEmail(lowercasePassword, email) ||
           this.isPasswordSubstringOfEmail(lowercasePassword, email) ||
           this.doesPasswordStartWithLocalPartOfEmail(lowercasePassword, email);
  }

  doesPasswordContainFullEmail (lowercasePassword, email) {
    return lowercasePassword.indexOf(email) !== -1;
  }

  isPasswordSubstringOfEmail (lowercasePassword, email) {
    return email.indexOf(lowercasePassword) !== -1;
  }

  doesPasswordStartWithLocalPartOfEmail (lowercasePassword, email) {
    const [localPartOfEmail] = email.split('@');
    // 4 is arbitrary, set a lower bound on the length of the local part
    // so passwords that start with `a` are not banned if the user's email
    // address is `a@domain.com`.
    return localPartOfEmail.length >= 4 && lowercasePassword.indexOf(localPartOfEmail) === 0;
  }

  isCommon (commonPasswordList, lowercasePassword) {
    // The password list only stores lowercase words
    // Consider common Firefox related services and URLs as banned.
    return commonPasswordList.test(lowercasePassword) ||
           BANNED_SERVICE_REGEXP.test(lowercasePassword) ||
           BANNED_URL_REGEXP.test(lowercasePassword);
  }

  validate () {
    if (! this.get('hasEnteredPassword')) {
      return AuthErrors.toError('PASSWORD_REQUIRED');
    } else if (this.get('isTooShort')) {
      return AuthErrors.toError('PASSWORD_TOO_SHORT');
    } else if (this.get('isSameAsEmail')) {
      return AuthErrors.toError('PASSWORD_SAME_AS_EMAIL');
    } else if (this.get('isCommon')) {
      return AuthErrors.toError('PASSWORD_TOO_COMMON');
    }
  }
}
