/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import jwtool from 'fxa-jwtool';

import { JwtsetService } from './jwtset.service';
import {
  PASSWORD_CHANGE_EVENT,
  PROFILE_CHANGE_EVENT,
  SUBSCRIPTION_UPDATE_EVENT,
  DELETE_EVENT,
} from '../queueworker/sqs.dto';

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
    'E5GCQCyG7AGplCUyZPBS4OEW9QTmzJoG42rLZc9HNJPfjE2hrNUJqmjIWy_n3QQZaNJwps_t-PNaLHBwM043yM_neBGPIgGQwOw6YJp_nbUvDaJnHAtDhAaR7jPWQeDqypg0ysrZvWsd2x1BNowFUFNjmHkpejp2ueS6C_hgv_g',
};
const TEST_PUBLIC_KEY = {
  e: TEST_KEY.e,
  kid: TEST_KEY.kid,
  kty: TEST_KEY.kty,
  n: TEST_KEY.n,
};
const TEST_CLIENT_ID = 'abc1234';
const PUBLIC_JWT = jwtool.JWK.fromObject(TEST_PUBLIC_KEY);
const CHANGE_TIME = Date.now();

describe('JwtsetService', () => {
  let service: JwtsetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [() => ({ openid: { issuer: 'test', key: TEST_KEY } })],
        }),
      ],
      providers: [JwtsetService],
    }).compile();

    service = module.get<JwtsetService>(JwtsetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generates', () => {
    const eventTypes = {
      password: [PASSWORD_CHANGE_EVENT, 'generatePasswordSET'],
      profile: [PROFILE_CHANGE_EVENT, 'generateProfileSET'],
      delete: [DELETE_EVENT, 'generateDeleteSET'],
    };

    for (const [key, value] of Object.entries(eventTypes)) {
      const [event, method] = value;
      it(key + ' SET', async () => {
        const evt = {
          clientId: TEST_CLIENT_ID,
          changeTime: CHANGE_TIME,
          event,
          uid: 'uid1234',
        };
        const token = await (service as any)[method](evt);
        const payload = await PUBLIC_JWT.verify(token);
        expect(payload.aud).toBe(TEST_CLIENT_ID);
        expect(payload.sub).toBe('uid1234');
        expect(payload.iss).toBe('test');
      });
    }

    it('subscription SET', async () => {
      const event = {
        clientId: TEST_CLIENT_ID,
        changeTime: CHANGE_TIME,
        event: SUBSCRIPTION_UPDATE_EVENT,
        uid: 'uid1234',
        isActive: true,
        capabilities: ['cap1', 'cap2'],
      };
      const token = await service.generateSubscriptionSET(event);
      const payload = await PUBLIC_JWT.verify(token);
      expect(payload.aud).toBe(TEST_CLIENT_ID);
      expect(payload.sub).toBe('uid1234');
      expect(payload.iss).toBe('test');
    });
  });
});
