/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { MozLoggerService } from 'fxa-shared/nestjs/logger/logger.service';
import * as Sentry from '@sentry/node';

import { ClientCapabilityService } from '../client-capability/client-capability.service';
import { FirestoreService } from '../firestore/firestore.service';
import { QueueworkerService } from './queueworker.service';
import { ClientWebhooksService } from '../client-webhooks/client-webhooks.service';

jest.mock('@sentry/node', () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
}));

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

const profileMessageForEmailChange = {
  ...baseProfileMessage,
  email: 'foo@mozilla.com',
};

const profileMessageForAccountDisabledChange = {
  ...baseProfileMessage,
  accountDisabled: true,
};
const profileMessageForAccountLockedChange = {
  ...baseProfileMessage,
  accountLocked: true,
};
const profileMessageForMetricsEnabledChange = {
  ...baseProfileMessage,
  metricsEnabled: true,
};
const profileMessageForTotpEnabledChange = {
  ...baseProfileMessage,
  totpEnabled: true,
};

const appleMigrationMessage = {
  event: 'appleUserMigration',
  timestamp: now,
  ts: now / 1000,
  uid: '993d26bac72b471991b197b3d298a5de',
  fxaEmail: 'fxa@email.com',
  appleEmail: 'apple@email.com',
  transferSub: '123',
  success: true,
  err: '',
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
  let webHookService = {
    webhooks: {},
    resourceServers: [] as string[],
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    firestore = {
      storeLogin: jest.fn().mockResolvedValue({}),
      deleteUser: jest.fn().mockResolvedValue({}),
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
      publishMessage: jest.fn().mockResolvedValue('mockid'),
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
    const MockWebhookService: Provider = {
      provide: ClientWebhooksService,
      useValue: webHookService,
    };
    webHookService.webhooks = {};
    webHookService.resourceServers = [];

    config = {
      env: 'development',
      serviceNotificationQueueUrl:
        'https://sqs.us-east-2.amazonaws.com/queue.mozilla/321321321/notifications',
      log: { app: 'test' },
      topicPrefix: 'rp',
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
        MockWebhookService,
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
      const mockSend = jest.fn().mockResolvedValue({});
      (service as any).sqs = {
        send: mockSend,
      };
      (service as any).app.start = jest.fn().mockReturnValue(null);
      await service.onApplicationBootstrap();
      expect(mockSend).toHaveBeenCalledTimes(2);
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

    it('merges resourceServerClientIds', async () => {
      webHookService.resourceServers = [
        'resource-server-client-id',
        '444c5d137fc34d82ae65441d7f26a504',
      ];
      webHookService.webhooks = {};
      const clientIds = await (
        service as any
      ).clientIdsForUserAndResourceServers(baseLoginMessage.uid);
      expect(clientIds).toStrictEqual([
        '444c5d137fc34d82ae65441d7f26a504',
        'resource-server-client-id',
      ]);
    });

    it('handles apple migration event', async () => {
      const msg = updateStubMessage(appleMigrationMessage);
      await (service as any).handleMessage(msg);

      const topicName = 'rp749818d3f2e7857f';
      expect(pubsub.topic).toBeCalledWith(topicName);
      expect(pubsub.topic(topicName).publishMessage).toBeCalledTimes(1);
      expect(pubsub.topic(topicName).publishMessage).toBeCalledWith({
        json: {
          appleEmail: 'apple@email.com',
          err: '',
          event: 'appleUserMigration',
          fxaEmail: 'fxa@email.com',
          success: true,
          timestamp: now,
          transferSub: '123',
          ts: now / 1000,
          uid: '993d26bac72b471991b197b3d298a5de',
        },
      });
    });

    const fetchOnValidMessage = {
      'delete message': baseDeleteMessage,
      'legacy subscription message': baseSubscriptionUpdateLegacyMessage,
      'password change message': basePasswordChangeMessage,
      'password reset message': basePasswordResetMessage,
      'primary email message': basePrimaryEmailMessage,
      'profile change message': baseProfileMessage,
      'profile change for email message': profileMessageForEmailChange,
      'profile change for metrics message':
        profileMessageForMetricsEnabledChange,
      'profile change for totp message': profileMessageForTotpEnabledChange,
      'profile change for account locked message':
        profileMessageForAccountLockedChange,
      'profile change for account disabled message':
        profileMessageForAccountDisabledChange,
      'subscription message': baseSubscriptionUpdateMessage,
    };

    // Ensure that all our message types can be handled without error.
    async function checkFetchesOnValid(value: any) {
      const msg = updateStubMessage(value);
      await (service as any).handleMessage(msg);
      expect(firestore.fetchClientIds).toBeCalledTimes(1);
      expect(logger.debug).toBeCalledTimes(2);
    }
    for (const [key, value] of Object.entries(fetchOnValidMessage)) {
      it(`fetches on valid ${key}`, async () => {
        await checkFetchesOnValid(value);
      });
    }

    const invalidMessages = {
      login: { ...baseLoginMessage, clientId: 'test1234' },
      'password change': { ...basePasswordChangeMessage, ts: false },
      'password reset': { ...basePasswordResetMessage, ts: false },
      'primary email change': { ...basePrimaryEmailMessage, ts: false },
      'profile change': { ...baseProfileMessage, ts: false },
      subscription: { ...baseSubscriptionUpdateMessage, eventCreatedAt: false },
    };

    async function logsErrorOnInvalid(value: any) {
      const msg = updateStubMessage(value);
      await (service as any).handleMessage(msg);
      expect(logger.error).toBeCalledTimes(1);
      expect(logger.error.mock.calls[0][0]).toBe('from.sqsMessage');
      expect(Sentry.captureException).toBeCalledTimes(1);
    }

    for (const [key, value] of Object.entries(invalidMessages)) {
      it(`logs an error on invalid ${key} message`, async () => {
        await logsErrorOnInvalid(value);
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
