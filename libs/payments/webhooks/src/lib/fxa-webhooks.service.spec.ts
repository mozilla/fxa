/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import { JWTool, PrivateJWK } from '@fxa/vendored/jwtool';
import { StatsDService } from '@fxa/shared/metrics/statsd';
import type { StatsD } from 'hot-shots';
import { FxaWebhookService } from './fxa-webhooks.service';
import { FxaWebhookConfig } from './fxa-webhooks.config';
import {
  FxaWebhookAuthError,
  FxaWebhookJwksError,
  FxaWebhookValidationError,
} from './fxa-webhooks.error';
import {
  FXA_DELETE_EVENT_URI,
  FXA_METRICS_OPT_IN_EVENT_URI,
  FXA_METRICS_OPT_OUT_EVENT_URI,
  FXA_PASSWORD_EVENT_URI,
  FXA_PROFILE_EVENT_URI,
  FXA_SUBSCRIPTION_STATE_EVENT_URI,
} from './fxa-webhooks.types';

jest.mock('@sentry/nestjs', () => {
  const actual = jest.requireActual('@sentry/nestjs');
  return {
    ...actual,
    captureException: jest.fn(),
  };
});

jest.mock('@type-cacheable/core', () => {
  const noopDecorator =
    () =>
    (
      target: any,
      propertyKey: string | symbol,
      descriptor: PropertyDescriptor
    ) =>
      descriptor;

  const Cacheable = jest.fn(() => noopDecorator);

  const defaultExport = {
    setOptions: jest.fn(),
  };

  return {
    __esModule: true,
    default: defaultExport,
    Cacheable,
  };
});

jest.mock('@fxa/shared/db/type-cacheable', () => ({
  MemoryAdapter: jest.fn().mockImplementation(() => ({})),
  CacheFirstStrategy: jest.fn().mockImplementation(() => ({})),
  StaleWhileRevalidateWithFallbackStrategy: jest
    .fn()
    .mockImplementation(() => ({})),
}));

// Test RSA key pair from packages/fxa-event-broker/src/jwtset/jwtset.service.spec.ts
const TEST_KEY = {
  d: 'nvfTzcMqVr8fa-b3IIFBk0J69sZQsyhKc3jYN5pPG7FdJyA-D5aPNv5zsF64JxNJetAS44cAsGAKN3Kh7LfjvLCtV56Ckg2tkBMn3GrbhE1BX6ObYvMuOBz5FJ9GmTOqSCxotAFRbR6AOBd5PCw--Rls4MylX393TFg6jJTGLkuYGuGHf8ILWyb17hbN0iyT9hME-cgLW1uc_u7oZ0vK9IxGPTblQhr82RBPQDTvZTM4s1wYiXzbJNrI_RGTAhdbwXuoXKiBN4XL0YRDKT0ENVqQLMiBwfdT3sW-M0L6kIv-L8qX3RIhbM3WA_a_LjTOM3WwRcNanSGiAeJLHwE5cQ',
  dp: '5U4HJsH2g_XSGw8mrv5LZ2kvnh7cibWfmB2x_h7ZFGLsXSphG9xSo3KDQqlLw4WiUHZ5kTyL9x-MiaUSxo-yEgtoyUy8C6gGTzQGxUyAq8nvQUq0J3J8kdCvdxM370Is7QmUF97LDogFlYlJ4eY1ASaV39SwwMd0Egf-JsPA9bM',
  dq: 'k65nnWFsWAnPunppcedFZ6x6It1BZhqUiQQUN0Mok2aPiKjSDbQJ8_CospKDoTOgU0i3Bbnfp--PuUNwKO2VZoZ4clD-5vEJ9lz7AxgHMp4lJ-gy0TLEnITBmrYRdJY4aSGZ8L4IiUTFDUvmx8KdzkLGYZqH3cCVDGZANjgXoDU',
  e: 'AQAB',
  'fxa-createdAt': 1557356400,
  kid: '2019-05-08-cd8b15e7a1d6d51e31de4f6aa79e9f9e',
  kty: 'RSA',
  n: 'uJIoiOOZsS7XZ5HuyBTV59YMpm73sF1OwlNgLYJ5l3RHskVp6rR7UCDZCU7tAVSx4mHl1qoqbfUSlVeseY3yuSa7Tz_SW_WDO4ihYelXX5lGF7uxn5KmY1--6p9Gx7oiwgO5EdU6vkh2T4xD1BY4GUpqTLCdYDdAsykhVpNyQiO2tSJrxJLIMAYxUIw6lMHtyJDRe6m_OUAjBm_xyS3JbbTXOoeYbFXXvktqxkxNtmYEDCjdj8v2NGy9z9zMao2KwCmu-S6L6BJid3W0rKNR_yxAQPLSSrqUwyO1wPntR5qVJ3C0n-HeqOZK3M3ObHAFK0vShNZsrY4gPpwUl3BZsw',
  p: '72yifmIgqTJwpU06DyKwnhJbmAXRmKZH3QswH1OvXx_o5jjr9oLLN9xdQeIt3vo2OqlLLeFf8nk0q-kQVU0f1yOB5LAaIxm7SgYA6S1qMfDIc2H8TBnG0-dJ_yNcfef2LPKuDhljiwXN5Z-SadsRbuxh1JcGHqngTJiOSc43PO8',
  q: 'xVlYc0LRkOvQOpl0WSOPQ-0SVYe-v29RYamYlxTvq3mHkpexvERWVlHR94Igz5Taip1pxfhAHCREInJwMtncHnEcLQt-0T62I_BTmjpGzmRLTXx2Slmn-mlRSW_rwrdxeONPzxmJiSZE0dMOln9NBjr6Vp-5-J8TYE8TChoj930',
  qi: 'E5GCQCyG7AGplCUyZPBS4OEW9QTmzJoG42rLZc9HNJPfjE2hrNUJqmjIWy_n3QQZaNJwps_t-PNaLHBwM043yM_neBGPIgGQwOw6YJp_nbUvDaJnHAtDhAaR7jPWQeDqypg0ysrZvWsd2x1BNowFUFNjmHkpejp2ueS6C_hgv_g',
};

const TEST_PUBLIC_KEY = {
  e: TEST_KEY.e,
  kid: TEST_KEY.kid,
  kty: TEST_KEY.kty,
  n: TEST_KEY.n,
};

const TEST_ISSUER = 'https://accounts.firefox.com/';
const TEST_AUDIENCE = 'abc1234';
const TEST_UID = 'uid1234';
const TEST_JWKS_URI = 'https://accounts.firefox.com/jwks';

const privateKey = JWTool.JWK.fromObject(TEST_KEY, {
  iss: TEST_ISSUER,
}) as PrivateJWK;

function signToken(
  events: Record<string, any>,
  overrides: Record<string, any> = {}
): Promise<string> {
  return privateKey.sign({
    aud: TEST_AUDIENCE,
    sub: TEST_UID,
    iat: Date.now() / 1000,
    jti: 'test-jti',
    events,
    ...overrides,
  });
}

function mockFetchForJwks() {
  return jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ keys: [TEST_PUBLIC_KEY] }),
    })
  ) as jest.Mock;
}

describe('FxaWebhookService', () => {
  let service: FxaWebhookService;
  let statsd: { increment: jest.Mock; timing: jest.Mock };
  let logger: { error: jest.Mock; log: jest.Mock };
  let originalFetch: typeof global.fetch;

  beforeEach(async () => {
    originalFetch = global.fetch;
    global.fetch = mockFetchForJwks();

    logger = { error: jest.fn(), log: jest.fn() };
    statsd = { increment: jest.fn(), timing: jest.fn() };

    const module = await Test.createTestingModule({
      providers: [
        { provide: Logger, useValue: logger },
        FxaWebhookService,
        {
          provide: FxaWebhookConfig,
          useValue: {
            fxaWebhookIssuer: TEST_ISSUER,
            fxaWebhookAudience: TEST_AUDIENCE,
            fxaWebhookJwksUri: TEST_JWKS_URI,
          } satisfies FxaWebhookConfig,
        },
        { provide: StatsDService, useValue: statsd as unknown as StatsD },
      ],
    }).compile();

    service = module.get(FxaWebhookService);
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  describe('handleWebhookEvent', () => {
    it('handles password-change event', async () => {
      const token = await signToken({
        [FXA_PASSWORD_EVENT_URI]: { changeTime: Date.now() },
      });

      await service.handleWebhookEvent(`Bearer ${token}`);

      expect(statsd.increment).toHaveBeenCalledWith('fxa.webhook.event', {
        eventType: 'password-change',
      });
      expect(logger.log).toHaveBeenCalledWith(
        'handlePasswordChange',
        expect.objectContaining({ sub: TEST_UID })
      );
    });

    it('handles profile-change event', async () => {
      const token = await signToken({
        [FXA_PROFILE_EVENT_URI]: {
          email: 'test@mozilla.com',
          locale: 'en-US',
        },
      });

      await service.handleWebhookEvent(`Bearer ${token}`);

      expect(statsd.increment).toHaveBeenCalledWith('fxa.webhook.event', {
        eventType: 'profile-change',
      });
      expect(logger.log).toHaveBeenCalledWith(
        'handleProfileChange',
        expect.objectContaining({ sub: TEST_UID })
      );
    });

    it('handles subscription-state-change event', async () => {
      const token = await signToken({
        [FXA_SUBSCRIPTION_STATE_EVENT_URI]: {
          capabilities: ['cap1'],
          isActive: true,
          changeTime: Date.now(),
        },
      });

      await service.handleWebhookEvent(`Bearer ${token}`);

      expect(statsd.increment).toHaveBeenCalledWith('fxa.webhook.event', {
        eventType: 'subscription-state-change',
      });
      expect(logger.log).toHaveBeenCalledWith(
        'handleSubscriptionStateChange',
        expect.objectContaining({ sub: TEST_UID })
      );
    });

    it('handles delete-user event', async () => {
      const token = await signToken({
        [FXA_DELETE_EVENT_URI]: {},
      });

      await service.handleWebhookEvent(`Bearer ${token}`);

      expect(statsd.increment).toHaveBeenCalledWith('fxa.webhook.event', {
        eventType: 'delete-user',
      });
      expect(logger.log).toHaveBeenCalledWith(
        'handleDeleteUser',
        expect.objectContaining({ sub: TEST_UID })
      );
    });

    it('handles metrics-opt-out event', async () => {
      const token = await signToken({
        [FXA_METRICS_OPT_OUT_EVENT_URI]: {},
      });

      await service.handleWebhookEvent(`Bearer ${token}`);

      expect(statsd.increment).toHaveBeenCalledWith('fxa.webhook.event', {
        eventType: 'metrics-opt-out',
      });
      expect(logger.log).toHaveBeenCalledWith(
        'handleMetricsOptOut',
        expect.objectContaining({ sub: TEST_UID })
      );
    });

    it('handles metrics-opt-in event', async () => {
      const token = await signToken({
        [FXA_METRICS_OPT_IN_EVENT_URI]: {},
      });

      await service.handleWebhookEvent(`Bearer ${token}`);

      expect(statsd.increment).toHaveBeenCalledWith('fxa.webhook.event', {
        eventType: 'metrics-opt-in',
      });
      expect(logger.log).toHaveBeenCalledWith(
        'handleMetricsOptIn',
        expect.objectContaining({ sub: TEST_UID })
      );
    });

    it('handles multiple events in a single SET', async () => {
      const token = await signToken({
        [FXA_PASSWORD_EVENT_URI]: { changeTime: Date.now() },
        [FXA_PROFILE_EVENT_URI]: { email: 'test@mozilla.com' },
      });

      await service.handleWebhookEvent(`Bearer ${token}`);

      expect(statsd.increment).toHaveBeenCalledWith('fxa.webhook.event', {
        eventType: 'password-change',
      });
      expect(statsd.increment).toHaveBeenCalledWith('fxa.webhook.event', {
        eventType: 'profile-change',
      });
    });

    it('rejects missing authorization header', async () => {
      await expect(
        service.handleWebhookEvent(undefined as unknown as string)
      ).rejects.toThrow(FxaWebhookAuthError);

      expect(statsd.increment).toHaveBeenCalledWith(
        'fxa.webhook.auth.error',
        { reason: 'missing_token' }
      );
      expect(Sentry.captureException).toHaveBeenCalled();
    });

    it('rejects malformed authorization header', async () => {
      await expect(
        service.handleWebhookEvent('not-a-bearer-token')
      ).rejects.toThrow(FxaWebhookAuthError);

      expect(statsd.increment).toHaveBeenCalledWith(
        'fxa.webhook.auth.error',
        { reason: 'missing_token' }
      );
      expect(Sentry.captureException).toHaveBeenCalled();
    });

    it('rejects invalid JWT signature', async () => {
      const token = await signToken({
        [FXA_DELETE_EVENT_URI]: {},
      });
      // Corrupt the signature
      const corrupted = token.slice(0, -5) + 'XXXXX';

      await expect(
        service.handleWebhookEvent(`Bearer ${corrupted}`)
      ).rejects.toThrow(FxaWebhookAuthError);

      expect(statsd.increment).toHaveBeenCalledWith(
        'fxa.webhook.auth.error',
        { reason: 'invalid_token' }
      );
      expect(Sentry.captureException).toHaveBeenCalled();
    });

    it('rejects wrong issuer', async () => {
      // Spread to avoid mutating the shared TEST_KEY (addExtras mutates in-place)
      const wrongIssuerKey = JWTool.JWK.fromObject({ ...TEST_KEY }, {
        iss: 'https://wrong-issuer.example.com/',
      }) as PrivateJWK;
      const token = await wrongIssuerKey.sign({
        aud: TEST_AUDIENCE,
        sub: TEST_UID,
        iat: Date.now() / 1000,
        jti: 'test-jti',
        events: { [FXA_DELETE_EVENT_URI]: {} },
      });

      await expect(
        service.handleWebhookEvent(`Bearer ${token}`)
      ).rejects.toThrow(FxaWebhookAuthError);

      expect(statsd.increment).toHaveBeenCalledWith(
        'fxa.webhook.auth.error',
        { reason: 'invalid_issuer' }
      );
      expect(Sentry.captureException).toHaveBeenCalled();
    });

    it('rejects wrong audience', async () => {
      const token = await signToken(
        { [FXA_DELETE_EVENT_URI]: {} },
        { aud: 'wrong-audience' }
      );

      await expect(
        service.handleWebhookEvent(`Bearer ${token}`)
      ).rejects.toThrow(FxaWebhookAuthError);

      expect(statsd.increment).toHaveBeenCalledWith(
        'fxa.webhook.auth.error',
        { reason: 'invalid_audience' }
      );
      expect(Sentry.captureException).toHaveBeenCalled();
    });

    it('captures unhandled event types in Sentry and StatsD', async () => {
      const unknownUri = 'https://schemas.accounts.firefox.com/event/unknown';
      const token = await signToken({
        [unknownUri]: {},
      });

      await service.handleWebhookEvent(`Bearer ${token}`);

      expect(statsd.increment).toHaveBeenCalledWith(
        'fxa.webhook.unhandled_event'
      );
      expect(Sentry.captureException).toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalled();
    });

    it('rejects SET payload with missing events field', async () => {
      const token = await privateKey.sign({
        aud: TEST_AUDIENCE,
        sub: TEST_UID,
        iat: Date.now() / 1000,
        jti: 'test-jti',
      });

      await expect(
        service.handleWebhookEvent(`Bearer ${token}`)
      ).rejects.toThrow(FxaWebhookValidationError);

      expect(statsd.increment).toHaveBeenCalledWith(
        'fxa.webhook.validation.error',
        { context: 'SET payload' }
      );
    });

    it('rejects password-change event with missing changeTime', async () => {
      const token = await signToken({
        [FXA_PASSWORD_EVENT_URI]: {},
      });

      await expect(
        service.handleWebhookEvent(`Bearer ${token}`)
      ).rejects.toThrow(FxaWebhookValidationError);

      expect(statsd.increment).toHaveBeenCalledWith(
        'fxa.webhook.validation.error',
        { context: FXA_PASSWORD_EVENT_URI }
      );
    });

    it('rejects password-change event with non-numeric changeTime', async () => {
      const token = await signToken({
        [FXA_PASSWORD_EVENT_URI]: { changeTime: 'not-a-number' },
      });

      await expect(
        service.handleWebhookEvent(`Bearer ${token}`)
      ).rejects.toThrow(FxaWebhookValidationError);
    });

    it('rejects subscription-state-change with missing capabilities', async () => {
      const token = await signToken({
        [FXA_SUBSCRIPTION_STATE_EVENT_URI]: {
          isActive: true,
          changeTime: Date.now(),
        },
      });

      await expect(
        service.handleWebhookEvent(`Bearer ${token}`)
      ).rejects.toThrow(FxaWebhookValidationError);
    });

    it('rejects subscription-state-change with non-boolean isActive', async () => {
      const token = await signToken({
        [FXA_SUBSCRIPTION_STATE_EVENT_URI]: {
          capabilities: ['cap1'],
          isActive: 'yes',
          changeTime: Date.now(),
        },
      });

      await expect(
        service.handleWebhookEvent(`Bearer ${token}`)
      ).rejects.toThrow(FxaWebhookValidationError);
    });

    it('rejects profile-change event with non-string email', async () => {
      const token = await signToken({
        [FXA_PROFILE_EVENT_URI]: { email: 12345 },
      });

      await expect(
        service.handleWebhookEvent(`Bearer ${token}`)
      ).rejects.toThrow(FxaWebhookValidationError);
    });
  });

  describe('JWKS fetching', () => {
    it('fetches JWKS on each request', async () => {
      const token = await signToken({ [FXA_DELETE_EVENT_URI]: {} });

      await service.handleWebhookEvent(`Bearer ${token}`);
      expect(global.fetch).toHaveBeenCalledTimes(1);

      const token2 = await signToken({ [FXA_DELETE_EVENT_URI]: {} });
      await service.handleWebhookEvent(`Bearer ${token2}`);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('throws FxaWebhookJwksError when JWKS fetch fails', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({ ok: false, status: 500 })
      ) as jest.Mock;

      const token = await signToken({ [FXA_DELETE_EVENT_URI]: {} });

      await expect(
        service.handleWebhookEvent(`Bearer ${token}`)
      ).rejects.toThrow(FxaWebhookJwksError);

      expect(statsd.increment).toHaveBeenCalledWith(
        'fxa.webhook.jwks.error'
      );
    });

    it('throws FxaWebhookAuthError with unknown_kid when kid is not in JWKS', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              keys: [{ ...TEST_PUBLIC_KEY, kid: 'different-kid' }],
            }),
        })
      ) as jest.Mock;

      const token = await signToken({ [FXA_DELETE_EVENT_URI]: {} });

      await expect(
        service.handleWebhookEvent(`Bearer ${token}`)
      ).rejects.toThrow(FxaWebhookAuthError);

      expect(statsd.increment).toHaveBeenCalledWith(
        'fxa.webhook.auth.error',
        { reason: 'unknown_kid' }
      );
    });
  });
});
