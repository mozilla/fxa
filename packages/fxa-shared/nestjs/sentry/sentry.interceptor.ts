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
import { ApolloError } from 'apollo-server';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { processException } from './reporting';

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
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
      })
    );
  }
}
