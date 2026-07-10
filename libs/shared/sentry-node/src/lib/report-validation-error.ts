/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Sentry from '@sentry/node';
import { ValidationError } from 'joi';

/**
 * Report a validation error to Sentry with validation details.
 *
 * @param {Pick<Hub, 'withScope' | 'captureMessage'>} sentry - Current sentry instance. Note, that this subtype is being
 *    used instead of directly accessing the sentry instance inorder to be context agnostic.
 * @param {*} message
 * @param {string | ValidationError} ValidationError error
 */
export function reportValidationError(
  message: any,
  error: ValidationError | string
) {
  const details: any = {};
  if (typeof error === 'string') {
    details.error = error;
  } else {
    for (const errorItem of error.details || []) {
      const key = errorItem.path.join('.');
      details[key] = {
        message: errorItem.message,
        type: errorItem.type,
      };
    }
  }

  Sentry.withScope((scope) => {
    scope.setContext('validationError', details);
    Sentry.captureMessage(message, 'error');
  });
}
