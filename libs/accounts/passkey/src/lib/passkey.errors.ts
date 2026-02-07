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
  readonly errno: number;
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
   * @param info - Structured data for logging and debugging
   * @param info.errno - Error number from libs/accounts/errors/src/constants.ts ERRNO object
   * @param info.uid - User ID (when applicable)
   * @param info.credentialId - WebAuthn credential ID (when applicable)
   * @param info.* - Additional context fields. Never include sensitive data (passwords, keys).
   * @param cause - Optional underlying error that caused this error
   */
  constructor(
    message: string,
    info: { errno: number; uid?: string; credentialId?: string } & Record<
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

    // Store common fields as direct properties for easy access
    this.errno = info.errno;
    this.uid = info.uid;
    this.credentialId = info.credentialId;

    // Store all info for logging (still available via VError.info too)
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
 * Thrown when a passkey has invalid format or data.
 * HTTP equivalent: AppError.passkeyInvalid() - 400 Bad Request, errno 225
 */
export class PasskeyInvalidError extends PasskeyError {
  constructor(info: { uid?: string; credentialId?: string }, cause?: Error) {
    super('Invalid passkey', { errno: ERRNO.PASSKEY_INVALID, ...info }, cause);
  }
}

/**
 * Thrown when attempting to register a passkey that already exists.
 * HTTP equivalent: AppError.passkeyAlreadyRegistered() - 409 Conflict, errno 226
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
 * HTTP equivalent: AppError.passkeyLimitReached() - 400 Bad Request, errno 227
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
 * Thrown when a passkey credential is invalid or malformed.
 * HTTP equivalent: AppError.passkeyCredentialInvalid() - 401 Unauthorized, errno 228
 */
export class PasskeyCredentialInvalidError extends PasskeyError {
  constructor(info: { uid?: string; credentialId?: string }, cause?: Error) {
    super(
      'Invalid passkey credential',
      { errno: ERRNO.PASSKEY_CREDENTIAL_INVALID, ...info },
      cause
    );
  }
}

/**
 * Thrown when passkey authentication fails.
 * HTTP equivalent: AppError.passkeyAuthenticationFailed() - 401 Unauthorized, errno 229
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
 * HTTP equivalent: AppError.passkeyRegistrationFailed() - 500 Internal Server Error, errno 230
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
 * Thrown when passkey verification fails.
 * HTTP equivalent: AppError.passkeyVerificationFailed() - 401 Unauthorized, errno 231
 */
export class PasskeyVerificationFailedError extends PasskeyError {
  constructor(info: { uid?: string; credentialId?: string }, cause?: Error) {
    super(
      'Passkey verification failed',
      { errno: ERRNO.PASSKEY_VERIFICATION_FAILED, ...info },
      cause
    );
  }
}

/**
 * Thrown when an unsupported algorithm is requested.
 * HTTP equivalent: AppError.passkeyUnsupportedAlgorithm() - 400 Bad Request, errno 232
 */
export class PasskeyUnsupportedAlgorithmError extends PasskeyError {
  constructor(info: { algorithm?: string; uid?: string }, cause?: Error) {
    super(
      'Unsupported passkey algorithm',
      { errno: ERRNO.PASSKEY_UNSUPPORTED_ALGORITHM, ...info },
      cause
    );
  }
}

/**
 * Thrown when a passkey challenge has expired.
 * HTTP equivalent: AppError.passkeyChallengeExpired() - 401 Unauthorized, errno 233
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
