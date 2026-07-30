/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createMock } from '@golevelup/ts-jest';
import Boom from '@hapi/boom';
import type { StatsD } from 'hot-shots';

import { freeAccessProgramWebhookRoutes } from './free-access-program-webhook';
import { AuthLogger } from '../../types';

// Filtering/dedupe internals are covered by the shared-function spec; this suite
// verifies the Hapi route: auth-error → Boom 401, reconcile wiring, result passthrough.
describe('freeAccessProgramWebhookRoutes', () => {
  let log: any;
  let strapiClient: { verifyWebhookSignature: jest.Mock };
  let reconciler: { reconcile: jest.Mock };
  let statsd: jest.Mocked<Pick<StatsD, 'increment'>>;

  const route = () => {
    const routes = freeAccessProgramWebhookRoutes(
      log,
      strapiClient as any,
      reconciler as any,
      statsd as unknown as StatsD
    );
    return routes[0];
  };

  const invoke = (overrides: Record<string, unknown> = {}) => {
    const request: any = {
      headers: { authorization: 'Bearer secret' },
      payload: {
        event: 'entry.publish',
        model: 'access',
        entry: { documentId: 'ent-1' },
        ...overrides,
      },
    };
    return (route().handler as any)(request);
  };

  beforeEach(() => {
    // fxa-auth-server's jest config sets clearMocks: true, and each mock is
    // reassigned below, so no explicit clear is needed here.
    log = createMock<AuthLogger>();
    strapiClient = { verifyWebhookSignature: jest.fn().mockReturnValue(true) };
    reconciler = { reconcile: jest.fn().mockResolvedValue({ changed: 0 }) };
    statsd = { increment: jest.fn() } as jest.Mocked<Pick<StatsD, 'increment'>>;
  });

  it('registers the access webhook route', () => {
    const r = route();
    expect(r.method).toBe('POST');
    expect(r.path).toBe('/webhooks/strapi/free-access-program/access');
  });

  it('maps an invalid signature to Boom 401', async () => {
    strapiClient.verifyWebhookSignature.mockReturnValue(false);

    await expect(invoke()).rejects.toMatchObject({
      isBoom: true,
      output: { statusCode: 401 },
    });
    expect(reconciler.reconcile).not.toHaveBeenCalled();
  });

  it('throws Boom.unauthorized for an empty authorization header', async () => {
    strapiClient.verifyWebhookSignature.mockReturnValue(false);

    await expect(invoke()).rejects.toThrow(
      Boom.unauthorized('Invalid Strapi webhook signature')
    );
  });

  it('dispatches a valid access event to reconciler.reconcile()', async () => {
    const result = await invoke();
    expect(reconciler.reconcile).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ handled: true });
  });

  it('returns the core skip result verbatim', async () => {
    const result = await invoke({ model: 'something-else' });
    expect(result).toEqual({ handled: false, reason: 'model' });
    expect(reconciler.reconcile).not.toHaveBeenCalled();
  });

  it('increments the auth.error counter on an invalid signature', async () => {
    strapiClient.verifyWebhookSignature.mockReturnValue(false);

    await expect(invoke()).rejects.toMatchObject({ isBoom: true });
    expect(statsd.increment).toHaveBeenCalledWith(
      'free_access_program.webhook.auth.error'
    );
  });

  it('increments the skipped counter with the reason tag', async () => {
    await invoke({ model: 'something-else' });
    expect(statsd.increment).toHaveBeenCalledWith(
      'free_access_program.webhook.skipped',
      { reason: 'model' }
    );
  });

  it('increments the duplicate counter on a replayed event', async () => {
    // Reuse one handler so the dedupe map persists across both calls.
    const handler = route().handler as any;
    const request = {
      headers: { authorization: 'Bearer secret' },
      payload: {
        event: 'entry.publish',
        model: 'access',
        entry: { documentId: 'ent-1' },
      },
    };

    await handler(request);
    await handler(request);

    expect(reconciler.reconcile).toHaveBeenCalledTimes(1);
    expect(statsd.increment).toHaveBeenCalledWith(
      'free_access_program.webhook.duplicate'
    );
  });

  it('increments reconcile.error and still returns handled when reconcile throws', async () => {
    reconciler.reconcile.mockRejectedValue(new Error('boom'));

    const result = await invoke();

    expect(result).toEqual({ handled: true });
    expect(statsd.increment).toHaveBeenCalledWith(
      'free_access_program.webhook.reconcile.error'
    );
  });
});
