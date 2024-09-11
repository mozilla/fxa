/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Hoek from '@hapi/hoek';
import Sentry from '@sentry/node';
import verror from 'verror';
import { ignoreErrors } from './error';
export {
  formatMetadataValidationErrorMessage,
  reportValidationError,
} from 'fxa-shared/sentry/report-validation-error';
// Matches uid, session, oauth and other common tokens which we would
// prefer not to include in Sentry reports.
const TOKENREGEX = /[a-fA-F0-9]{32,}/gi;
const FILTERED = '[Filtered]';

export function reportSentryError(err, request) {
  let exception = '';
  if (err && err.stack) {
    try {
      exception = err.stack.split('\n')[0];
    } catch (e) {
      // ignore bad stack frames
    }
  }

  if (ignoreErrors(err)) {
    return;
  }

  Sentry.withScope((scope) => {
    if (request) {
      scope.addEventProcessor((_sentryEvent) => {
        const sentryEvent = Sentry.Handlers.parseRequest(
          _sentryEvent,
          request.raw.req
        );
        sentryEvent.level = 'error';
        return sentryEvent;
      });
    }

    // Important! Set a flag so that we know this is an error captured
    // and reported by our code. Once we added tracing, we started seeing errors
    // propagate in other ways. By setting a breakpoint or adding a console.trace
    // in beforeSend, we can see that Sentry's internal libraries are picking up
    // and reporting errors too. This causes problems because:
    //  - It means errors are double captured
    //  - It means that extra error info added below won't be there are errors
    //    where captured by this function.
    //  - It means the duplicate error might have a different shape, and fool
    //    our ignoreErrors() check.
    //
    // See the filterSentryEvent function to see how this flag is used.
    //
    scope.setExtra('report', true);
    scope.setExtra('exception', exception);
    // If additional data was added to the error, extract it.
    if (err.output && typeof err.output.payload === 'object') {
      const payload = err.output.payload;
      if (typeof payload.data === 'object') {
        scope.setContext('payload.data', payload.data);
        delete payload.data;
      }
      scope.setContext('payload', payload);
    }
    const cause = verror.cause(err);
    if (cause && cause.message) {
      const causeContext = {
        errorName: cause.name,
        reason: cause.reason,
        errorMessage: cause.message,
      };

      // Poolee EndpointError's have a few other things and oddly don't include
      // a stack at all. We try and extract a bit more to reflect what actually
      // happened as 'socket hang up' is somewhat inaccurate when the remote server
      // throws a 500.
      const output = cause.output;
      if (output && output.payload) {
        for (const key of ['error', 'message', 'statusCode']) {
          causeContext[key] = output.payload[key];
        }
      }
      const attempt = cause.attempt;
      if (attempt) {
        causeContext.method = attempt.method;
        causeContext.path = attempt.path
          ? attempt.path.replace(TOKENREGEX, FILTERED)
          : null;
      }
      scope.setContext('cause', causeContext);
    }

    if (request) {
      // Merge the request scope into the temp scope
      Hoek.merge(scope, request.sentryScope);
    }
    Sentry.captureException(err);
  });
}

export async function configureSentry(
  server,
  config,
  processName = 'key_server'
) {
  if (config.sentry.dsn) {
    Sentry.configureScope((scope) => {
      scope.setTag('process', processName);
    });

    if (!server) {
      return;
    }

    // Attach a new Sentry scope to the request for breadcrumbs/tags/extras
    server.ext({
      type: 'onRequest',
      method(request, h) {
        request.sentryScope = new Sentry.Scope();

        // Make a transaction per request so we can get performance monitoring. There are
        // some limitations to this approach, and distributed tracing will be off due to
        // hapi's architecture.
        //
        // See https://github.com/getsentry/sentry-javascript/issues/2172 for more into. It
        // looks like there might be some other solutions that are more complex, but would work
        // with hapi and distributed tracing.
        //
        const transaction = Sentry.startTransaction(
          {
            op: 'auth-server',
            name: `${request.method.toUpperCase()} ${request.path}`,
          },
          {
            request: Sentry.Handlers.extractRequestData(request.raw.req),
          }
        );

        Sentry.configureScope((scope) => {
          scope.setSpan(transaction);
        });

        request.app.sentry = {
          transaction,
        };

        return h.continue;
      },
    });

    server.events.on('request', (request, event, tags) => {
      if (event?.error && tags?.handler && tags?.error) {
        reportSentryError(event.error, request);
      }
    });
  }
}
