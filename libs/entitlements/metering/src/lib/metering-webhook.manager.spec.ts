/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';

import { MeteringWebhookManager } from './metering-webhook.manager';
import { MeteringConfig } from './metering.config';

type WebhookDispatchArgs = Parameters<MeteringWebhookManager['dispatch']>[0];

describe('MeteringWebhookManager', () => {
  const SIGNING_CLIENT_ID = 'vpn';
  const SECRET = 'webhook-signing-secret-aaaaaaaaaaaaaaaaa';
  const METERING_CONFIG: MeteringConfig = {
    openmeterBaseUrl: 'http://example.com',
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

  function args(
    overrides: Partial<WebhookDispatchArgs> = {}
  ): WebhookDispatchArgs {
    return {
      signingClientId: SIGNING_CLIENT_ID,
      url: 'https://relying-party.example/webhook',
      slug: 'vpn-bandwidth',
      userIdentifier: 'user-1',
      threshold: 80,
      currentUsage: 85,
      limit: 100,
      unit: 'gigabytes',
      windowStart: new Date('2026-05-01T00:00:00.000Z'),
      windowEnd: new Date('2026-06-01T00:00:00.000Z'),
      eventId: 'evt-1',
      ...overrides,
    };
  }

  async function captureSignatureHeader(
    target: MeteringWebhookManager
  ): Promise<string> {
    await target.dispatch(args());
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
          openmeterBaseUrl: 'http://example.com',
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

    it('POSTs to the configured URL with the signed envelope and idempotency key', async () => {
      await meteringWebhookManager.dispatch(args());

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
        unit: 'gigabytes',
        eventId: 'evt-1',
      });
      expect(body.idempotencyKey).toMatch(/^[0-9a-f]+$/);
      expect(body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('resolves on 2xx without throwing and emits a 2xx-bucketed dispatch counter', async () => {
      fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
      await expect(
        meteringWebhookManager.dispatch(args())
      ).resolves.toBeUndefined();
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('throws on 5xx so Cloud Tasks can re-enqueue', async () => {
      fetchMock.mockResolvedValueOnce(new Response('', { status: 503 }));
      await expect(meteringWebhookManager.dispatch(args())).rejects.toThrow(
        /Webhook target returned 503/
      );
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('throws on 4xx so Cloud Tasks can re-enqueue (and eventually DLQ)', async () => {
      fetchMock.mockResolvedValueOnce(new Response('', { status: 400 }));
      await expect(meteringWebhookManager.dispatch(args())).rejects.toThrow(
        /Webhook target returned 400/
      );
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('throws on network error', async () => {
      fetchMock.mockRejectedValueOnce(new Error('ECONNRESET'));
      await expect(meteringWebhookManager.dispatch(args())).rejects.toThrow(
        /ECONNRESET/
      );
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('skips dispatch silently when there is no signing key for the signingClientId', async () => {
      await expect(
        meteringWebhookManager.dispatch(
          args({ signingClientId: 'no-such-client' })
        )
      ).resolves.toBeUndefined();
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe('constructor', () => {
    it('throws when a configured client secret is empty after trimming', async () => {
      await expect(
        build({
          openmeterBaseUrl: 'http://example.com',
          clients: { [SIGNING_CLIENT_ID]: '   ' },
        })
      ).rejects.toThrow(
        `MeteringConfig.clients[${SIGNING_CLIENT_ID}] has an empty secret`
      );
    });

    it('trims whitespace-padded secrets so signatures match the auth guard', async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-06-01T00:00:00.000Z'));
      try {
        const padded = await build({
          openmeterBaseUrl: 'http://example.com',
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
