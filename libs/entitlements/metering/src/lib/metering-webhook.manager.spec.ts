/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { VError } from 'verror';

import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';

import { MeteringWebhookManager } from './metering-webhook.manager';
import { MeteringConfig, MockMeteringConfig } from './metering.config';
import {
  EmptyClientSecretError,
  MissingClientSecretError,
  WebhookDispatchError,
} from './metering.error';
import type { WebhookDispatchParams } from './metering.types';

describe('MeteringWebhookManager', () => {
  const SIGNING_CLIENT_ID = 'vpn';
  const SECRET = 'webhook-signing-secret-aaaaaaaaaaaaaaaaa';
  const METERING_CONFIG: MeteringConfig = {
    ...MockMeteringConfig,
    clients: { [SIGNING_CLIENT_ID]: SECRET },
  };

  let meteringWebhookManager: MeteringWebhookManager;
  let logger: { error: jest.Mock; log: jest.Mock };
  let fetchMock: jest.SpyInstance;

  async function build(
    meteringConfig: MeteringConfig = METERING_CONFIG
  ): Promise<MeteringWebhookManager> {
    const moduleRef = await Test.createTestingModule({
      providers: [
        MeteringWebhookManager,
        { provide: MeteringConfig, useValue: meteringConfig },
        { provide: Logger, useValue: logger },
        MockStatsDProvider,
      ],
    }).compile();
    return moduleRef.get(MeteringWebhookManager);
  }

  beforeEach(async () => {
    logger = { error: jest.fn(), log: jest.fn() };
    meteringWebhookManager = await build();
    fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('', { status: 200 }));
  });

  afterEach(() => {
    fetchMock.mockRestore();
  });

  function params(
    overrides: Partial<WebhookDispatchParams> = {}
  ): WebhookDispatchParams {
    return {
      signingClientId: SIGNING_CLIENT_ID,
      url: 'https://relying-party.example/webhook',
      slug: 'vpn-bandwidth',
      subject: 'user-1',
      threshold: 80,
      currentUsage: 85,
      limit: 100,
      grantedAmount: 20,
      unit: 'gigabytes',
      windowStart: new Date('2026-05-01T00:00:00.000Z'),
      windowEnd: new Date('2026-06-01T00:00:00.000Z'),
      idempotencyKey: 'vpn:vpn-bandwidth:user-1:2026-05:80',
      ...overrides,
    };
  }

  async function captureSignatureHeader(
    target: MeteringWebhookManager
  ): Promise<string> {
    await target.dispatch(params());
    return fetchMock.mock.calls[fetchMock.mock.calls.length - 1][1].headers[
      'X-Entitlements-Metering-Signature'
    ];
  }

  describe('dispatch', () => {
    it('produces a different signature header when the client secret is rotated', async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-06-01T00:00:00.000Z'));
      try {
        const first = await captureSignatureHeader(meteringWebhookManager);
        const rotated = await build({
          ...METERING_CONFIG,
          clients: {
            [SIGNING_CLIENT_ID]: 'different-secret-with-enough-entropy-bb',
          },
        });
        fetchMock.mockClear();
        const second = await captureSignatureHeader(rotated);
        expect(first).not.toBe(second);
      } finally {
        jest.clearAllTimers();
        jest.useRealTimers();
      }
    });

    it('POSTs the signed envelope to the configured URL', async () => {
      await meteringWebhookManager.dispatch(params());

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe('https://relying-party.example/webhook');
      expect(init.method).toBe('POST');
      expect(init.headers['Content-Type']).toBe('application/json');
      expect(init.headers['X-Entitlements-Metering-Signature']).toMatch(
        /^v1=[0-9a-f]+$/
      );
      expect(init.signal).toBeInstanceOf(AbortSignal);
      const body = JSON.parse(init.body);
      expect(body).toMatchObject({
        slug: 'vpn-bandwidth',
        userIdentifier: 'user-1',
        threshold: 80,
        currentUsage: 85,
        limit: 100,
        grantedAmount: 20,
        unit: 'gigabytes',
        idempotencyKey: 'vpn:vpn-bandwidth:user-1:2026-05:80',
      });
      expect(body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('resolves on 2xx', async () => {
      fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
      await expect(
        meteringWebhookManager.dispatch(params())
      ).resolves.toBeUndefined();
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('throws WebhookDispatchError on 5xx', async () => {
      fetchMock.mockResolvedValueOnce(new Response('', { status: 503 }));
      await expect(meteringWebhookManager.dispatch(params())).rejects.toThrow(
        WebhookDispatchError
      );
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('names the response status in the error info', async () => {
      fetchMock.mockResolvedValueOnce(new Response('', { status: 400 }));
      expect.assertions(2);
      try {
        await meteringWebhookManager.dispatch(params());
      } catch (err) {
        expect(err).toBeInstanceOf(WebhookDispatchError);
        if (err instanceof WebhookDispatchError) {
          expect(VError.info(err)['status']).toBe(400);
        }
      }
    });

    it('wraps a network error in WebhookDispatchError, keeping the cause message', async () => {
      fetchMock.mockRejectedValueOnce(new Error('ECONNRESET'));
      expect.assertions(2);
      try {
        await meteringWebhookManager.dispatch(params());
      } catch (err) {
        expect(err).toBeInstanceOf(WebhookDispatchError);
        if (err instanceof WebhookDispatchError) {
          expect(err.message).toMatch(/ECONNRESET/);
        }
      }
    });

    it('throws MissingClientSecretError without dispatching when no signing key is configured', async () => {
      await expect(
        meteringWebhookManager.dispatch(
          params({ signingClientId: 'no-such-client' })
        )
      ).rejects.toThrow(MissingClientSecretError);
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe('constructor', () => {
    it('throws when a configured client secret is empty after trimming', async () => {
      await expect(
        build({
          ...METERING_CONFIG,
          clients: { [SIGNING_CLIENT_ID]: '   ' },
        })
      ).rejects.toThrow(EmptyClientSecretError);
    });

    it('trims whitespace-padded secrets so signatures match the auth guard', async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-06-01T00:00:00.000Z'));
      try {
        const padded = await build({
          ...METERING_CONFIG,
          clients: { [SIGNING_CLIENT_ID]: `  ${SECRET}  ` },
        });
        const paddedSignature = await captureSignatureHeader(padded);

        fetchMock.mockClear();
        const trimmedSignature = await captureSignatureHeader(
          meteringWebhookManager
        );

        expect(paddedSignature).toBe(trimmedSignature);
      } finally {
        jest.clearAllTimers();
        jest.useRealTimers();
      }
    });
  });
});
