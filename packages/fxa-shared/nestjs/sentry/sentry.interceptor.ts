/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import * as Sentry from '@sentry/node';
import {
  catchError,
  finalize,
  Observable,
  OperatorFunction,
  tap,
  throwError,
} from 'rxjs';
import { SentryService } from './sentry.service';
import { ApolloError } from 'apollo-server';
import { MozLoggerService } from '../logger/logger.service';
import { ExecuteCommandSessionConfigurationCommandString } from 'aws-sdk/clients/codecatalyst';
import { GqlExecutionContext } from '@nestjs/graphql';
import { processException } from './reporting';

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  constructor(
    private sentryService: SentryService,
    private log: MozLoggerService
  ) {
    this.log.info('sentry-interceptor', { msg: `!!! starting interceptor!` });
  }

  getRequest(context: ExecutionContext) {
    // First try an http request
    const httpRequest = context.switchToHttp().getRequest();
    if (httpRequest) {
      this.log.info('sentry-interceptor', { msg: '!!! http request found' });
      return { request: httpRequest, type: 'http' };
    }

    // Fallback to gql
    const gqlContext = GqlExecutionContext.create(context);
    const gqlRequest = gqlContext.getContext()?.req;
    if (gqlRequest) {
      this.log.info('sentry-interceptor', { msg: '!!! gql request found' });
      return { request: gqlRequest, type: 'gql' };
    }

    this.log.info('sentry-interceptor', { msg: '!!! not request found' });
    return {
      request: undefined,
      type: undefined,
    };
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    this.log.info('sentry-interceptor', { msg: `!!! intercepting!`, context });
    const { request, type } = this.getRequest(context);

    let span: Sentry.Span | undefined;
    if (request && type === 'http') {
      span = this.sentryService.getRequestSpan(request, {
        op: 'nestjs.http',
        name: `${request.method} ${request.path}`,
      });
    }
    if (request && type === 'gql') {
      span = this.sentryService.getRequestSpan(request, {
        op: 'nestjs.gql',
        name: `${request.method} ${request.path}`,
      });
    }

    if (span) {
      this.log.info('sentry-interceptor', {
        msg: `sentry span created!`,
      });
    } else {
      this.log.info('sentry-interceptor', {
        msg: 'could not create sentry span',
      });
    }

    return next.handle().pipe(
      tap({
        error: (exception) => {
          // Skip HttpExceptions with status code < 500.
          if (
            exception instanceof HttpException ||
            exception.constructor.name === 'HttpException'
          ) {
            if ((exception as HttpException).getStatus() < 500) {
              return;
            }
          }
          // Skip ApolloErrors
          if (exception instanceof ApolloError) {
            return;
          }
          processException(context, exception);
        },
      }),
      finalize(() => {
        span?.finish();

        if (span) {
          this.log.info('sentry-interceptor', {
            msg: `sentry span finalized!`,
          });
        }
      })
    );
  }
}
