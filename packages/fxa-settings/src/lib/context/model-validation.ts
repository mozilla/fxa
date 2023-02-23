/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// TODO: Figure out how to port Vat. Here's a simplistic implementation for POC.

import { isEmailValid } from 'fxa-shared/email/helpers';
import { Constants } from '../constants';

/**
 * Dedicated error class for validation errors that occur when binding contextual values.
 */
export class ContextValidationError extends Error {
  constructor(
    public readonly key: string,
    public readonly value: any,
    public readonly message: string
  ) {
    super(message);
  }

  toString() {
    return `[key=${this.key}] [value=${this.value}] - ${this.message} `;
  }
}

export class ContextValidationErrors extends Error {
  constructor(
    public readonly message: string,
    public readonly errors: ContextValidationError[]
  ) {
    super(message);
  }
}

/** Validations */
export const ContextValidation = {
  isRequired: (k: string, v: any) => {
    if (v == null) {
      throw new ContextValidationError(k, v, 'Must exist!');
    }
    return v;
  },
  isString: (k: string, v: any) => {
    if (v == null) {
      return v;
    }
    if (typeof v !== 'string') {
      throw new ContextValidationError(k, v, 'Is not string');
    }
    return v;
  },
  isHex: (k: string, v: any) => {
    if (v == null) {
      return v;
    }
    if (typeof v !== 'string' || !/^(?:[a-fA-F0-9]{2})+$/.test(v)) {
      throw new ContextValidationError(k, v, 'Is not a hex string');
    }
    return v;
  },
  isBoolean: (k: string, v: any) => {
    if (v == null) {
      return v;
    }

    if (typeof v === 'boolean') {
      return v;
    }
    if (typeof v === 'string') {
      v = v.toLocaleLowerCase().trim();
    }
    if (v === 'true') {
      return true;
    }
    if (v === 'false') {
      return false;
    }
    throw new ContextValidationError(k, v, 'Is not boolean');
  },
  isNumber: (k: string, v: any) => {
    if (v == null) {
      return v;
    }

    const n = parseFloat(v);
    if (isNaN(n)) {
      throw new ContextValidationError(k, v, 'Is not a number');
    }
    return n;
  },

  isClientId: (k: string, v: any) => {
    // TODO: Add validation
    return ContextValidation.isString(k, v);
  },

  isAccessType: (k: string, v: any) => {
    // TODO: Add validation
    return ContextValidation.isString(k, v);
  },

  isCodeChallenge: (k: string, v: any) => {
    // TODO: Add validation
    return ContextValidation.isString(k, v);
  },

  isCodeChallengeMethod: (k: string, v: any) => {
    // TODO: Add validation
    return ContextValidation.isString(k, v);
  },

  isPrompt: (k: string, v: any) => {
    // TODO: Add validation
    return ContextValidation.isString(k, v);
  },

  isUrl: (k: string, v: any) => {
    // TODO: Add validation
    return ContextValidation.isString(k, v);
  },

  isUri: (k: string, v: any) => {
    // TODO: Add validation
    return ContextValidation.isString(k, v);
  },

  isNonEmptyString: (k: string, v: any) => {
    v = ContextValidation.isString(k, v);
    if ((v || '').length === 0) {
      throw new ContextValidationError(k, v, 'Cannot be an empty string');
    }
    return v;
  },

  isVerificationCode: (k:string, v:any) => {
    // TODO: Add validation
    return ContextValidation.isString(k,v);
  },

  isAction: (k: string, v: any) => {
    // TODO: Add validation
    return ContextValidation.isString(k, v);
  },

  isKeysJwk: (k: string, v: any) => {
    // TODO: Add validation
    return ContextValidation.isString(k, v);
  },

  isIdToken: (k: string, v: any) => {
    // TODO: Add validation
    return ContextValidation.isString(k, v);
  },

  isEmail: (k: string, v: any) => {
    // TODO: Add validation
    v = ContextValidation.isString(k,v);
    if (!isEmailValid(v)) {
      throw new ContextValidationError(k, v, 'Is not a valid email');
    }
    return v;
  },

  isGreaterThanZero: (k: string, v: any) => {
    // TODO: Add validation
    v = ContextValidation.isNumber(k, v);
    if (v < 0) {
      throw new ContextValidationError(k, v, 'Is not a positive number');
    }
    return v;
  },

  isPairingAuthorityRedirectUri: (k: string, v: any) => {
    if ((v || '') !== Constants.DEVICE_PAIRING_AUTHORITY_REDIRECT_URI) {
      throw new ContextValidationError(
        k,
        v,
        'Is not a DEVICE_PAIRING_AUTHORITY_REDIRECT_URI'
      );
    }
    return v;
  },

  isChannelId: (k: string, v: any) => {
    // TODO: Add validation
    return ContextValidation.isString(k, v);
  },

  isChannelKey: (k: string, v: any) => {
    // TODO: Add validation
    return ContextValidation.isString(k, v);
  },

  isValidCountry: (k: string, v: any) => {
    // TODO: Add validation
    return ContextValidation.isString(k, v);
  },
};
