/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Localized } from '@fluent/react';

export type ErrorType = 'general' | 'query-parameter-violation';

type AppErrorDialogProps = {
  errorType?: ErrorType;
  /** The caught error; its message shows under the details toggle. */
  error?: Error;
  /** Sentry event ID from captureException; search Sentry for id:<eventId>. */
  sentryEventId?: string;
};

const AppErrorDialog = ({
  errorType = 'general',
  error,
  sentryEventId,
}: AppErrorDialogProps) => {
  // Auth UI errors carry errno/code; include them since some share a message.
  const { errno, code } = (error ?? {}) as { errno?: number; code?: number };
  const errorDetails = [
    error?.message,
    errno != null && `errno: ${errno}`,
    code != null && `code: ${code}`,
  ]
    .filter(Boolean)
    .join('\n');

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-grey-20 dark:bg-grey-900">
      <section className="card text-center">
        {errorType === 'general' ? (
          <Localized id="app-something-went-wrong-heading">
            <h2
              className="card-header text-grey-900 dark:text-grey-100"
              data-testid="error-loading-app"
            >
              Something went wrong
            </h2>
          </Localized>
        ) : (
          <Localized id="app-query-parameter-err-heading">
            <h2
              className="card-header text-grey-900 dark:text-grey-100"
              data-testid="error-bad-query-parameters"
            >
              Bad Request: Invalid Query Parameters
            </h2>
          </Localized>
        )}

        {errorType === 'general' && (
          <Localized id="app-something-went-wrong-message">
            <p className="mt-3 text-sm text-grey-500 dark:text-grey-200">
              We’ve been notified of the issue. Refresh the page to try again.
            </p>
          </Localized>
        )}

        {sentryEventId && (
          <Localized id="app-error-id" vars={{ errorId: sentryEventId }}>
            <p className="mt-6 text-xs text-grey-400 dark:text-grey-300">
              {`Error ID: ${sentryEventId}`}
            </p>
          </Localized>
        )}

        {errorDetails && (
          <details className="mt-2">
            <Localized id="app-error-details-summary">
              <summary className="cursor-pointer text-xs text-grey-400 dark:text-grey-300">
                Error details
              </summary>
            </Localized>
            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words rounded bg-grey-10 dark:bg-grey-800 p-3 text-start text-xs text-grey-500 dark:text-grey-200">
              {errorDetails}
            </pre>
          </details>
        )}
      </section>
    </main>
  );
};

export default AppErrorDialog;
