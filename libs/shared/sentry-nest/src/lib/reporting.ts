import * as Sentry from '@sentry/nestjs';
import { ExecutionContext, HttpException } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { ApolloServerErrorCode } from '@apollo/server/errors';

import { CommonPiiActions, SqsMessageFilter } from '@fxa/shared/sentry-utils';
import { GraphQLError } from 'graphql';
import { SQS } from 'aws-sdk';
import { Request } from 'express';

export interface ExtraContext {
  name: string;
  fieldData: Record<string, string>;
}

const sqsMessageFilter = new SqsMessageFilter([
  CommonPiiActions.emailValues,
  CommonPiiActions.tokenValues,
]);

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
 * Determine if an error is an ApolloError.
 * Prior to GQL 16.8 and apollo-server 4.9.3, we used ApolloError from apollo-server.
 * Now, we populate fields on GraphQL error to mimic the previous state of ApolloError.
 */
export function isApolloError(err: Error): boolean {
  if (err instanceof GraphQLError) {
    const code = err.extensions?.['code'];
    if (typeof code === 'string') {
      return Object.keys(ApolloServerErrorCode).includes(code);
    }
  }
  return false;
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
        event.request = Sentry.extractRequestData(request);
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

// TODO: Dead code?
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
