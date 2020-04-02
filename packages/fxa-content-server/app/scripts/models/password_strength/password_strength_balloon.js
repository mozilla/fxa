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
import { assign, find } from 'underscore';
import AuthErrors from '../../lib/auth-errors';
import { Model } from 'backbone';
import { PASSWORD_MIN_LENGTH } from '../../lib/constants';
import { normalizeEmail } from '../../../../../fxa-shared/email/helpers';

const BANNED_SERVICE_NAMES = [
  'addons',
  'firefox',
  'fxaccount',
  'firefox account',
  'firefoxaccount',
  'fxsync',
  'firefox sync',
  'firefoxsync',
  'lockbox',
  'fxlockbox',
  'mozilla',
  'sumo',
  'sync',
  // These need to be sorted by length so that the largest match
  // is found first in isPasswordMostlyCommonService
].sort((a, b) => b.length - a.length);

const BANNED_URL_REGEXP = /^(?:firefox|mozilla)\.(?:com|org)$/;

export default class PasswordStrengthBalloonModel extends Model {
  constructor(attrs = {}, config = {}) {
    const attrsWithDefaults = assign(
      {
        email: '',
        hasUserTakenAction: false,
        isVisible: false,
        // The null default is so a `change:password` event fires if
        // the user submits the form with an empty password.
        password: null,
      },
      attrs
    );
    super(attrsWithDefaults, config);

    this.on('change:password', () => this.set('hasUserTakenAction', true));
    // Force a validity check every time the password is updated.
    this.on('change:password', () => this.isValid());
  }

  _getCommonPasswordList() {
    return import(
      /* webpackChunkName: "fxa-common-password-list" */ 'fxa-common-password-list'
    );
  }

  fetch() {
    return this._getCommonPasswordList().then(commonPasswordList => {
      this.commonPasswordList = commonPasswordList;
    });
  }

  isSameAsEmail(lowercasePassword) {
    const email = normalizeEmail(this.get('email'));
    return (
      this.doesPasswordContainFullEmail(lowercasePassword, email) ||
      this.isPasswordSubstringOfEmail(lowercasePassword, email) ||
      this.isPasswordMostlyLocalPartOfEmail(lowercasePassword, email)
    );
  }

  doesPasswordContainFullEmail(lowercasePassword, email) {
    return lowercasePassword.indexOf(email) !== -1;
  }

  isPasswordSubstringOfEmail(lowercasePassword, email) {
    return email.indexOf(lowercasePassword) !== -1;
  }

  isPasswordMostlyLocalPartOfEmail(lowercasePassword, email) {
    const [localPartOfEmail] = email.split('@');
    // if the local part comprises >= half of the password, banned.
    return this.isPasswordMostlyWord(lowercasePassword, localPartOfEmail);
  }

  isPasswordMostlyWord(lowercasePassword, word) {
    return (
      word.length * 2 >= lowercasePassword.length &&
      lowercasePassword.indexOf(word) !== -1
    );
  }

  isPasswordMostlyCommonServiceName(lowercasePassword) {
    const matchingService = find(BANNED_SERVICE_NAMES, serviceName => {
      return lowercasePassword.indexOf(serviceName) !== -1;
    });

    if (matchingService) {
      return this.isPasswordMostlyWord(lowercasePassword, matchingService);
    }
  }

  isCommon(commonPasswordList, lowercasePassword) {
    // The password list only stores lowercase words
    // Consider common Firefox related services and URLs as banned.
    return (
      commonPasswordList.test(lowercasePassword) ||
      this.isPasswordMostlyCommonServiceName(lowercasePassword) ||
      BANNED_URL_REGEXP.test(lowercasePassword)
    );
  }

  validate(attrs = {}) {
    // If the user has taken no action and there is no password,
    // the data is not considered invalid.
    if (!attrs.hasUserTakenAction && !attrs.password) {
      return;
    }

    // The password list only stores lowercase words,
    // use the lowercase password for comparison everywhere.
    const lowercasePassword = (attrs.password || '').toLowerCase();

    if (!lowercasePassword) {
      return AuthErrors.toError('PASSWORD_REQUIRED');
    } else if (lowercasePassword.length < PASSWORD_MIN_LENGTH) {
      return AuthErrors.toError('PASSWORD_TOO_SHORT');
    } else if (this.isSameAsEmail(lowercasePassword)) {
      return AuthErrors.toError('PASSWORD_SAME_AS_EMAIL');
    } else if (this.isCommon(this.commonPasswordList, lowercasePassword)) {
      return AuthErrors.toError('PASSWORD_TOO_COMMON');
    }
  }
}
