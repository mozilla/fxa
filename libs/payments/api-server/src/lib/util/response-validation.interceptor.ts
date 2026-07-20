/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as Sentry from '@sentry/node';
import { Observable, map } from 'rxjs';
import { z } from 'zod';
import { RESPONSE_SCHEMA_KEY } from './openapi';

/** Strips Zod issues to code + path only — Zod 4 messages can leak input values. */
export function sanitizeZodIssues(
  issues: z.core.$ZodIssue[]
): Array<Pick<z.core.$ZodIssue, 'code' | 'path'>> {
  return issues.map(({ code, path }) => ({ code, path }));
}

@Injectable()
export class ResponseValidationInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ResponseValidationInterceptor.name);

  constructor(private readonly reflector: Reflector) {}

  private safeLogError(message: string, extra?: Record<string, unknown>): void {
    try {
      this.logger.error(message);
    } catch (error) {
      Sentry.captureException(error, {
        tags: { source: 'ResponseValidationInterceptor' },
        extra,
      });
    }
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const schema = this.reflector.get<z.ZodType | undefined>(
      RESPONSE_SCHEMA_KEY,
      context.getHandler()
    );

    if (!schema) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        const result = schema.safeParse(data);
        if (!result.success) {
          const handler = context.getHandler().name;
          const controller = context.getClass().name;
          const sanitizedIssues = sanitizeZodIssues(result.error.issues);

          this.safeLogError(
            `Response validation failed for ${controller}.${handler}`,
            { controller, handler, issues: sanitizedIssues }
          );

          Sentry.captureException(
            new Error(
              `Response validation failed for ${controller}.${handler}`
            ),
            {
              tags: {
                source: 'ResponseValidationInterceptor',
                controller,
                handler,
              },
              extra: { issues: sanitizedIssues },
            }
          );

          throw new InternalServerErrorException('Response validation failed');
        }
        return result.data;
      })
    );
  }
}
