/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseError } from '@fxa/shared/error';
import { ERRNO } from '@fxa/accounts/errors';

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
  /** Error number from ERRNO constants */
  readonly errno?: number;
  /** User ID (when applicable) */
  readonly uid?: string;
  /** WebAuthn credential ID (when applicable) */
  readonly credentialId?: string;
  /** Additional structured context */
  readonly context: Record<string, any>;

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
  constructor(
    message: string,
    info: { errno?: number; uid?: string; credentialId?: string } & Record<
      string,
      any
    >,
    cause?: Error
  ) {
    super(message, {
      name: 'PasskeyError',
      cause,
      info: {
        ...info,
        errno: String(info.errno), // Convert to string for VError logging
      },
    });

    this.errno = info.errno;
    this.uid = info.uid;
    this.credentialId = info.credentialId;
    this.context = info;
  }
}

/**
 * Thrown when a passkey is not found for the given user or credential ID.
 * HTTP equivalent: AppError.passkeyNotFound() - 404 Not Found, errno 224
 */
export class PasskeyNotFoundError extends PasskeyError {
  constructor(info: { uid?: string; credentialId?: string }, cause?: Error) {
    super(
      'Passkey not found',
      { errno: ERRNO.PASSKEY_NOT_FOUND, ...info },
      cause
    );
  }
}

/**
 * Thrown when attempting to register a passkey that already exists.
 * HTTP equivalent: AppError.passkeyAlreadyRegistered() - 409 Conflict, errno 225
 */
export class PasskeyAlreadyRegisteredError extends PasskeyError {
  constructor(info: { uid?: string; credentialId?: string }, cause?: Error) {
    super(
      'Passkey already registered',
      { errno: ERRNO.PASSKEY_ALREADY_REGISTERED, ...info },
      cause
    );
  }
}

/**
 * Thrown when a user has reached the maximum number of passkeys allowed.
 * HTTP equivalent: AppError.passkeyLimitReached() - 400 Bad Request, errno 226
 */
export class PasskeyLimitReachedError extends PasskeyError {
  constructor(info: { uid?: string; limit?: number }, cause?: Error) {
    super(
      'Maximum number of passkeys reached',
      { errno: ERRNO.PASSKEY_LIMIT_REACHED, ...info },
      cause
    );
  }
}

/**
 * Thrown when passkey authentication fails.
 * HTTP equivalent: AppError.passkeyAuthenticationFailed() - 401 Unauthorized, errno 227
 */
export class PasskeyAuthenticationFailedError extends PasskeyError {
  constructor(info: { uid?: string; credentialId?: string }, cause?: Error) {
    super(
      'Passkey authentication failed',
      { errno: ERRNO.PASSKEY_AUTHENTICATION_FAILED, ...info },
      cause
    );
  }
}

/**
 * Thrown when passkey registration fails on the server side.
 * HTTP equivalent: AppError.passkeyRegistrationFailed() - 500 Internal Server Error, errno 228
 */
export class PasskeyRegistrationFailedError extends PasskeyError {
  constructor(info: { uid?: string; reason?: string }, cause?: Error) {
    super(
      'Passkey registration failed',
      { errno: ERRNO.PASSKEY_REGISTRATION_FAILED, ...info },
      cause
    );
  }
}

/**
 * Thrown when a passkey challenge has expired.
 * HTTP equivalent: AppError.passkeyChallengeExpired() - 401 Unauthorized, errno 238
 */
export class PasskeyChallengeExpiredError extends PasskeyError {
  constructor(info: { uid?: string; challengeId?: string }, cause?: Error) {
    super(
      'Passkey challenge expired',
      { errno: ERRNO.PASSKEY_CHALLENGE_EXPIRED, ...info },
      cause
    );
  }
}
