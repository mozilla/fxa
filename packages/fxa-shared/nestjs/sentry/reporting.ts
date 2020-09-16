/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { ExecutionContext } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import * as Sentry from '@sentry/node';
import { SQS } from 'aws-sdk';
import { Request } from 'express';

// Matches uid, session, oauth and other common tokens which we would
// prefer not to include in Sentry reports.
const TOKENREGEX = /[a-fA-F0-9]{32,}/gi;
// RFC 5322 generalized email regex, ~ 99.99% accurate.
const EMAILREGEX = /(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/gi;
const FILTERED = '[Filtered]';
const URIENCODEDFILTERED = encodeURIComponent(FILTERED);

export interface ExtraContext {
  name: string;
  fieldData: Record<string, string>;
}

/**
 * Filters all of an objects string properties to remove tokens.
 *
 * @param obj Object to filter values on
 */
export function filterObject<T>(obj: T): T {
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
export function filterSentryEvent(event: Sentry.Event, hint: unknown) {
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

/**
 * Report an exception with request and additional optional context objects.
 *
 * @param exception
 * @param excContexts List of additional exception context objects to capture.
 * @param request A request object if available.
 */
export function reportRequestException(
  exception: Error,
  excContexts: ExtraContext[] = [],
  request?: Request
) {
  Sentry.withScope((scope: Sentry.Scope) => {
    scope.addEventProcessor((event: Sentry.Event) => {
      if (request) {
        const sentryEvent = Sentry.Handlers.parseRequest(event, request);
        sentryEvent.level = Sentry.Severity.Error;
        return sentryEvent;
      }
      return null;
    });
    for (const ctx of excContexts) {
      scope.setContext(ctx.name, ctx.fieldData);
    }
    Sentry.captureException(exception);
  });
}

export function processException(context: ExecutionContext, exception: Error) {
  // First determine what type of a request this is
  let requestType: 'http' | 'graphql' | undefined;
  let request: Request | undefined;
  let gqlExec: GqlExecutionContext | undefined;
  if (context.getType() === 'http') {
    requestType = 'http';
    request = context.switchToHttp().getRequest();
  } else if (context.getType<GqlContextType>() === 'graphql') {
    requestType = 'graphql';
    gqlExec = GqlExecutionContext.create(context);
    request = gqlExec.getContext().req;
  }
  let excContexts: ExtraContext[] = [];
  if (gqlExec) {
    const info = gqlExec.getInfo();
    excContexts.push({
      name: 'graphql',
      fieldData: { fieldName: info.fieldName, path: info.path },
    });
  }

  reportRequestException(exception, excContexts, request);
}
