/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import * as Sentry from '@sentry/node';
import { MozLoggerService } from '@fxa/shared/mozlog';
import { AppConfig } from '../config';

/**
 * Interceptor that automatically logs admin actions with:
 * - User (admin who performed the action)
 * - Action (function/mutation name)
 * - Date (timestamp)
 * - Payload (arguments passed to the mutation)
 */
@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logType = 'admin-audit';
  private readonly sensitiveKeys: string[];

  constructor(
    private readonly log: MozLoggerService,
    private readonly configService: ConfigService<AppConfig>
  ) {
    const logConfig = this.configService.get('log') as AppConfig['log'];
    this.sensitiveKeys = logConfig.auditSanitizeProperties;
  }

  private safeLogInfo(data: Record<string, any>): void {
    this.safeLog('info', data);
  }

  private safeLogError(data: Record<string, any>): void {
    this.safeLog('error', data);
  }

  private safeLog(
    logType: 'info' | 'error' | 'debug' | 'warn' | 'trace',
    data: Record<string, any>
  ): void {
    try {
      this.log[logType](this.logType, data);
    } catch (error) {
      Sentry.captureException(error, {
        tags: { source: 'AuditLogInterceptor', logType },
        extra: { logData: data },
      });
    }
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const gqlContext = GqlExecutionContext.create(context);
    const gqlContextValue = gqlContext.getContext();
    const request = gqlContextValue.req as Request;
    const handler = context.getHandler();
    const args = gqlContext.getArgs();

    const user = (request as any).user || 'unknown';
    const actionName = handler.name;
    const timestamp = new Date().toISOString();
    const payload = sanitizeObject(args, this.sensitiveKeys);

    const baseLogData = (status: 'initiated' | 'success' | 'error') => ({
      user,
      action: actionName,
      timestamp,
      payload,
      status,
    });

    // Log before execution - don't let logging errors block the request
    this.safeLogInfo({
      ...baseLogData('initiated'),
    });

    return next.handle().pipe(
      tap({
        next: (result) => {
          this.safeLogInfo({
            ...baseLogData('success'),
            result, // we could sanitize this, but there shouldn't be any sensitive data in the result
          });
        },
        error: (error) => {
          this.safeLogError({
            ...baseLogData('error'),
            error: error.message,
            errorName: error.name,
          });
        },
      })
    );
  }
}

/**
 * Redacts sensitive data from an object, recursively.
 *
 * Fields remain, but values are replaced with '[REDACTED]'.
 */
export function sanitizeObject(
  args: any,
  sensitiveKeys: string[]
): Record<string, any> {
  if (sensitiveKeys.length === 0 || !args) {
    return args;
  }
  if (typeof args !== 'object') {
    return args;
  }
  // check if args is an array of objects, then sanitize each object
  if (Array.isArray(args)) {
    return args.map((item) => sanitizeObject(item, sensitiveKeys));
  }

  const sanitized = { ...args };

  for (const key in sanitized) {
    if (typeof sanitized[key] === 'object') {
      // recursive into nested objects
      sanitized[key] = sanitizeObject(sanitized[key], sensitiveKeys);
      continue;
    }
    if (
      sensitiveKeys.some((sk) => key.toLowerCase().includes(sk.toLowerCase()))
    ) {
      sanitized[key] = '[REDACTED]';
    }
  }

  return sanitized;
}
