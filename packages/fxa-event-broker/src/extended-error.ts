/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Extends basic Error with `cause` attribute used by Sentry for
 * linked error reporting.
 */
export class ExtendedError extends Error {
  public cause?: Error;

  static withCause(message: string, cause: Error) {
    const err = new ExtendedError(message);
    err.cause = cause;
    return err;
  }
}
