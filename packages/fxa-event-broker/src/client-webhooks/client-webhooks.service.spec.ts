/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Provider } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { FirestoreService } from '../firestore/firestore.service';
import { MozLoggerService } from '../logger/logger.service';
import { ClientWebhooksService } from './client-webhooks.service';

const baseClients = [
  { capabilities: ['testCapability1'], clientId: 'testClient1' },
  {
    clientId: 'testClient2',
    capabilities: ['testCapability2', 'testCapability3'],
  },
];

describe('ClientWebhooksService', () => {
  let service: ClientWebhooksService;
  let triggerChange: any;
  let triggerError: any;
  let log: any;

  beforeEach(async () => {
    const MockFirestore: Provider = {
      provide: FirestoreService,
      useValue: {
        listenForClientIdWebhooks: (triggerFunc: any, errorFunc: any) => {
          triggerChange = triggerFunc;
          triggerError = errorFunc;
        },
        fetchClientIdWebhooks: jest.fn().mockResolvedValue({
          testClient1: 'http://localhost/webhook',
          testClient2: 'http://localhost/webhooks',
        }),
      },
    };
    log = { setContext: jest.fn(), debug: jest.fn(), error: jest.fn() };
    const MockLogger: Provider = {
      provide: MozLoggerService,
      useValue: log,
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClientWebhooksService, MockFirestore, MockLogger],
    }).compile();

    service = module.get<ClientWebhooksService>(ClientWebhooksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should shutdown', () => {
    const cancelMock = jest.fn();
    (service as any).cancel = cancelMock;
    service.onApplicationShutdown();
    expect(cancelMock).toBeCalled();
  });

  describe('onApplicationBootstartp', () => {
    it('gets change messages', async () => {
      await service.onApplicationBootstrap();
      triggerChange(
        { testClient3: 'http://localhost/webhooks4' },
        { testClient1: null }
      );
      expect(service.webhooks).toStrictEqual({
        testClient3: 'http://localhost/webhooks4',
        testClient2: 'http://localhost/webhooks',
      });
    });

    it('gets errors', async () => {
      await service.onApplicationBootstrap();
      const mockExit = jest.spyOn(process, 'exit').mockImplementation();
      triggerError(new Error('oops'));
      expect(mockExit).toBeCalledTimes(1);
      expect(log.error).toBeCalledTimes(1);
    });
  });
});
