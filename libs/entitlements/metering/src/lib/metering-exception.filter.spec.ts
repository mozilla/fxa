/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { HttpStatus, Logger } from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { MeteringExceptionFilter } from './metering-exception.filter';
import {
  MeterNotConfiguredError,
  MeteringBufferOverflowError,
  MeteringError,
  OpenMeterQueryError,
} from './metering.error';

const mockSentryCaptureException = jest.fn();

jest.mock('@sentry/nestjs', () => ({
  captureException: (err: unknown) => mockSentryCaptureException(err),
}));

describe('MeteringExceptionFilter', () => {
  let filter: MeteringExceptionFilter;
  let logger: jest.Mocked<Pick<LoggerService, 'error'>>;
  let json: jest.Mock;
  let status: jest.Mock;
  let response: { status: jest.Mock };

  beforeEach(async () => {
    mockSentryCaptureException.mockClear();
    logger = { error: jest.fn() };
    json = jest.fn();
    status = jest.fn(() => ({ json }));
    response = { status };

    const moduleRef = await Test.createTestingModule({
      providers: [
        MeteringExceptionFilter,
        { provide: Logger, useValue: logger },
      ],
    }).compile();
    filter = moduleRef.get(MeteringExceptionFilter);
  });

  it('maps MeterNotConfiguredError to 404', () => {
    filter.respond(new MeterNotConfiguredError('tokens'), response);

    expect(status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(json).toHaveBeenCalledWith({
      statusCode: HttpStatus.NOT_FOUND,
      error: 'Not Found',
      message: 'Meter slug is not configured',
    });
    expect(logger.error).not.toHaveBeenCalled();
    expect(mockSentryCaptureException).not.toHaveBeenCalled();
  });

  it('maps MeteringBufferOverflowError to 503', () => {
    filter.respond(new MeteringBufferOverflowError(), response);

    expect(status).toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE);
    expect(json).toHaveBeenCalledWith({
      statusCode: HttpStatus.SERVICE_UNAVAILABLE,
      error: 'Service Unavailable',
      message: 'Metering ingest buffer is full',
    });
    expect(logger.error).not.toHaveBeenCalled();
    expect(mockSentryCaptureException).not.toHaveBeenCalled();
  });

  it('sanitizes any other metering error to a generic 500 and reports it', () => {
    const exception = new OpenMeterQueryError(new Error('clickhouse down'));

    filter.respond(exception, response);

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'Internal Server Error',
      message: 'Internal server error',
    });
    expect(logger.error).toHaveBeenCalledWith(exception);
    expect(mockSentryCaptureException).toHaveBeenCalledWith(exception);
  });

  it('does not leak a sensitive error message in the sanitized 500 body', () => {
    const exception = new MeteringError('clickhouse password is hunter2', {});

    filter.respond(exception, response);

    expect(json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'Internal Server Error',
      message: 'Internal server error',
    });
  });
});
