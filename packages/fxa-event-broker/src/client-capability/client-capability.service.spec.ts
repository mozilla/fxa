/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { Test, TestingModule } from '@nestjs/testing';
import * as Sentry from '@sentry/node';
import { MozLoggerService } from 'fxa-shared/nestjs/logger/logger.service';

import { ClientCapabilityService } from './client-capability.service';

const baseClients = [
  { capabilities: ['testCapability1'], clientId: 'testClient1' },
  {
    clientId: 'testClient2',
    capabilities: ['testCapability2', 'testCapability3'],
  },
];

jest.mock('@sentry/node', () => ({
  captureException: jest.fn(),
}));

describe('ClientCapabilityService', () => {
  let service: ClientCapabilityService;
  let log: any;
  let originalFetch: typeof global.fetch;

  beforeEach(async () => {
    jest.clearAllMocks();
    originalFetch = global.fetch;
    log = { setContext: jest.fn(), debug: jest.fn(), error: jest.fn() };
    const MockLogger: Provider = {
      provide: MozLoggerService,
      useValue: log,
    };
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [
            () => ({
              clientCapabilityFetch: {
                authToken: 'test',
                requireCapabilities: true,
              },
            }),
          ],
        }),
        ScheduleModule.forRoot(),
      ],
      providers: [ClientCapabilityService, MockLogger],
    }).compile();

    service = module.get<ClientCapabilityService>(ClientCapabilityService);
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('queries on start', async () => {
    const mockUpdate = jest.fn().mockResolvedValue({});
    (service as any).updateCapabilities = mockUpdate;
    const intervals: NodeJS.Timeout[] = [];
    const addInterval = (name: string, interval: any) => {
      intervals.push(interval);
    };
    (service as any).scheduler.addInterval = addInterval;
    await service.onApplicationBootstrap();
    expect(mockUpdate).toHaveBeenCalledTimes(1);
    const ivl = intervals.shift() as NodeJS.Timeout;
    clearInterval(ivl);
  });

  it('exits on start when disabled', async () => {
    (service as any).config.requireCapabilities = false;
    const mockUpdate = jest.fn().mockResolvedValue({});
    (service as any).updateCapabilities = mockUpdate;
    (service as any).updateCapabilities = mockUpdate;
    await service.onApplicationBootstrap();
    expect(mockUpdate).toHaveBeenCalledTimes(0);
  });

  describe('updateCapabilities', () => {
    it('populates capabilities from the fetched client list', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => baseClients,
      } as unknown as Response);
      await service.updateCapabilities();
      expect(service.capabilities).toStrictEqual({
        testClient1: ['testCapability1'],
        testClient2: ['testCapability2', 'testCapability3'],
      });
    });

    it('rethrows as an ExtendedError when throwOnError is set and the request rejects', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('ECONNREFUSED'));
      await expect(
        service.updateCapabilities({ throwOnError: true })
      ).rejects.toThrow(
        'Unexpected error fetching client capabilities from auth-server'
      );
    });

    it('logs and reports to Sentry when the request rejects', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('ECONNREFUSED'));
      await service.updateCapabilities();
      expect(log.error).toBeCalledTimes(1);
      expect(Sentry.captureException).toBeCalledTimes(1);
    });

    it('logs the status and reports to Sentry on a non-ok HTTP response', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
      } as unknown as Response);
      await service.updateCapabilities();
      expect(log.error).toHaveBeenCalledWith('updateCapabilities', {
        status: 500,
        message: 'Error fetching client capabilities.',
      });
      expect(Sentry.captureException).toBeCalledTimes(1);
    });
  });
});
