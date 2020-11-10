/** Application error helpers */

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
