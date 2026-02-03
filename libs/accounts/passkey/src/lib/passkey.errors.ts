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
   * @param info - Structured data for logging and debugging
   * @param info.errno - Error number from libs/accounts/errors/src/constants.ts ERRNO object
   * @param info.uid - User ID (when applicable)
   * @param info.credentialId - WebAuthn credential ID (when applicable)
   * @param info.* - Additional context fields. Never include sensitive data (passwords, keys).
   * @param cause - Optional underlying error that caused this error
   *
   * The resulting error object contains:
   * @property {string} name - Always 'PasskeyError' for base class
   * @property {Error} [cause] - The underlying error if provided
   * @property {object} info - The structured info object with errno and context
   */
  constructor(message: string, info: Record<string, any>, cause?: Error) {
    super(message, {
      name: 'PasskeyError',
      cause,
      info,
    });
  }
}
