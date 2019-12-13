/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Hapi from '@hapi/hapi';
import Hoek from '@hapi/hoek';
import * as Sentry from '@sentry/node';
import { SQS } from 'aws-sdk';
import { Consumer } from 'sqs-consumer';
import { PassThrough } from 'stream';

// Matches uid, session, oauth and other common tokens which we would
// prefer not to include in Sentry reports.
const TOKENREGEX = /[a-fA-F0-9]{32,}/gi;
// RFC 5322 generalized email regex, ~ 99.99% accurate.
const EMAILREGEX = /(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/gi;
const FILTERED = '[Filtered]';
const URIENCODEDFILTERED = encodeURIComponent(FILTERED);

interface HapiSentryRequest extends Hapi.Request {
  sentryScope?: Sentry.Scope;
}

/**
 * Filters all of an objects string properties to remove tokens.
 *
 * @param obj Object to filter values on
 */
function filterObject(obj: object) {
  if (typeof obj === 'object' && obj) {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        // Typescript can't quite infer that this is the value that was
        // at that index, so a cast is needed.
        (obj as any)[key] = value.replace(TOKENREGEX, FILTERED).replace(EMAILREGEX, FILTERED);
      }
    }
  }
  return obj;
}

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
  if (event.breadcrumbs) {
    for (const bc of event.breadcrumbs) {
      if (bc.message) {
        bc.message = bc.message.replace(TOKENREGEX, FILTERED);
      }
      if (bc.data) {
        bc.data = filterObject(bc.data);
      }
    }
  }
  if (event.request) {
    if (event.request.url) {
      event.request.url = event.request.url.replace(TOKENREGEX, FILTERED);
    }
    if (event.request.query_string) {
      event.request.query_string = event.request.query_string.replace(
        TOKENREGEX,
        URIENCODEDFILTERED
      );
    }
    if (event.request.headers) {
      (event as any).request.headers = filterObject(event.request.headers);
    }
    if (event.request.data) {
      // Remove request data entirely
      delete event.request.data;
    }
  }
  if (event.tags && event.tags.url) {
    event.tags.url = event.tags.url.replace(TOKENREGEX, FILTERED);
  }
  return event;
}

/**
 * Capture a SQS Error to Sentry with additional context.
 *
 * @param err Error object to capture.
 * @param message SQS Message to include with error.
 */
function captureSqsError(err: Error, message?: SQS.Message) {
  Sentry.withScope(scope => {
    if (message?.Body) {
      if (typeof message.Body === 'string') {
        message.Body = message.Body.replace(TOKENREGEX, FILTERED).replace(EMAILREGEX, FILTERED);
      }
      scope.setContext('SQS Message', message);
    }
    Sentry.captureException(err);
  });
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
    }
  });
}

/**
 * Configure Sentry to capture SQS Consumer errors.
 *
 * @param consumer SQS Consumer to capture errors on.
 */
export function configureSqsSentry(consumer: Consumer) {
  consumer.on('error', (err, message) => {
    captureSqsError(err, message);
  });

  consumer.on('processing_error', (err, message) => {
    captureSqsError(err, message);
  });
}

/**
 * Configure Sentry to capture Hapi errors and include additional context.
 *
 * @param server Hapi Server to capture errors for.
 */
export function configureHapiSentry(server: Hapi.Server) {
  // Attach a new Sentry scope to the request for breadcrumbs/tags/extras
  server.ext({
    type: 'onRequest',
    method(request: HapiSentryRequest, h) {
      request.sentryScope = new Sentry.Scope();
      return h.continue;
    }
  });

  // Sentry handler for hapi errors
  server.events.on({ name: 'request', channels: 'error' }, (request: HapiSentryRequest, event) => {
    const err = event?.error as Error | undefined;
    let exception = '';
    if (err?.stack) {
      try {
        exception = err.stack.split('\n')[0];
      } catch (e) {
        // ignore bad stack frames
      }
    }

    Sentry.withScope(scope => {
      scope.addEventProcessor(scopedSentryEvent => {
        const sentryEvent = Sentry.Handlers.parseRequest(scopedSentryEvent, request.raw.req);
        sentryEvent.level = Sentry.Severity.Error;
        return sentryEvent;
      });
      scope.setExtra('exception', exception);

      // Merge the request scope into the temp scope
      if (request.sentryScope) {
        Hoek.merge(scope, request.sentryScope);
      }
      Sentry.captureException(err);
    });
  });
}
