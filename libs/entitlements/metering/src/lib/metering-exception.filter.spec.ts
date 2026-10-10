/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { HttpStatus, Logger } from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { MeteringExceptionFilter } from './metering-exception.filter';
import {
  ClickHouseError,
  ClickHouseTableNameError,
  MeterNotConfiguredError,
  MeteringError,
  PublishError,
  TimestampOutOfRangeError,
  UsageGrantLifetimeNotSupportedError,
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

  it('maps PublishError to 503 so the caller retries', () => {
    filter.respond(new PublishError(new Error('pubsub unavailable')), response);

    expect(status).toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE);
    expect(json).toHaveBeenCalledWith({
      statusCode: HttpStatus.SERVICE_UNAVAILABLE,
      error: 'Service Unavailable',
      message: 'Usage event could not be accepted, retry shortly',
    });
    expect(logger.error).not.toHaveBeenCalled();
    expect(mockSentryCaptureException).not.toHaveBeenCalled();
  });

  it('does not leak the underlying cause in the 503 body', () => {
    filter.respond(
      new PublishError(new Error('pubsub host 10.0.0.1 refused')),
      response
    );

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.not.stringContaining('10.0.0.1'),
      })
    );
  });

  it('maps UsageGrantLifetimeNotSupportedError to 400', () => {
    filter.respond(
      new UsageGrantLifetimeNotSupportedError(
        'tokens',
        'currentWindow',
        'sliding'
      ),
      response
    );

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(json).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      error: 'Bad Request',
      message: 'Usage grant lifetime is not supported for this meter window',
    });
  });

  it('maps ClickHouseError to 503 so an RP backs off instead of retrying blind', () => {
    filter.respond(
      new ClickHouseError('query', new Error('clickhouse down')),
      response
    );

    expect(status).toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE);
    expect(json).toHaveBeenCalledWith({
      statusCode: HttpStatus.SERVICE_UNAVAILABLE,
      error: 'Service Unavailable',
      message: 'Usage data is temporarily unavailable, retry shortly',
    });
  });

  it('does not leak the ClickHouse cause in the 503 body', () => {
    filter.respond(
      new ClickHouseError(
        'query',
        new Error('clickhouse host 10.0.0.9 refused')
      ),
      response
    );

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.not.stringContaining('10.0.0.9'),
      })
    );
  });

  it('maps TimestampOutOfRangeError to 400', () => {
    filter.respond(
      new TimestampOutOfRangeError('9999-01-01T00:00:00.000Z'),
      response
    );

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
  });

  it('sanitizes any other metering error to a generic 500', () => {
    filter.respond(new ClickHouseTableNameError('bad;table'), response);

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'Internal Server Error',
      message: 'Internal server error',
    });
  });

  it('reports an unmapped metering error to the logger and Sentry', () => {
    const exception = new ClickHouseTableNameError('bad;table');

    filter.respond(exception, response);

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
