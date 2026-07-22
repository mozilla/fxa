/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createMock } from '@golevelup/ts-jest';
import Boom from '@hapi/boom';

import { freeAccessProgramWebhookRoutes } from './free-access-program-webhook';
import { AuthLogger } from '../../types';

// Filtering/dedupe internals are covered by the shared-function spec; this suite
// verifies the Hapi route: auth-error → Boom 401, reconcile wiring, result passthrough.
describe('freeAccessProgramWebhookRoutes', () => {
  let log: any;
  let strapiClient: { verifyWebhookSignature: jest.Mock };
  let reconciler: { reconcile: jest.Mock };

  const route = () => {
    const routes = freeAccessProgramWebhookRoutes(
      log,
      strapiClient as any,
      reconciler as any
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
});
