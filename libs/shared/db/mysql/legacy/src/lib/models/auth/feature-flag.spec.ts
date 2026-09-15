/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { FeatureFlag, FeatureFlagRow } from './feature-flag';

const TTL_MS = 10_000;

function row(overrides: Partial<FeatureFlagRow> = {}): FeatureFlagRow {
  return {
    name: 'new-checkout',
    enabled: true,
    description: '',
    updatedAt: 1_700_000_000_000,
    updatedBy: 'admin@example.com',
    ...overrides,
  };
}

describe('FeatureFlag flag map cache', () => {
  let findAll: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers({ now: 1_700_000_000_000 });
    findAll = jest.spyOn(FeatureFlag, 'findAll');
    FeatureFlag.setCacheTtlMs(TTL_MS);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
    FeatureFlag.setCacheTtlMs(TTL_MS);
  });

  it('throws until a TTL has been configured', async () => {
    FeatureFlag.setCacheTtlMs(undefined as unknown as number);

    await expect(FeatureFlag.getFlagMap()).rejects.toThrow(
      'cache TTL is not configured'
    );
  });

  it('maps flags to a name/enabled record', async () => {
    findAll.mockResolvedValue([
      row({ name: 'a', enabled: true }),
      row({ name: 'b', enabled: false }),
    ]);

    expect(await FeatureFlag.getFlagMap()).toEqual({
      a: true,
      b: false,
    });
  });

  it('returns an empty record when no flags exist', async () => {
    findAll.mockResolvedValue([]);

    expect(await FeatureFlag.getFlagMap()).toEqual({});
  });

  it('serves repeat reads from cache within the TTL', async () => {
    findAll.mockResolvedValue([row()]);

    await FeatureFlag.getFlagMap();
    jest.advanceTimersByTime(TTL_MS - 1);
    await FeatureFlag.getFlagMap();

    expect(findAll).toHaveBeenCalledTimes(1);
  });

  it('re-reads once the TTL has elapsed', async () => {
    findAll.mockResolvedValue([row({ enabled: true })]);
    await FeatureFlag.getFlagMap();

    findAll.mockResolvedValue([row({ enabled: false })]);
    jest.advanceTimersByTime(TTL_MS + 1);

    expect(await FeatureFlag.getFlagMap()).toEqual({
      'new-checkout': false,
    });
    expect(findAll).toHaveBeenCalledTimes(2);
  });

  it('honours a TTL set after construction', async () => {
    FeatureFlag.setCacheTtlMs(5_000);
    findAll.mockResolvedValue([row()]);

    await FeatureFlag.getFlagMap();
    jest.advanceTimersByTime(5_001);
    await FeatureFlag.getFlagMap();

    expect(findAll).toHaveBeenCalledTimes(2);
  });

  it('reads through on every call when the TTL is zero', async () => {
    FeatureFlag.setCacheTtlMs(0);
    findAll.mockResolvedValue([row()]);

    await FeatureFlag.getFlagMap();
    await FeatureFlag.getFlagMap();
    await FeatureFlag.getFlagMap();

    expect(findAll).toHaveBeenCalledTimes(3);
  });

  it('drops the cache on invalidate', async () => {
    findAll.mockResolvedValue([row()]);

    await FeatureFlag.getFlagMap();
    FeatureFlag.invalidateCache();
    await FeatureFlag.getFlagMap();

    expect(findAll).toHaveBeenCalledTimes(2);
  });
});
