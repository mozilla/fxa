/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
/**
 * Apollo-Server plugin for Sentry
 *
 * Modeled after:
 *   https://blog.sentry.io/2020/07/22/handling-graphql-errors-using-sentry
 *
 * This makes the following assumptions about the Apollo Server setup:
 *   1. The request object to Apollo's context as `.req`.
 *   2. `SentryPlugin` is passed in the `plugins` option.
 */
import { ApolloError } from 'apollo-server';

import { ExtraContext, reportRequestException } from './reporting';

export const SentryPlugin = {
  requestDidStart(requestContext: any) {
    return {
      didEncounterErrors(ctx: any) {
        // If we couldn't parse the operation, don't
        // do anything here
        if (!ctx.operation) {
          return;
        }
        for (const err of ctx.errors) {
          // Only report internal server errors,
          // all errors extending ApolloError should be user-facing
          if (err instanceof ApolloError) {
            continue;
          }
          // Skip errors with a status already set or already reported
          if (err.originalError?.status) {
            continue;
          }
          const excContexts: ExtraContext[] = [];
          if (err.path.join) {
            excContexts.push({
              name: 'graphql',
              fieldData: {
                path: err.path!.join(' > '),
              },
            });
          }
          reportRequestException(
            err.originalError ?? err,
            excContexts,
            ctx.context.req
          );
        }
      },
    };
  },
};
