/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { RewriteFrames } from '@sentry/integrations';
import * as Sentry from '@sentry/node';
import { GraphQLError } from 'graphql';
import path from 'path';

// Matches uid, session, oauth and other common tokens which we would
// prefer not to include in Sentry reports.
const TOKENREGEX = /[a-fA-F0-9]{32,}/gi;
const FILTERED = '[Filtered]';

/**
 * Filter a sentry event for PII in addition to the default filters.
 *
 * Current replacements:
 *   - A 32-char hex string that typically is a FxA user-id.
 *
 * Data Removed:
 *   - Request body.
 *
 * @param event
 */
function filterSentryEvent(event: Sentry.Event, hint: unknown) {
  if (event.message) {
    event.message = event.message.replace(TOKENREGEX, FILTERED);
  }
  return event;
}

/**
 * Configure Sentry with additional Sentry event filtering.
 *
 * @param options Sentry options to include.
 */
export function configureSentry(options?: Sentry.NodeOptions) {
  Sentry.init({
    ...options,
    beforeSend(event, hint) {
      return filterSentryEvent(event, hint);
    },
    integrations: [
      new RewriteFrames({
        root: path.dirname(path.dirname(__dirname)),
      }),
    ],
  });
}

/**
 * Report a GraphQL error to Sentry if in production mode, otherwise log it out.
 *
 * @param debug Debug mode or not
 * @param error
 */
export function reportGraphQLError(error: GraphQLError) {
  const graphPath = error.path?.join('.');
  Sentry.withScope((scope) => {
    scope.setContext('graphql', {
      path: graphPath,
    });
    Sentry.captureException(error.originalError);
  });
}
