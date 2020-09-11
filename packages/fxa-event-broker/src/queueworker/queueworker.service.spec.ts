/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { ClientCapabilityService } from '../client-capability/client-capability.service';
import { FirestoreService } from '../firestore/firestore.service';
import { MozLoggerService } from '../logger/logger.service';
import { QueueworkerService } from './queueworker.service';

const now = Date.now();

const baseMessage = {
  event: 'login',
  timestamp: now,
  ts: now / 1000,
  uid: '993d26bac72b471991b197b3d298a5de',
};

const baseLoginMessage = {
  ...baseMessage,
  clientId: '444c5d137fc34d82ae65441d7f26a504',
  deviceCount: 2,
  email: 'test@testuser.com',
  service: '123-client',
  userAgent: 'firefox',
};

const baseSubscriptionUpdateLegacyMessage = {
  ...baseMessage,
  event: 'subscription:update',
  eventCreatedAt: Math.trunc(Date.now() / 1000),
  isActive: true,
  productCapabilities: ['guardian_vpn', 'secure_proxy'],
  productName: 'firefox-sub',
  subscriptionId: 'sub_123456',
};

const baseSubscriptionUpdateMessage = {
  ...baseSubscriptionUpdateLegacyMessage,
  productId: 'firefox-sub',
  productName: undefined,
};

const baseDeleteMessage = {
  ...baseMessage,
  event: 'delete',
};

const basePasswordResetMessage = {
  ...baseMessage,
  event: 'reset',
};

const basePasswordChangeMessage = {
  ...baseMessage,
  event: 'passwordChange',
};

const basePrimaryEmailMessage = {
  ...baseMessage,
  event: 'primaryEmailChanged',
};

const baseProfileMessage = {
  ...baseMessage,
  event: 'profileDataChange',
};

const updateStubMessage = (message: any) => {
  return {
    Body: JSON.stringify(message),
  };
};

describe('QueueworkerService', () => {
  let service: QueueworkerService;
  let firestore: any;
  let logger: any;
  let metrics: any;
  let pubsub: any;
  let topic: any;
  let capabilities: any;
  let config: any;

  beforeEach(async () => {
    firestore = {
      storeLogin: jest.fn().mockResolvedValue({}),
      fetchClientIds: jest
        .fn()
        .mockResolvedValue(['444c5d137fc34d82ae65441d7f26a504']),
    };
    logger = {
      error: jest.fn(),
      debug: jest.fn(),
      info: jest.fn(),
    };
    topic = {
      publishJSON: jest.fn().mockResolvedValue('mockid'),
    };
    pubsub = {
      topic: jest.fn().mockReturnValue(topic),
    };
    metrics = {
      timing: jest.fn(),
      increment: jest.fn(),
    };
    const MockMetrics: Provider = {
      provide: 'METRICS',
      useValue: metrics,
    };
    const MockPubSub: Provider = {
      provide: 'GOOGLEPUBSUB',
      useValue: pubsub,
    };
    const MockMozLogger: Provider = {
      provide: MozLoggerService,
      useValue: logger,
    };
    const MockFirestore: Provider = {
      provide: FirestoreService,
      useValue: firestore,
    };
    capabilities = {
      '444c5d137fc34d82ae65441d7f26a504': ['guardian_vpn'],
    };
    const MockCapability: Provider = {
      provide: ClientCapabilityService,
      useValue: {
        capabilities,
      },
    };
    config = {
      env: 'development',
      serviceNotificationQueueUrl:
        'https://sqs.us-east-2.amazonaws.com/queue.mozilla/321321321/notifications',
      log: { app: 'test' },
    };
    const MockConfig: Provider = {
      provide: ConfigService,
      useValue: {
        get: (name: string) => {
          return config[name];
        },
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueueworkerService,
        MockMetrics,
        MockPubSub,
        MockMozLogger,
        MockFirestore,
        MockCapability,
        MockConfig,
      ],
    }).compile();

    service = module.get<QueueworkerService>(QueueworkerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('lifecycle', () => {
    it('starts up with dev checks', async () => {
      (service as any).queueName =
        'https://localhost:4100/queue.mozilla/321321321/notifications';
      const mockQueue = jest.fn().mockResolvedValue({});
      const mockCreate = jest.fn().mockResolvedValue({});
      (service as any).sqs = {
        listQueues: jest.fn().mockReturnValue({ promise: mockQueue }),
        createQueue: jest.fn().mockReturnValue({ promise: mockCreate }),
      };
      (service as any).app.start = jest.fn().mockReturnValue(null);
      await service.onApplicationBootstrap();
      expect(mockQueue).toHaveBeenCalled();
      expect(mockCreate).toHaveBeenCalled();
      expect((service as any).app.start).toHaveBeenCalled();
    });

    it('starts up with prod checks', async () => {
      config.env = 'production';
      (service as any).app.start = jest.fn().mockReturnValue(null);
      await service.onApplicationBootstrap();
      expect((service as any).app.start).toHaveBeenCalled();
    });

    it('exits with invalid region on prod', async () => {
      config.env = 'production';
      const mockExit = jest.spyOn(process, 'exit').mockImplementation();
      (service as any).queueName =
        'https://amazonaws.com/queue.mozilla/321321321/notifications';
      (service as any).app.start = jest.fn().mockReturnValue(null);
      await service.onApplicationBootstrap();
      expect(mockExit).toHaveBeenCalledWith(8);
    });
  });

  describe('message handler', () => {
    it('stores on valid login message', async () => {
      const msg = updateStubMessage(baseLoginMessage);
      await (service as any).handleMessage(msg);
      expect(firestore.storeLogin).toBeCalledTimes(1);
      expect(firestore.storeLogin).toBeCalledWith(
        baseLoginMessage.uid,
        baseLoginMessage.clientId
      );
    });

    it('normalizes the client id', async () => {
      const message = Object.assign({}, baseLoginMessage);
      message.clientId = message.clientId.toUpperCase();
      const msg = updateStubMessage(baseLoginMessage);
      await (service as any).handleMessage(msg);
      expect(firestore.storeLogin).toBeCalledTimes(1);
      expect(firestore.storeLogin).toBeCalledWith(
        baseLoginMessage.uid,
        baseLoginMessage.clientId
      );
    });

    const fetchOnValidMessage = {
      'delete message': baseDeleteMessage,
      'legacy subscription message': baseSubscriptionUpdateLegacyMessage,
      'password change message': basePasswordChangeMessage,
      'password reset message': basePasswordResetMessage,
      'primary email message': basePrimaryEmailMessage,
      'profile change message': baseProfileMessage,
      'subscription message': baseSubscriptionUpdateMessage,
    };

    // Ensure that all our message types can be handled without error.
    for (const [key, value] of Object.entries(fetchOnValidMessage)) {
      it(`fetches on valid ${key}`, async () => {
        const msg = updateStubMessage(value);
        await (service as any).handleMessage(msg);
        expect(firestore.fetchClientIds).toBeCalledTimes(1);
        expect(logger.debug).toBeCalledTimes(2);
      });
    }

    const invalidMessages = {
      login: { ...baseLoginMessage, clientId: 'test1234' },
      'password change': { ...basePasswordChangeMessage, ts: false },
      'password reset': { ...basePasswordResetMessage, ts: false },
      'primary email change': { ...basePrimaryEmailMessage, ts: false },
      'profile change': { ...baseProfileMessage, ts: false },
      subscription: { ...baseSubscriptionUpdateMessage, productId: false },
    };
    for (const [key, value] of Object.entries(invalidMessages)) {
      it(`logs an error on invalid ${key} message`, async () => {
        const msg = updateStubMessage(value);
        await (service as any).handleMessage(msg);
        expect(logger.error).toBeCalledTimes(1);
        expect(logger.error.mock.calls[0][0]).toBe('from.sqsMessage');
      });
    }

    it('ignores logins with no clientid', async () => {
      const msg = updateStubMessage({
        ...baseLoginMessage,
        clientId: undefined,
      });
      await (service as any).handleMessage(msg);
      expect(logger.debug).toBeCalledTimes(2);
      expect(logger.debug.mock.calls[1][0]).toBe('unwantedMessage');
    });

    it('logs on message its not interested in', async () => {
      const msg = updateStubMessage(
        Object.assign({}, { ...baseLoginMessage, event: 'logout' })
      );
      await (service as any).handleMessage(msg);
      expect(logger.debug).toBeCalledTimes(1);
      expect(logger.debug.mock.calls[0][0]).toBe('unwantedMessage');
    });
  });
});
