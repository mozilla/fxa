import * as Sentry from '@sentry/nestjs';
import { HttpException } from '@nestjs/common';
import { Message } from '@aws-sdk/client-sqs';
import { Request } from 'express';

export interface ExtraContext {
  name: string;
  fieldData: Record<string, string>;
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

/** Indicates if error should be sent to Sentry */
export function ignoreError(err: any): boolean {
  return (
    isAuthServerError(err) ||
    isOriginallyHttpError(err) ||
    (isHttpException(err) && !isInternalServerError(err))
  );
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
    typeof error.extensions?.errno === 'number'
  );
}

export function isHttpException(err: any) {
  return (
    err instanceof HttpException || err.constructor.name === 'HttpException'
  );
}

export function isInternalServerError(err: Error) {
  try {
    if ((err as HttpException).getStatus() >= 500) {
      return true;
    }
  } catch {}

  return false;
}

export function isOriginallyHttpError(
  error: Error & { originalError?: { status: number } }
): boolean {
  return typeof error?.originalError?.status === 'number';
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
    scope.addEventProcessor((event) => {
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
