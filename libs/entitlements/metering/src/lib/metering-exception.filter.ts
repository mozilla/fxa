/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Inject,
  Logger,
} from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';

import {
  MeterNotConfiguredError,
  MeteringBufferOverflowError,
  MeteringError,
  UsageGrantNotFoundError,
} from './metering.error';

interface MeteringErrorBody {
  statusCode: number;
  error: string;
  message: string;
}

interface HttpResponseWriter {
  status(code: number): { json(body: MeteringErrorBody): unknown };
}

@Catch(MeteringError)
export class MeteringExceptionFilter implements ExceptionFilter {
  constructor(@Inject(Logger) private readonly logger: LoggerService) {}

  catch(exception: MeteringError, host: ArgumentsHost): void {
    this.respond(
      exception,
      host.switchToHttp().getResponse<HttpResponseWriter>()
    );
  }

  respond(exception: MeteringError, response: HttpResponseWriter): void {
    if (
      exception instanceof MeterNotConfiguredError ||
      exception instanceof UsageGrantNotFoundError
    ) {
      response.status(HttpStatus.NOT_FOUND).json({
        statusCode: HttpStatus.NOT_FOUND,
        error: 'Not Found',
        message: exception.message,
      });
      return;
    }

    if (exception instanceof MeteringBufferOverflowError) {
      response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        error: 'Service Unavailable',
        message: exception.message,
      });
      return;
    }

    this.logger.error(exception);
    Sentry.captureException(exception);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'Internal Server Error',
      message: 'Internal server error',
    });
  }
}
