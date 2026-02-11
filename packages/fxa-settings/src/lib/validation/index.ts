/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  isEmail,
  isURL,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

/**
 * This validator attempts to be backwards compatible with a pre-existing rule in
 * fxa-content-server. Reference validate.js, isUrlValid.
 */
@ValidatorConstraint({ name: 'IsFxaRedirectToUrl', async: false })
export class IsFxaRedirectToUrl implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    if (text.startsWith('/')) {
      // We probably have a relative path. Fabricate a url, and make sure it parses
      try {
        new URL('https://accounts.firefox.com' + text);
        return true;
      } catch (error) {
        return false;
      }
    }
    return isURL(text, { require_tld: false });
  }

  defaultMessage(args: ValidationArguments) {
    return '($value) is not a valid FxA redirect uri';
  }
}

/**
 * We have some special constraints around redirect URIs. Specifically we want to allow to
 * an RP to redirect to a pair-auth-webchannel.
 */
@ValidatorConstraint({ name: 'IsFxaRedirectUri', async: false })
export class IsFxaRedirectUri implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    if (text === 'urn:ietf:wg:oauth:2.0:oob:pair-auth-webchannel') {
      return true;
    }
    return isURL(text, { require_tld: false });
  }

  defaultMessage(args: ValidationArguments) {
    return '($value) is not a valid FxA redirect uri';
  }
}

@ValidatorConstraint({ name: 'isEmailOrEmpty', async: false })
export class IsEmailOrEmpty implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (value === '' || value === undefined) {
      return true;
    }
    return isEmail(value, { require_tld: false });
  }

  defaultMessage(args: ValidationArguments) {
    return 'loginHint must be a valid email, empty string, or undefined';
  }
}
