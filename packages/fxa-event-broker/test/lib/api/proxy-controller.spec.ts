/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import hapi from '@hapi/hapi';
import { assert as cassert } from 'chai';
import jwtool from 'fxa-jwtool';
import { StatsD } from 'hot-shots';
import 'mocha';
import { Logger } from 'mozlog';
import nock from 'nock';
import { assert, SinonSpy } from 'sinon';
import sinon from 'sinon';
import { stubInterface } from 'ts-sinon';

import Config from '../../../config';
import { DELETE_USER_EVENT_ID, SUBSCRIPTION_STATE_EVENT_ID } from '../../../lib/jwts';
import * as proxyserver from '../../../lib/proxy-server';
import { ClientWebhookService } from '../../../lib/selfUpdatingService/clientWebhookService';
import { DELETE_EVENT, SUBSCRIPTION_UPDATE_EVENT } from '../../../lib/serviceNotifications';

const TEST_KEY = {
  d:
    'nvfTzcMqVr8fa-b3IIFBk0J69sZQsyhKc3jYN5pPG7FdJyA-D5aPNv5zsF64JxNJetAS44cAsGAKN3Kh7LfjvLCtV56Ckg2tkBMn3GrbhE1BX6ObYvMuOBz5FJ9GmTOqSCxotAFRbR6AOBd5PCw--Rls4MylX393TFg6jJTGLkuYGuGHf8ILWyb17hbN0iyT9hME-cgLW1uc_u7oZ0vK9IxGPTblQhr82RBPQDTvZTM4s1wYiXzbJNrI_RGTAhdbwXuoXKiBN4XL0YRDKT0ENVqQLMiBwfdT3sW-M0L6kIv-L8qX3RIhbM3WA_a_LjTOM3WwRcNanSGiAeJLHwE5cQ',
  dp:
    '5U4HJsH2g_XSGw8mrv5LZ2kvnh7cibWfmB2x_h7ZFGLsXSphG9xSo3KDQqlLw4WiUHZ5kTyL9x-MiaUSxo-yEgtoyUy8C6gGTzQGxUyAq8nvQUq0J3J8kdCvdxM370Is7QmUF97LDogFlYlJ4eY1ASaV39SwwMd0Egf-JsPA9bM',
  dq:
    'k65nnWFsWAnPunppcedFZ6x6It1BZhqUiQQUN0Mok2aPiKjSDbQJ8_CospKDoTOgU0i3Bbnfp--PuUNwKO2VZoZ4clD-5vEJ9lz7AxgHMp4lJ-gy0TLEnITBmrYRdJY4aSGZ8L4IiUTFDUvmx8KdzkLGYZqH3cCVDGZANjgXoDU',
  e: 'AQAB',
  'fxa-createdAt': 1557356400,
  kid: '2019-05-08-cd8b15e7a1d6d51e31de4f6aa79e9f9e',
  kty: 'RSA',
  n:
    'uJIoiOOZsS7XZ5HuyBTV59YMpm73sF1OwlNgLYJ5l3RHskVp6rR7UCDZCU7tAVSx4mHl1qoqbfUSlVeseY3yuSa7Tz_SW_WDO4ihYelXX5lGF7uxn5KmY1--6p9Gx7oiwgO5EdU6vkh2T4xD1BY4GUpqTLCdYDdAsykhVpNyQiO2tSJrxJLIMAYxUIw6lMHtyJDRe6m_OUAjBm_xyS3JbbTXOoeYbFXXvktqxkxNtmYEDCjdj8v2NGy9z9zMao2KwCmu-S6L6BJid3W0rKNR_yxAQPLSSrqUwyO1wPntR5qVJ3C0n-HeqOZK3M3ObHAFK0vShNZsrY4gPpwUl3BZsw',
  p:
    '72yifmIgqTJwpU06DyKwnhJbmAXRmKZH3QswH1OvXx_o5jjr9oLLN9xdQeIt3vo2OqlLLeFf8nk0q-kQVU0f1yOB5LAaIxm7SgYA6S1qMfDIc2H8TBnG0-dJ_yNcfef2LPKuDhljiwXN5Z-SadsRbuxh1JcGHqngTJiOSc43PO8',
  q:
    'xVlYc0LRkOvQOpl0WSOPQ-0SVYe-v29RYamYlxTvq3mHkpexvERWVlHR94Igz5Taip1pxfhAHCREInJwMtncHnEcLQt-0T62I_BTmjpGzmRLTXx2Slmn-mlRSW_rwrdxeONPzxmJiSZE0dMOln9NBjr6Vp-5-J8TYE8TChoj930',
  qi:
    'E5GCQCyG7AGplCUyZPBS4OEW9QTmzJoG42rLZc9HNJPfjE2hrNUJqmjIWy_n3QQZaNJwps_t-PNaLHBwM043yM_neBGPIgGQwOw6YJp_nbUvDaJnHAtDhAaR7jPWQeDqypg0ysrZvWsd2x1BNowFUFNjmHkpejp2ueS6C_hgv_g'
};
const TEST_PUBLIC_KEY = {
  e: TEST_KEY.e,
  kid: TEST_KEY.kid,
  kty: TEST_KEY.kty,
  n: TEST_KEY.n
};
const TEST_CLIENT_ID = 'abc1234';
const PUBLIC_JWT = jwtool.JWK.fromObject(TEST_PUBLIC_KEY);

describe('Proxy Controller', () => {
  let logger: Logger;
  let metrics: StatsD;
  let server: hapi.Server;
  let webhookService: ClientWebhookService;

  const mockWebhook = () => {
    nock('http://accounts.firefox.com')
      .post('/webhook')
      .reply(200, '', {
        'X-AUTH': (req, res, body) => {
          const auth = req.getHeader('authorization');
          return typeof auth === 'string' ? auth : 'unknown';
        }
      });
  };

  const createValidSubscriptionMessage = (): string => {
    return Buffer.from(
      JSON.stringify({
        capabilities: ['cap1', 'cap2'],
        changeTime: Math.trunc(Date.now() / 1000),
        event: SUBSCRIPTION_UPDATE_EVENT,
        isActive: true,
        uid: 'uid1234'
      })
    ).toString('base64');
  };

  const createValidDeleteMessage = (): string => {
    return Buffer.from(
      JSON.stringify({
        event: DELETE_EVENT,
        uid: 'uid1234'
      })
    ).toString('base64');
  };

  beforeEach(async () => {
    logger = stubInterface<Logger>();
    metrics = new StatsD({ mock: true });
    webhookService = stubInterface<ClientWebhookService>({
      serviceData: {},
      start: Promise.resolve()
    });
    (webhookService.serviceData as sinon.SinonStub).returns({
      [TEST_CLIENT_ID]: 'http://accounts.firefox.com/webhook'
    });

    server = await proxyserver.proxyServerInit(
      {
        env: 'development',
        openid: { issuer: 'testing', key: TEST_KEY },
        port: 8099,
        pubsub: { ...Config.get('pubsub'), authenticate: false }
      },
      logger,
      metrics,
      webhookService
    );
    await server.start();
  });

  afterEach(async () => {
    await server.stop();
  });

  it('has a heartbeat', async () => {
    const result = await server.inject({
      method: 'GET',
      url: '/__lbheartbeat__'
    });
    cassert.equal(result.statusCode, 200);
  });

  it('has a version', async () => {
    const result = await server.inject({
      method: 'GET',
      url: '/__version__'
    });
    cassert.equal(result.statusCode, 200);
    cassert.equal(result.headers['content-type'], 'application/json; charset=utf-8');
    cassert.deepEqual(Object.keys(JSON.parse(result.payload)).sort(), [
      'commit',
      'source',
      'version'
    ]);
  });

  it('notifies successfully on subscription state change', async () => {
    mockWebhook();
    const message = createValidSubscriptionMessage();

    const result = await server.inject({
      method: 'POST',
      payload: JSON.stringify({
        message: { data: message, messageId: 'test-message' },
        subscription: 'test-sub'
      }),
      url: '/v1/proxy/abc1234'
    });
    const bearer = result.headers['x-auth'] as string;
    const token = (bearer.match(/Bearer (.*)/) as string[])[1];

    const payload = await PUBLIC_JWT.verify(token);
    cassert.equal(payload.aud, 'abc1234');
    cassert.equal(payload.sub, 'uid1234');
    cassert.equal(payload.iss, 'testing');
    cassert.deepEqual(payload.events[SUBSCRIPTION_STATE_EVENT_ID].capabilities, ['cap1', 'cap2']);
    cassert.equal(payload.events[SUBSCRIPTION_STATE_EVENT_ID].isActive, true);
  });

  it('notifies successfully on delete', async () => {
    mockWebhook();
    const message = createValidDeleteMessage();

    const result = await server.inject({
      method: 'POST',
      payload: JSON.stringify({
        message: { data: message, messageId: 'test-message' },
        subscription: 'test-sub'
      }),
      url: '/v1/proxy/abc1234'
    });
    const bearer = result.headers['x-auth'] as string;
    const token = (bearer.match(/Bearer (.*)/) as string[])[1];

    const payload = await PUBLIC_JWT.verify(token);
    cassert.equal(payload.aud, 'abc1234');
    cassert.equal(payload.sub, 'uid1234');
    cassert.equal(payload.iss, 'testing');
    cassert.deepEqual(payload.events[DELETE_USER_EVENT_ID], {});
  });

  it('logs an error on invalid message payloads', async () => {
    const message = Buffer.from('invalid payload').toString('base64');
    const result = await server.inject({
      method: 'POST',
      payload: JSON.stringify({
        message: { data: message, messageId: 'test-message' },
        subscription: 'test-sub'
      }),
      url: '/v1/proxy/abc1234'
    });

    assert.calledOnce(logger.error as SinonSpy);
    cassert.equal(result.statusCode, 400);
  });

  it('proxies an error code back', async () => {
    nock('http://accounts.firefox.com')
      .post('/webhook')
      .reply(400, 'Error123');
    const message = createValidSubscriptionMessage();
    const result = await server.inject({
      method: 'POST',
      payload: JSON.stringify({
        message: { data: message, messageId: 'test-message' },
        subscription: 'test-sub'
      }),
      url: '/v1/proxy/abc1234'
    });
    cassert.equal(result.statusCode, 400);
    cassert.equal(result.payload, 'Error123');
  });

  it('doesnt accept invalid payloads', async () => {
    const message = createValidSubscriptionMessage();
    const result = await server.inject({
      method: 'POST',
      payload: JSON.stringify({
        message: { data: message }
      }),
      url: '/v1/proxy/abc1234'
    });
    cassert.equal(result.statusCode, 400);
    cassert.deepEqual(JSON.parse(result.payload), {
      error: 'Bad Request',
      message: 'Invalid request payload input',
      statusCode: 400
    });
  });
});
