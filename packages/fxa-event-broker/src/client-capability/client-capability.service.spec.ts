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

  beforeEach(async () => {
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
    global.fetch = jest.fn();
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
    expect(mockUpdate).toBeCalledTimes(1);
    const ivl = intervals.shift() as NodeJS.Timeout;
    clearInterval(ivl);
  });

  it('exits on start when disabled', async () => {
    (service as any).config.requireCapabilities = false;
    const mockUpdate = jest.fn().mockResolvedValue({});
    (service as any).updateCapabilities = mockUpdate;
    await service.onApplicationBootstrap();
    expect(mockUpdate).toHaveBeenCalledTimes(0);
  });

  describe('updateCapabilities', () => {
    it('updates successfully', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(baseClients),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      await service.updateCapabilities();
      expect(service.capabilities).toStrictEqual({
        testClient1: ['testCapability1'],
        testClient2: ['testCapability2', 'testCapability3'],
      });
    });

    it('throws on error', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
      expect.assertions(1);
      let caughtError: Error | undefined = undefined;
      try {
        await service.updateCapabilities({ throwOnError: true });
      } catch (err) {
        caughtError = err;
      }
      expect(caughtError).toBeDefined();
    });

    it('logs on error', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValue({ message: 'Server error' }),
        text: jest.fn().mockResolvedValue('Server error'),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      await service.updateCapabilities();
      expect(log.error).toBeCalledTimes(1);
      expect(Sentry.captureException).toBeCalledTimes(1);
    });
  });
});
