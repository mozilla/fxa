/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import * as Sentry from '@sentry/node';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

function processException(context: ExecutionContext, exception: Error) {
  // First determine what type of a request this is
  let requestType: 'http' | 'graphql' | undefined;
  let request: Request;
  let gqlExec: GqlExecutionContext | undefined;
  if (context.getType() === 'http') {
    requestType = 'http';
    request = context.switchToHttp().getRequest();
  } else if (context.getType<GqlContextType>() === 'graphql') {
    requestType = 'graphql';
    gqlExec = GqlExecutionContext.create(context);
    request = gqlExec.getContext().req;
  }

  Sentry.withScope((scope: Sentry.Scope) => {
    scope.addEventProcessor((event: Sentry.Event) => {
      if (requestType) {
        const sentryEvent = Sentry.Handlers.parseRequest(event, request);
        sentryEvent.level = Sentry.Severity.Error;
        return sentryEvent;
      }
      return null;
    });
    if (gqlExec) {
      const info = gqlExec.getInfo();
      scope.setContext('graphql', {
        fieldName: info.fieldName,
        path: info.path,
      });
    }
    Sentry.captureException(exception);
  });
}

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(
        tap({ error: (exception) => processException(context, exception) })
      );
  }
}
