/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FeatureFlag } from 'fxa-shared/db/models/auth';
import { featureFlagsRoutes } from './feature-flags';

jest.mock('fxa-shared/db/models/auth', () => ({
  FeatureFlag: {
    setCacheTtlMs: jest.fn(),
    getEnabledFlags: jest.fn(),
  },
}));

const mockLog = { begin: jest.fn() } as any;

const mockConfig = (cacheTtlMs: number) =>
  ({ featureFlags: { cacheTtlMs } }) as any;

describe('feature-flags routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('pushes the configured TTL into the model', () => {
    featureFlagsRoutes(mockConfig(30_000), mockLog);

    expect(FeatureFlag.setCacheTtlMs).toHaveBeenCalledWith(30_000);
  });

  it('serves the enabled flag list unauthenticated', async () => {
    (FeatureFlag.getEnabledFlags as jest.Mock).mockResolvedValue([
      'new-checkout',
    ]);

    const [route] = featureFlagsRoutes(mockConfig(60_000), mockLog);

    expect(route.path).toBe('/feature-flags');
    expect(route.options.auth).toBe(false);
    expect(await route.handler({} as any)).toEqual(['new-checkout']);
  });

  it('sets a public cache header matching the TTL', () => {
    const [route] = featureFlagsRoutes(mockConfig(60_000), mockLog);

    expect(route.options.cache).toEqual({
      expiresIn: 60_000,
      privacy: 'public',
    });
  });

  it('omits the cache option when the TTL is zero', () => {
    const [route] = featureFlagsRoutes(mockConfig(0), mockLog);

    expect(route.options.cache).toBeUndefined();
  });
});
