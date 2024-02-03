/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { GraphQLError } from 'graphql';
import {
  AuthUiErrorNos,
  AuthUiErrors,
} from '../../lib/auth-errors/auth-errors';
import { HandledError } from '../../lib/interfaces';

export const handleGQLError = (error: any) => {
  const graphQLError: GraphQLError = error.graphQLErrors?.[0];
  const errno = graphQLError?.extensions?.errno as number;

  if (errno && AuthUiErrorNos[errno]) {
    if (errno === AuthUiErrors.THROTTLED.errno) {
      const throttledErrorWithRetryAfter = {
        message: AuthUiErrorNos[errno].message,
        errno,
        retryAfter:
          (graphQLError?.extensions?.retryAfter as number) || undefined,
        retryAfterLocalized:
          (graphQLError?.extensions?.retryAfterLocalized as string) ||
          undefined,
      };
      return { error: throttledErrorWithRetryAfter as HandledError };
    } else {
      return {
        error: {
          message: AuthUiErrorNos[errno].message,
          errno,
        } as HandledError,
      };
    }
    // if not a graphQLError or if no localizable message available for error
  } else return { error: AuthUiErrors.UNEXPECTED_ERROR as HandledError };
};
