/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as Sentry from '@sentry/node';
import { MozLoggerService } from 'fxa-shared/nestjs/logger/logger.service';

import { ClientWebhooksService } from '../client-webhooks/client-webhooks.service';
import { JwtsetService } from '../jwtset/jwtset.service';
import * as dto from '../queueworker/sqs.dto';
import { PubsubProxyController } from './pubsub-proxy.controller';

jest.mock('@sentry/node', () => ({
  captureException: jest.fn(),
}));

const TEST_TOKEN =
  'eyJhbGciOiJSUzI1NiIsImtpZCI6IjdkNjgwZDhjNzBkNDRlOTQ3MTMzY2JkNDk5ZWJjMWE2MWMzZDVhYmMiLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJodHRwczovL2V4YW1wbGUuY29tIiwiYXpwIjoiMTEzNzc0MjY0NDYzMDM4MzIxOTY0IiwiZW1haWwiOiJnYWUtZ2NwQGFwcHNwb3QuZ3NlcnZpY2VhY2NvdW50LmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJleHAiOjE1NTAxODU5MzUsImlhdCI6MTU1MDE4MjMzNSwiaXNzIjoiaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tIiwic3ViIjoiMTEzNzc0MjY0NDYzMDM4MzIxOTY0In0.QVjyqpmadTyDZmlX2u3jWd1kJ68YkdwsRZDo-QxSPbxjug4ucLBwAs2QePrcgZ6hhkvdc4UHY4YF3fz9g7XHULNVIzX5xh02qXEH8dK6PgGndIWcZQzjSYfgO-q-R2oo2hNM5HBBsQN4ARtGK_acG-NGGWM3CQfahbEjZPAJe_B8M7HfIu_G5jOLZCw2EUcGo8BvEwGcLWB2WqEgRM0-xt5-UPzoa3-FpSPG7DHk7z9zRUeq6eB__ldb-2o4RciJmjVwHgnYqn3VvlX9oVKEgXpNFhKuYA-mWh5o7BCwhujSMmFoBOh6mbIXFcyf5UiVqKjpqEbqPGo_AvKvIQ9VTQ';
const TEST_CLIENT_ID = 'abc1234';
const CHANGE_TIME = Date.now();

const createValidSubscriptionMessage = (): string => {
  return Buffer.from(
    JSON.stringify({
      capabilities: ['cap1', 'cap2'],
      changeTime: Math.trunc(Date.now() / 1000),
      event: dto.SUBSCRIPTION_UPDATE_EVENT,
      isActive: true,
      uid: 'uid1234',
    })
  ).toString('base64');
};

const createValidUpdateMessage = (): string => {
  return Buffer.from(
    JSON.stringify({
      event: dto.SUBSCRIPTION_UPDATE_EVENT,
      uid: 'uid1234',
    })
  ).toString('base64');
};

const createValidDeleteMessage = (): string => {
  return Buffer.from(
    JSON.stringify({
      event: dto.DELETE_EVENT,
      uid: 'uid1234',
    })
  ).toString('base64');
};

const createValidProfileMessage = (): string => {
  return Buffer.from(
    JSON.stringify({
      event: dto.PROFILE_CHANGE_EVENT,
      uid: 'uid1234',
      locale: 'en-us',
      totpEnabled: false,
      accountDisabled: false,
      accountLocked: false,
      metricsEnabled: true,
    })
  ).toString('base64');
};

const createValidPasswordMessage = (): string => {
  return Buffer.from(
    JSON.stringify({
      changeTime: CHANGE_TIME,
      event: dto.PASSWORD_CHANGE_EVENT,
      uid: 'uid1234',
    })
  ).toString('base64');
};

const mockWebhook = () => {
  return jest.spyOn(global, 'fetch').mockImplementation(async function (url, options = {}) {
    const headers = options.headers || {};
    const auth = headers.authorization || headers.Authorization || '';
    return new Response(
      JSON.stringify({ token: auth ? auth : 'unknown' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  });
};

const mockErrorWebhook = () => {
  return jest.spyOn(global, 'fetch').mockImplementation( async function (url, options = {}) {
    return new Response('Error123', {
      status: 400,
      headers: { 'Content-Type': 'text/plain' }
    });
  });
};

afterEach(() => {
  jest.restoreAllMocks();
});

describe('PubsubProxy Controller', () => {
  let controller: PubsubProxyController;
  let jwtset: any;
  let logger: any;
  let mockWebhookValue: any;
  let mockMetricValue: any;

  beforeEach(async () => {
    jwtset = {
      generateDeleteSET: jest.fn().mockResolvedValue(TEST_TOKEN),
      generatePasswordSET: jest.fn().mockResolvedValue(TEST_TOKEN),
      generateProfileSET: jest.fn().mockResolvedValue(TEST_TOKEN),
      generateSubscriptionSET: jest.fn().mockResolvedValue(TEST_TOKEN),
    };
    logger = { debug: jest.fn(), error: jest.fn() };
    mockMetricValue = { timing: jest.fn(), increment: jest.fn() };
    const MockMetrics: Provider = {
      provide: 'METRICS',
      useValue: mockMetricValue,
    };
    const MockMozLogger: Provider = {
      provide: MozLoggerService,
      useValue: logger,
    };
    mockWebhookValue = {
      webhooks: { [TEST_CLIENT_ID]: 'http://accounts.firefox.com/webhook' },
      getWebhookForClientId: jest
        .fn()
        .mockReturnValue('http://accounts.firefox.com/webhook'),
    };
    const MockWebhook: Provider = {
      provide: ClientWebhooksService,
      useValue: mockWebhookValue,
    };
    const MockJwtSet: Provider = {
      provide: JwtsetService,
      useValue: jwtset,
    };
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [
            () => ({
              env: 'development',
              pubsub: {
                authenticate: true,
              },
              serviceNotificationQueueUrl:
                'https://us-east-1/queue.|api-domain|/321321321/notifications',
              log: { app: 'test' },
            }),
          ],
        }),
      ],
      controllers: [PubsubProxyController],
      providers: [MockMozLogger, MockMetrics, MockWebhook, MockJwtSet],
    }).compile();

    controller = module.get<PubsubProxyController>(PubsubProxyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('notifies successfully on subscription state change', async () => {
    mockWebhook();
    const message = createValidSubscriptionMessage();
    (controller as any).generateSET = jest.fn().mockResolvedValue(TEST_TOKEN);
    expect.assertions(2);
    let err: any = undefined;

    try {
      await controller.proxy(
        {
          message: { data: message, messageId: 'test-message' },
          subscription: 'test-sub',
        },
        'abc1234'
      );
    } catch (error) {
      err = error;
    }

    expect(err?.getStatus()).toBe(200);
    expect(err?.getResponse()).toEqual({ token: 'Bearer ' + TEST_TOKEN });
  });

  describe('handles common RP events:', () => {
    const eventTypes: { [key: string]: [() => string, string] } = {
      update: [createValidUpdateMessage, 'generateSubscriptionSET'],
      delete: [createValidDeleteMessage, 'generateDeleteSET'],
      password: [createValidPasswordMessage, 'generatePasswordSET'],
      profile: [createValidProfileMessage, 'generateProfileSET'],
    };

    async function notifiesSuccessfully(
      creatFunc: () => string,
      generateFunc: string
    ) {
      let err:
        | {
            getStatus: () => number;
            getResponse: () => { token: string };
          }
        | undefined = undefined;

      mockWebhook();
      const message = creatFunc();
      expect.assertions(3);

      try {
        await controller.proxy(
          {
            message: { data: message, messageId: 'test-message' },
            subscription: 'test-sub',
          },
          'abc1234'
        );
      } catch (error) {
        err = error;
      }

      if (err) {
        const status = err?.getStatus();
        const body = err?.getResponse();
        expect(status).toBe(200);
        expect(body).toEqual({ token: 'Bearer ' + TEST_TOKEN });
      }

      expect(jwtset[generateFunc]).toBeCalledTimes(1);
    }
    for (const [key, value] of Object.entries(eventTypes)) {
      const [creatFunc, generateFunc] = value;
      it(`notifies successfully on ${key}`, async () => {
        await notifiesSuccessfully(creatFunc, generateFunc);
      });
    }
  });

  it('logs an error on invalid message payloads', async () => {
    const message = Buffer.from('invalid payload').toString('base64');
    expect.assertions(3);
    let err: { getStatus: () => number } | undefined = undefined;
    try {
      await controller.proxy(
        {
          message: { data: message, messageId: 'test-message' },
          subscription: 'test-sub',
        },
        'abc1234'
      );
    } catch (error) {
      err = error;
    }

    expect(err?.getStatus()).toBe(400);
    expect(logger.error).toBeCalledTimes(1);
    expect(Sentry.captureException).toBeCalledTimes(1);
  });

  it('records a metric on not found client ids', async () => {
    expect.assertions(2);
    mockWebhookValue.getWebhookForClientId = jest
      .fn()
      .mockReturnValue(undefined);
    let err:
      | { getStatus: () => number; getResponse: () => string }
      | undefined = undefined;
    try {
      await controller.proxy(
        {
          message: {
            data: createValidSubscriptionMessage(),
            messageId: 'test-message',
          },
          subscription: 'test-sub',
        },
        'abc1234'
      );
    } catch (error) {
      err = error;
    }
    expect(err?.getStatus()).toBe(200);
    expect(mockMetricValue.increment).toBeCalledWith('proxy.webhookNotFound', {
      clientId: 'abc1234',
    });
  });

  it('proxies an error code back', async () => {
    mockErrorWebhook();
    const message = createValidSubscriptionMessage();
    expect.assertions(2);
    let err:
      | { getStatus: () => number; getResponse: () => string }
      | undefined = undefined;
    try {
      await controller.proxy(
        {
          message: { data: message, messageId: 'test-message' },
          subscription: 'test-sub',
        },
        'abc1234'
      );
    } catch (error) {
      err = error;
    }

    expect(err?.getStatus()).toBe(400);
    expect(err?.getResponse()).toEqual('Error123');
  });
});
