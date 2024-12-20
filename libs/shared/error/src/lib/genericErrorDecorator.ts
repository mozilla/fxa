/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Sentry from '@sentry/nextjs';

type Constructor<T> = new (...args: any[]) => T;

/**
 * A decorator that wraps all methods in error handling. Errors are reported to Sentry, and sanitized before propagation.
 * @param allow An optional list of error classes that should be passed to the client unaltered. Set to `{ allow: [Error] }` to pass all error types.
 */
export function GenericError(
  {
    allow,
  }: {
    allow: Constructor<Error>[];
  } = { allow: [] }
) {
  return function <T extends Constructor<any>>(target: T) {
    const propertyNames = Object.getOwnPropertyNames(target.prototype);
    for (const propertyName of propertyNames) {
      const originalMethod = target.prototype[propertyName];

      // Ignore class attributes other than methods
      if (
        propertyName === 'constructor' ||
        typeof originalMethod !== 'function'
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
                console.error(error);
                Sentry.withScope((scope) => {
                  if (
                    error instanceof Error &&
                    allow.some((ErrorClass) => error instanceof ErrorClass)
                  ) {
                    scope.setExtra('sanitizedBeforeSend', false);
                    Sentry.captureException(error);
                    throw error;
                  } else {
                    scope.setExtra('sanitizedBeforeSend', true);
                    Sentry.captureException(error);
                    throw new Error('Something went wrong');
                  }
                });
              }
            }
          : // process synchronous throws
            function (this: InstanceType<T>, ...args: any[]) {
              try {
                return originalMethod.apply(this, args);
              } catch (error) {
                console.error(error);
                Sentry.withScope((scope) => {
                  if (
                    error instanceof Error &&
                    allow.some((ErrorClass) => error instanceof ErrorClass)
                  ) {
                    scope.setExtra('sanitizedBeforeSend', false);
                    Sentry.captureException(error);
                    throw error;
                  } else {
                    scope.setExtra('sanitizedBeforeSend', true);
                    Sentry.captureException(error);
                    throw new Error('Something went wrong');
                  }
                });
              }
            };
    }

    return target;
  };
}
