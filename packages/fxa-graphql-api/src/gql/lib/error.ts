/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { GraphQLError } from 'graphql';

export class ThrottledError extends GraphQLError {}

export const PROFILE_INFO_URL =
  'https://github.com/mozilla/fxa/blob/main/packages/fxa-profile-server/docs/API.md#errors';

export function CatchGatewayError(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;
  descriptor.value = async function (...args: any[]) {
    try {
      return await originalMethod.apply(this, args);
    } catch (err) {
      if (
        err.code &&
        err.errno &&
        err.message &&
        err.retryAfter &&
        err.retryAfterLocalized
      ) {
        // Auth Server error when throttled (too many requests error)
        throw new ThrottledError(err.message, {
          extensions: {
            code: err.code,
            errno: err.errno,
            info: err.info,
            retryAfter: err.retryAfter,
            retryAfterLocalized: err.retryAfterLocalized,
          },
        });
      } else if (err.code && err.errno && err.message) {
        // Auth Server error (general)
        throw new GraphQLError(err.message, {
          extensions: {
            code: err.code,
            errno: err.errno,
            info: err.info,
            // Important, used for 'Incorrect email case' error
            email: err.email,
          },
        });
      } else if (err.status && err.stack && err.response) {
        // Profile Server error
        throw new GraphQLError(err.message, {
          extensions: {
            status: err.status,
            errno: err.response.body?.errno,
            info: PROFILE_INFO_URL,
          },
        });
      } else {
        throw err;
      }
    }
  };
  return descriptor;
}
