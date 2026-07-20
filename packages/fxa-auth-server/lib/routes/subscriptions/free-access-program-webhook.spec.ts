/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createMock } from '@golevelup/ts-jest';
import Boom from '@hapi/boom';

import { FreeAccessProgramWebhookHandler } from './free-access-program-webhook';
import { AuthLogger } from '../../types';

describe('FreeAccessProgramWebhookHandler', () => {
  let handler: FreeAccessProgramWebhookHandler;
  let log: any;
  let strapiClient: { verifyWebhookSignature: jest.Mock };
  let reconciler: { reconcile: jest.Mock };

  beforeEach(() => {
    log = createMock<AuthLogger>();
    strapiClient = { verifyWebhookSignature: jest.fn().mockReturnValue(true) };
    reconciler = {
      reconcile: jest.fn().mockResolvedValue({ changed: 0 }),
    };
    handler = new FreeAccessProgramWebhookHandler(
      log,
      strapiClient as any,
      reconciler as any
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function buildRequest(overrides: Record<string, unknown> = {}): any {
    return {
      headers: { authorization: 'Bearer secret' },
      payload: {
        event: 'entry.publish',
        model: 'access',
        entry: { documentId: 'ent-1' },
        ...overrides,
      },
    };
  }

  it('throws unauthorized when the Strapi signature is invalid', async () => {
    strapiClient.verifyWebhookSignature.mockReturnValue(false);

    await expect(handler.postAccess(buildRequest())).rejects.toMatchObject({
      isBoom: true,
      output: { statusCode: 401 },
    });
    expect(reconciler.reconcile).not.toHaveBeenCalled();
  });

  it('throws unauthorized for an empty authorization header', async () => {
    strapiClient.verifyWebhookSignature.mockReturnValue(false);
    const req = buildRequest();
    req.headers.authorization = '';

    await expect(handler.postAccess(req)).rejects.toThrow(
      Boom.unauthorized('Invalid Strapi webhook signature')
    );
  });

  it('skips with reason "model" when the payload is not for access', async () => {
    const result = await handler.postAccess(
      buildRequest({ model: 'something-else' })
    );
    expect(result).toEqual({ handled: false, reason: 'model' });
    expect(reconciler.reconcile).not.toHaveBeenCalled();
  });

  it('skips with reason "no_document_id" when entry.documentId is missing', async () => {
    const result = await handler.postAccess(buildRequest({ entry: {} }));
    expect(result).toEqual({ handled: false, reason: 'no_document_id' });
    expect(reconciler.reconcile).not.toHaveBeenCalled();
  });

  it.each([
    ['entry.publish'],
    ['entry.update'],
    ['entry.unpublish'],
    ['entry.delete'],
  ])('dispatches a %s event to reconciler.reconcile()', async (event) => {
    const result = await handler.postAccess(buildRequest({ event }));
    expect(reconciler.reconcile).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ handled: true });
  });

  it('skips with reason "event" for unknown event types', async () => {
    const result = await handler.postAccess(
      buildRequest({ event: 'entry.something-else' })
    );
    expect(result).toEqual({ handled: false, reason: 'event' });
    expect(reconciler.reconcile).not.toHaveBeenCalled();
  });

  it('returns 200 even when the reconciler throws (Strapi must not retry)', async () => {
    reconciler.reconcile.mockRejectedValue(new Error('boom'));
    const result = await handler.postAccess(buildRequest());
    expect(result).toEqual({ handled: true });
    expect(log.error).toHaveBeenCalled();
  });

  describe('replay dedupe', () => {
    it('dedupes a second identical webhook on (event, documentId, createdAt)', async () => {
      const payload = {
        event: 'entry.publish',
        model: 'access',
        createdAt: '2026-06-23T12:00:00.000Z',
        entry: { documentId: 'ent-1' },
      };

      const first = await handler.postAccess(buildRequest(payload));
      const second = await handler.postAccess(buildRequest(payload));

      expect(reconciler.reconcile).toHaveBeenCalledTimes(1);
      expect(first).toEqual({ handled: true });
      expect(second).toEqual({ handled: true, dedupe: true });
    });

    it('does not dedupe webhooks with different createdAt timestamps', async () => {
      await handler.postAccess(
        buildRequest({
          createdAt: '2026-06-23T12:00:00.000Z',
          entry: { documentId: 'ent-1' },
        })
      );
      await handler.postAccess(
        buildRequest({
          createdAt: '2026-06-23T12:00:01.000Z',
          entry: { documentId: 'ent-1' },
        })
      );

      expect(reconciler.reconcile).toHaveBeenCalledTimes(2);
    });

    it('does not dedupe events that short-circuited before the dedupe check', async () => {
      await handler.postAccess(buildRequest({ model: 'other' }));
      const second = await handler.postAccess(buildRequest({ model: 'other' }));
      expect(second).toEqual({ handled: false, reason: 'model' });
    });

    it('re-accepts a payload after the dedupe TTL elapses', async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-06-23T12:00:00.000Z'));
      const payload = {
        event: 'entry.publish',
        model: 'access',
        createdAt: '2026-06-23T12:00:00.000Z',
        entry: { documentId: 'ent-1' },
      };

      await handler.postAccess(buildRequest(payload));
      jest.setSystemTime(new Date('2026-06-23T12:01:01.000Z')); // +61s
      const second = await handler.postAccess(buildRequest(payload));

      expect(reconciler.reconcile).toHaveBeenCalledTimes(2);
      expect(second).toEqual({ handled: true });
      jest.useRealTimers();
    });
  });
});
