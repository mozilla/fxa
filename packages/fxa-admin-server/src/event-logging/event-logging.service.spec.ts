/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Test, TestingModule } from '@nestjs/testing';
import { MockLogService, logger } from '../mocks';
import { EventLoggingService, EventNames } from './event-logging.service';

describe('EventLogging', () => {
  let eventLogging: EventLoggingService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventLoggingService, MockLogService],
    }).compile();

    eventLogging = module.get<EventLoggingService>(EventLoggingService);
  });

  beforeEach(() => {
    logger.info.mockClear();
  });

  it('should be defined', () => {
    expect(eventLogging).toBeDefined();
  });

  it('should record event', () => {
    eventLogging.onEvent(EventNames.ClearBounces);
    expect(logger.info).lastCalledWith('admin-panel-events', {
      event: 'clear-bounces',
    });
  });

  it('should record account search event with flag', () => {
    eventLogging.onAccountSearch('email', true);
    expect(logger.info).lastCalledWith('admin-panel-events', {
      event: 'account-search',
      'search-type': 'email',
      'auto-completed': true,
    });
  });
});
