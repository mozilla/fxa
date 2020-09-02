/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { PubsubProxyController } from './pubsub-proxy.controller';
import { MozLoggerService } from '../logger/logger.service';
import { Provider } from '@nestjs/common';
import { ClientWebhooksService } from '../client-webhooks/client-webhooks.service';
import { JwtsetService } from '../jwtset/jwtset.service';
import nock from 'nock';

import {
  DELETE_EVENT_ID,
  PASSWORD_EVENT_ID,
  PROFILE_EVENT_ID,
  SUBSCRIPTION_STATE_EVENT_ID,
} from '../jwtset/set.interface';
import * as dto from '../queueworker/sqs.dto';

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

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.set = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

describe('PubsubProxy Controller', () => {
  let controller: PubsubProxyController;
  let jwtset: any;
  let logger: any;

  const mockWebhook = () => {
    nock('http://accounts.firefox.com')
      .post('/webhook')
      .reply(200, '', {
        'X-AUTH': (req, res, body) => {
          const auth = req.getHeader('authorization');
          return typeof auth === 'string' ? auth : 'unknown';
        },
      });
  };

  beforeEach(async () => {
    jwtset = {
      generateDeleteSET: jest.fn().mockResolvedValue(TEST_TOKEN),
      generatePasswordSET: jest.fn().mockResolvedValue(TEST_TOKEN),
      generateProfileSET: jest.fn().mockResolvedValue(TEST_TOKEN),
      generateSubscriptionSET: jest.fn().mockResolvedValue(TEST_TOKEN),
    };
    logger = { debug: jest.fn(), error: jest.fn() };
    const MockMetrics: Provider = {
      provide: 'METRICS',
      useValue: { timing: jest.fn(), increment: jest.fn() },
    };
    const MockMozLogger: Provider = {
      provide: MozLoggerService,
      useValue: logger,
    };
    const MockWebhook: Provider = {
      provide: ClientWebhooksService,
      useValue: {
        webhooks: { [TEST_CLIENT_ID]: 'http://accounts.firefox.com/webhook' },
      },
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
    const res = mockResponse();
    (controller as any).generateSET = jest.fn().mockResolvedValue(TEST_TOKEN);
    await controller.proxy(
      res as any,
      {
        message: { data: message, messageId: 'test-message' },
        subscription: 'test-sub',
      },
      'abc1234'
    );
    expect(res.set).toBeCalledWith({ 'x-auth': 'Bearer ' + TEST_TOKEN });
  });

  describe('handles common RP events: ', () => {
    const eventTypes: { [key: string]: [() => string, string] } = {
      update: [createValidUpdateMessage, 'generateSubscriptionSET'],
      delete: [createValidDeleteMessage, 'generateDeleteSET'],
      password: [createValidPasswordMessage, 'generatePasswordSET'],
      profile: [createValidProfileMessage, 'generateProfileSET'],
    };
    for (const [key, value] of Object.entries(eventTypes)) {
      const [creatFunc, generateFunc] = value;
      it(`notifies successfully on ${key}`, async () => {
        mockWebhook();
        const message = creatFunc();
        const res = mockResponse();

        await controller.proxy(
          res as any,
          {
            message: { data: message, messageId: 'test-message' },
            subscription: 'test-sub',
          },
          'abc1234'
        );
        expect(res.set).toBeCalledWith({ 'x-auth': 'Bearer ' + TEST_TOKEN });
        expect(jwtset[generateFunc]).toBeCalledTimes(1);
      });
    }
  });

  it('logs an error on invalid message payloads', async () => {
    const message = Buffer.from('invalid payload').toString('base64');
    const res = mockResponse();

    await controller.proxy(
      res as any,
      {
        message: { data: message, messageId: 'test-message' },
        subscription: 'test-sub',
      },
      'abc1234'
    );

    expect(logger.error).toBeCalledTimes(1);
    expect(res.status).toBeCalledWith(400);
  });

  it('proxies an error code back', async () => {
    nock('http://accounts.firefox.com').post('/webhook').reply(400, 'Error123');
    const message = createValidSubscriptionMessage();
    const res = mockResponse();

    await controller.proxy(
      res as any,
      {
        message: { data: message, messageId: 'test-message' },
        subscription: 'test-sub',
      },
      'abc1234'
    );
    expect(res.status).toBeCalledWith(400);
    expect(res.send).toBeCalledWith('Error123');
  });
});
