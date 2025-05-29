/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { ExecutionContext, HttpException } from '@nestjs/common';
import { ApolloServerErrorCode } from '@apollo/server/errors';
import { GraphQLError } from 'graphql';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import * as Sentry from '@sentry/node';
import { httpRequestToRequestData } from '@sentry/core';
import { ErrorEvent } from '@sentry/core';
import { SQS } from 'aws-sdk';
import { Request } from 'express';

import { CommonPiiActions } from './pii/filter-actions';
import { SentryPiiFilter, SqsMessageFilter } from './pii/filters';

const piiFilter = new SentryPiiFilter([
  CommonPiiActions.breadthFilter,
  CommonPiiActions.depthFilter,
  CommonPiiActions.piiKeys,
  CommonPiiActions.emailValues,
  CommonPiiActions.tokenValues,
  CommonPiiActions.ipV4Values,
  CommonPiiActions.ipV6Values,
  CommonPiiActions.urlUsernamePassword,
]);

const sqsMessageFilter = new SqsMessageFilter([
  CommonPiiActions.emailValues,
  CommonPiiActions.tokenValues,
]);

export interface ExtraContext {
  name: string;
  fieldData: Record<string, string>;
}

/** Adds fxa.name to data.tags */
export function tagFxaName(data: any, name?: string) {
  data.tags = data.tags || {};
  data.tags['fxa.name'] = name || 'unknown';
  return data;
}

/** Indicates if error should be sent to Sentry */
export function ignoreError(err: any): boolean {
  return (
    isAuthServerError(err) ||
    isApolloError(err) ||
    isOriginallyHttpError(err) ||
    (isHttpException(err) && !isInternalServerError(err))
  );
}

/**
 * Determine if an error is an ApolloError.
 * Prior to GQL 16.8 and apollo-server 4.9.3, we used ApolloError from apollo-server.
 * Now, we populate fields on GraphQL error to mimic the previous state of ApolloError.
 */
export function isApolloError(err: Error): boolean {
  if (err instanceof GraphQLError) {
    const code = err.extensions?.code;
    if (typeof code === 'string') {
      return Object.keys(ApolloServerErrorCode).includes(code);
    }
  }
  return false;
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

export function isOriginallyHttpError(
  error: Error & { originalError?: { status: number } }
): boolean {
  return typeof error?.originalError?.status === 'number';
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

/**
 * Filters all of an objects string properties to remove tokens.
 *
 * @param event Sentry ErrorEvent
 */
export function filterObject(event: ErrorEvent) {
  return piiFilter.filter(event);
}

/**
 * Filter potential PII from a sentry event.
 *
 * - Limits depth data beyond 5 levels
 * - Filters out pii keys, See CommonPiiActions.piiKeys for more details
 * - Filters out strings that look like emails addresses
 * - Filters out strings that look like tokens value (32 char length alphanumeric values)
 * - Filters out strings that look like ip addresses (v4/v6)
 * - Filters out urls with user name / password data
 * @param event A sentry event
 * @returns a sanitized sentry event
 */
export function filterSentryEvent(
  event: ErrorEvent,
  _hint: unknown
): ErrorEvent {
  return piiFilter.filter(event);
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
      message = sqsMessageFilter.filter(message);
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
    scope.addEventProcessor((event) => {
      if (request) {
        event.request = httpRequestToRequestData(request);
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
  let request: Request | undefined;
  let gqlExec: GqlExecutionContext | undefined;
  if (context.getType() === 'http') {
    request = context.switchToHttp().getRequest();
  } else if (context.getType<GqlContextType>() === 'graphql') {
    gqlExec = GqlExecutionContext.create(context);
    request = gqlExec.getContext().req;
  }
  const excContexts: ExtraContext[] = [];
  if (gqlExec) {
    const info = gqlExec.getInfo();
    excContexts.push({
      name: 'graphql',
      fieldData: { fieldName: info.fieldName, path: info.path },
    });
  }

  reportRequestException(exception, excContexts, request);
}
