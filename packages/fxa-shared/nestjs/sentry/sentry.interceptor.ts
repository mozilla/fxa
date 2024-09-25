/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';

import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import * as Sentry from '@sentry/node';

import {
  isApolloError,
  processException,
  isAuthServerError,
} from './reporting';

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // If there is http context request start a transaction for it. Note that this will not
    // pick up graphql queries
    const req = context.switchToHttp().getRequest();
    let transaction: Sentry.Span;
    if (req) {
      transaction = Sentry.startInactiveSpan({
        op: 'nestjs.http',
        name: `${context.switchToHttp().getRequest().method} ${
          context.switchToHttp().getRequest().path
        }`,
        forceTransaction: true,
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

          // Skip known auth-server errors
          if (isAuthServerError(exception)) return;

          // Skip ApolloErrors
          if (isApolloError(exception)) return;

          processException(context, exception);
        },
      }),
      finalize(() => {
        transaction?.end();
      })
    );
  }
}
