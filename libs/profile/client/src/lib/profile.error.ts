/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseError } from '@fxa/shared/error';

/**
 * ProfileError is not intended for direct use, except for type-checking errors.
 * When throwing a new ProfileError, create a unique extension of the class.
 */
export class ProfileError extends BaseError {
  constructor(message: string, info: Record<string, any>, cause?: Error) {
    super(message, { info, cause });
    this.name = 'ProfileError';
  }
}

export class ProfileClientError extends ProfileError {
  constructor(cause: Error) {
    super('Profile Client Error', {}, cause);
    this.name = 'ProfileClientError';
  }
}

export class ProfileClientServiceFailureError extends ProfileError {
  constructor(serviceName: string, method: string, path: string, cause: Error) {
    super(
      'Profile Client service failure',
      {
        serviceName,
        method,
        path,
      },
      cause
    );
    this.name = 'ProfileClientServiceFailureError';
  }
}
