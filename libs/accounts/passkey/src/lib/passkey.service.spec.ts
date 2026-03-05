/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Container } from 'typedi';
import { LOGGER_PROVIDER } from '@fxa/shared/log';
import { PasskeyService, StatsDToken } from './passkey.service';
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

  beforeEach(() => {
    Container.reset();
    Container.set(PasskeyManager, mockManager);
    Container.set(StatsDToken, mockMetrics);
    Container.set(LOGGER_PROVIDER, mockLogger);

    service = Container.get(PasskeyService);
    manager = Container.get(PasskeyManager);
  });

  afterEach(() => {
    jest.clearAllMocks();
    Container.reset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should inject PasskeyManager', () => {
    expect(manager).toBeDefined();
    expect(manager).toBe(mockManager);
  });
});
