/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseError } from '@fxa/shared/error';

/**
 * Base error class for passkey-related errors.
 *
 * Subclasses should use descriptive names ending in "Error" and include
 * context (e.g., PasskeyNotFoundError, not NotFoundError).
 *
 * Error numbers (errno) must be defined in the central ERRNO object at
 * libs/accounts/errors/src/constants.ts and imported for use in error info.
 *
 * @see libs/accounts/recovery-phone/src/lib/recovery-phone.errors.ts
 */
export class PasskeyError extends BaseError {
  /**
   * Creates a PasskeyError.
   *
   * @param message - Human-readable error message
   * @param info - Structured data for logging and debugging (examples: { errno: 1001, uid: '1234' })
   * @param cause - Optional underlying error that caused this error
   *
   * The resulting error object contains:
   * @property {string} name - Always 'PasskeyError' for base class
   * @property {object} info - Structured info object that provides context for the error (e.g., errno, uid)
   * @property {Error} [cause] - The underlying error if provided
   */
  constructor(message: string, info: Record<string, any>, cause?: Error) {
    super(message, {
      name: 'PasskeyError',
      cause,
      info,
    });
  }
}
