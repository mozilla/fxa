/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { ExecutionContext } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { Message } from '@aws-sdk/client-sqs';
import { Request } from 'express';

export interface ExtraContext {
  name: string;
  fieldData: Record<string, string>;
}

/**
 * Determine if an error originates from auth-server. Auth server responds with error
 * codes and numbers, and client applications handle these states accordingly. These
 * responses are not considered unhandled error states, and therefore should not
 * be reported on.
 * @param error - The error that has occurred
 * @returns true if errors states appears to be a known auth server error
 */
export function isAuthServerError(
  error: Error & { extensions?: { errno?: number; code?: number } }
): boolean {
  return (
    typeof error.extensions?.code === 'number' &&
    typeof error.extensions?.errno === 'number' &&
    error.extensions.errno >= 100
  );
}

export function isOriginallyHttpError(
  error: Error & { originalError?: { status: number } }
): boolean {
  if (typeof error?.originalError?.status === 'number') {
    return true;
  }
  return false;
}

/**
 * Capture a SQS Error to Sentry with additional context.
 *
 * @param err Error object to capture.
 * @param message SQS Message to include with error.
 */
export function captureSqsError(err: Error, message?: Message): void {
  Sentry.withScope((scope) => {
    if (message?.Body) {
      scope.setContext('SQS Message', message as Record<string, unknown>);
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
  exception: Error & { reported?: boolean; status?: number; response?: any },
  excContexts: ExtraContext[] = [],
  request?: Request
) {
  // Don't report already reported exceptions
  if (exception.reported) {
    return;
  }

  Sentry.withScope((scope: Sentry.Scope) => {
    scope.addEventProcessor((event: Sentry.Event) => {
      if (request) {
        // As of sentry v9, this should automatically happen by adding, Sentry.requestDataIntegration()
        // Leaving note here for historical context.
        // event.request = Sentry.extractRequestData(request);
        event.level = 'error';
        return event;
      }
      return null;
    });
    for (const ctx of excContexts) {
      scope.setContext(ctx.name, ctx.fieldData);
    }

    Sentry.captureException(exception);
    exception.reported = true;
  });
}

export function processException(context: ExecutionContext, exception: Error) {
  // First determine what type of a request this is
  let requestType: 'http' | 'graphql' | undefined;
  let request: Request | undefined;
  if (context.getType() === 'http') {
    requestType = 'http';
    request = context.switchToHttp().getRequest();
  }
  let excContexts: ExtraContext[] = [];
  reportRequestException(exception, excContexts, request);
}
