/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExtraErrorData } from '@sentry/integrations';
import * as Sentry from '@sentry/node';
import { SQS } from 'aws-sdk';

import { AppConfig } from '../config';
import { version } from '../version';

// Matches uid, session, oauth and other common tokens which we would
// prefer not to include in Sentry reports.
const TOKENREGEX = /[a-fA-F0-9]{32,}/gi;
// RFC 5322 generalized email regex, ~ 99.99% accurate.
const EMAILREGEX = /(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/gi;
const FILTERED = '[Filtered]';
const URIENCODEDFILTERED = encodeURIComponent(FILTERED);

@Injectable()
export class SentryService {
  constructor(configService: ConfigService<AppConfig>) {
    const sentryDsn = configService.get<string>('sentryDsn');

    // Setup Sentry
    Sentry.init({
      dsn: sentryDsn,
      release: version.version,
      environment: configService.get('env'),
      integrations: [new ExtraErrorData()],
      beforeSend(event, hint) {
        return filterSentryEvent(event, hint);
      },
    });
  }
}

/**
 * Filters all of an objects string properties to remove tokens.
 *
 * @param obj Object to filter values on
 */
function filterObject<T>(obj: T): T {
  if (typeof obj === 'object' && obj) {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        // Typescript can't quite infer that this is the value that was
        // at that index, so a cast is needed.
        (obj as any)[key] = value
          .replace(TOKENREGEX, FILTERED)
          .replace(EMAILREGEX, FILTERED);
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
export function captureSqsError(err: Error, message?: SQS.Message): void {
  Sentry.withScope((scope) => {
    if (message?.Body) {
      if (typeof message.Body === 'string') {
        message.Body = message.Body.replace(TOKENREGEX, FILTERED).replace(
          EMAILREGEX,
          FILTERED
        );
      }
      scope.setContext('SQS Message', message);
    }
    Sentry.captureException(err);
  });
}
