/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test, TestingModule } from '@nestjs/testing';
import { LOGGER_PROVIDER } from '@fxa/shared/log';
import { StatsDService } from '@fxa/shared/metrics/statsd';
import { PasskeyService } from './passkey.service';
import { PasskeyManager } from './passkey.manager';

describe('PasskeyService', () => {
  let service: PasskeyService;
  let manager: PasskeyManager;

  const mockManager = {
    // Mock methods will be added as manager grows
  };

  const mockMetrics = {
    increment: jest.fn(),
    timing: jest.fn(),
  };

  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasskeyService,
        { provide: PasskeyManager, useValue: mockManager },
        { provide: StatsDService, useValue: mockMetrics },
        { provide: LOGGER_PROVIDER, useValue: mockLogger },
      ],
    }).compile();

    service = module.get(PasskeyService);
    manager = module.get(PasskeyManager);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should inject PasskeyManager', () => {
    expect(manager).toBeDefined();
    expect(manager).toBe(mockManager);
  });
});
