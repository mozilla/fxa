/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Sentry from '@sentry/nextjs';
import { logger } from '@fxa/shared/log';

type Constructor<T> = new (...args: any[]) => T;

/**
 * A decorator that wraps all methods in error handling. Errors are reported to Sentry, and sanitized before propagation.
 * @param allow An optional list of error classes that should be passed to the client unaltered. Set to `{ allow: [Error] }` to pass all error types.
 */
export function SanitizeExceptions(
  {
    allowlist,
  }: {
    allowlist: Constructor<Error>[];
  } = { allowlist: [] }
) {
  return function <T extends Constructor<any>>(target: T) {
    const propertyNames = Object.getOwnPropertyNames(target.prototype);
    for (const propertyName of propertyNames) {
      const originalMethod = target.prototype[propertyName];

      // Only wrap non-constructor class methods
      if (
        propertyName === 'constructor' ||
        typeof originalMethod !== 'function' ||
        !['AsyncFunction', 'Function'].includes(originalMethod.constructor.name)
      )
        continue;

      // Sanitize thrown errors
      target.prototype[propertyName] =
        originalMethod.constructor.name === 'AsyncFunction'
          ? // process asynchronous throws
            async function (this: InstanceType<T>, ...args: any[]) {
              try {
                return await originalMethod.apply(this, args);
              } catch (error) {
                logger.error(error);
                Sentry.withScope((scope) => {
                  if (
                    error instanceof Error &&
                    allowlist.some((ErrorClass) => error instanceof ErrorClass)
                  ) {
                    scope.setExtra('sanitizedBeforeSend', false);
                  } else {
                    scope.setExtra('sanitizedBeforeSend', true);
                    error = new Error('Something went wrong');
                  }
                  Sentry.captureException(error);
                  throw error;
                });
              }
            }
          : // process synchronous throws
            function (this: InstanceType<T>, ...args: any[]) {
              try {
                return originalMethod.apply(this, args);
              } catch (error) {
                logger.error(error);
                Sentry.withScope((scope) => {
                  if (
                    error instanceof Error &&
                    allowlist.some((ErrorClass) => error instanceof ErrorClass)
                  ) {
                    scope.setExtra('sanitizedBeforeSend', false);
                  } else {
                    scope.setExtra('sanitizedBeforeSend', true);
                    error = new Error('Something went wrong');
                  }
                  Sentry.captureException(error);
                  throw error;
                });
              }
            };
    }

    return target;
  };
}
