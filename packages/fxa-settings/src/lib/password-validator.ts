/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

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
  'mozilla account',
  'mozillaaccount',
  'sumo',
  'sync',
  // These need to be sorted by length so that the largest match
  // is found first in isPasswordMostlyCommonService
].sort((a, b) => b.length - a.length);

const BANNED_URL_REGEXP = /^(?:firefox|mozilla)\.(?:com|org)$/;

export default class PasswordValidator {
  readonly email: string;

  constructor(email: string) {
    this.email = email;
  }

  isSameAsEmail(password: string) {
    return (
      this.doesPasswordContainFullEmail(password) ||
      this.isPasswordSubstringOfEmail(password) ||
      this.isPasswordMostlyLocalPartOfEmail(password)
    );
  }

  isBanned(password: string) {
    return (
      this.isPasswordMostlyCommonServiceName(password) ||
      BANNED_URL_REGEXP.test(password)
    );
  }

  private doesPasswordContainFullEmail(password: string) {
    return password.indexOf(this.email) !== -1;
  }

  private isPasswordSubstringOfEmail(password: string) {
    return this.email.indexOf(password) !== -1;
  }

  private isPasswordMostlyLocalPartOfEmail(password: string) {
    const [localPartOfEmail] = this.email.split('@');
    // if the local part comprises >= half of the password, banned.
    return this.isPasswordMostlyWord(password, localPartOfEmail);
  }

  private isPasswordMostlyWord(password: string, word: string) {
    return word.length * 2 >= password.length && password.indexOf(word) !== -1;
  }

  private isPasswordMostlyCommonServiceName(password: string) {
    const matchingService = BANNED_SERVICE_NAMES.find((serviceName) => {
      return password.indexOf(serviceName) !== -1;
    });

    if (matchingService) {
      return this.isPasswordMostlyWord(password, matchingService);
    }
    return false;
  }
}
