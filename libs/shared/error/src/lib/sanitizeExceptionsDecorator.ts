/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Sentry from '@sentry/nextjs';
import { Inject } from '@nestjs/common';
import { ILogger } from '@fxa/shared/log';
import { LOGGER_PROVIDER } from '@fxa/shared/log';

type Constructor<T> = new (...args: any[]) => T;

/**
 * A method decorator that provides error handling with Sentry reporting and error sanitization.
 * The logger is injected via NestJS DI.
 * @param allowlist An optional list of error classes that should be passed to the client unaltered
 * @returns PropertyDecorator
 */
export function SanitizeExceptions(
  { allowlist }: { allowlist: Constructor<Error>[] } = { allowlist: [] }
) {
  const injectLogger = Inject(LOGGER_PROVIDER);

  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    injectLogger(target, 'logger');

    const originalMethod = descriptor.value;
    const isAsync = originalMethod.constructor.name === 'AsyncFunction';

    descriptor.value = isAsync
      ? async function (this: any, ...args: any[]) {
          try {
            const result = await originalMethod.apply(this, args);
            return result;
          } catch (error) {
            throw handleException(error as Error, allowlist, this.logger);
          }
        }
      : function (this: any, ...args: any[]) {
          try {
            return originalMethod.apply(this, args);
          } catch (error) {
            throw handleException(error as Error, allowlist, this.logger);
          }
        };

    return descriptor;
  };
}

function handleException(
  error: Error,
  allowlist: Constructor<Error>[],
  logger: ILogger
): Error {
  logger.error('Error caught by SanitizeExceptions decorator', error);

  const isAllowedError =
    error instanceof Error &&
    allowlist.some((ErrorClass) => {
      const isInstance = error instanceof ErrorClass;
      return isInstance;
    });

  if (!isAllowedError) {
    return new Error('Something went wrong');
  } else {
    Sentry.withScope((scope) => {
      scope.setExtra('sanitizedBeforeSend', !isAllowedError);
      Sentry.captureException(error);
    });
    return error;
  }
}
