/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Sentry from '@sentry/nextjs';
import { Inject } from '@nestjs/common';
import { ILogger } from '@fxa/shared/log';
import { LOGGER_PROVIDER } from '@fxa/shared/log';
import { GENERIC_ERROR_MESSAGE } from './error';

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
            throw handleException({
              error,
              className: this.constructor.name,
              methodName: propertyKey,
              allowlist,
              logger: this.logger,
            });
          }
        }
      : function (this: any, ...args: any[]) {
          try {
            return originalMethod.apply(this, args);
          } catch (error) {
            throw handleException({
              error,
              className: this.constructor.name,
              methodName: propertyKey,
              allowlist,
              logger: this.logger,
            });
          }
        };

    return descriptor;
  };
}

function handleException(args: {
  error: unknown;
  className: string;
  methodName: string;
  allowlist: Constructor<Error>[];
  logger: ILogger;
}): Error {
  const { error, className, methodName, allowlist, logger } = args;

  logger.error(
    `Error caught by SanitizeExceptions decorator in ${className}.${methodName}`,
    error
  );

  const isAllowedError =
    error instanceof Error &&
    allowlist.some((ErrorClass) => {
      const isInstance = error instanceof ErrorClass;
      return isInstance;
    });

  if (isAllowedError) {
    return error;
  }

  Sentry.captureException(error, {
    extra: {
      sanitizedIn: {
        className,
        methodName,
      },
    },
  });

  return new Error(GENERIC_ERROR_MESSAGE);
}
