/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FeatureFlag } from '@fxa/shared/db/mysql/legacy/models/auth';
import { featureFlagsRoutes } from './feature-flags';

jest.mock('@fxa/shared/db/mysql/legacy/models/auth', () => ({
  FeatureFlag: {
    setCacheTtlMs: jest.fn(),
    getFlagMap: jest.fn(),
  },
}));

const mockLog = { begin: jest.fn() } as any;
const mockConfig = { featureFlags: { cacheTtlMs: 10_000 } } as any;

describe('feature-flags routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('pushes the configured TTL into the model', () => {
    featureFlagsRoutes(mockConfig, mockLog);

    expect(FeatureFlag.setCacheTtlMs).toHaveBeenCalledWith(10_000);
  });

  it('serves the flag map unauthenticated', async () => {
    (FeatureFlag.getFlagMap as jest.Mock).mockResolvedValue({
      'new-checkout': true,
    });

    const [route] = featureFlagsRoutes(mockConfig, mockLog);

    expect(route.path).toBe('/feature-flags');
    expect(route.options.auth).toBe(false);
    expect(await route.handler({} as any)).toEqual({ 'new-checkout': true });
  });
});
