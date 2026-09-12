/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import 'mocha';

import { assert } from 'chai';
import sinon from 'sinon';

import {
  DEFAULT_CACHE_TTL_MS,
  FeatureFlag,
  FeatureFlagRow,
} from '../../../../db/models/auth/feature-flag';

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

describe('FeatureFlag enabled flag cache', () => {
  let findAll: sinon.SinonStub;
  let clock: sinon.SinonFakeTimers;

  beforeEach(() => {
    clock = sinon.useFakeTimers(1_700_000_000_000);
    findAll = sinon.stub(FeatureFlag, 'findAll');
    FeatureFlag.setCacheTtlMs(DEFAULT_CACHE_TTL_MS);
  });

  afterEach(() => {
    findAll.restore();
    clock.restore();
    FeatureFlag.setCacheTtlMs(DEFAULT_CACHE_TTL_MS);
  });

  it('returns the names of enabled flags', async () => {
    findAll.resolves([row({ name: 'a' }), row({ name: 'b' })]);

    assert.deepEqual(await FeatureFlag.getEnabledFlags(), ['a', 'b']);
  });

  it('omits disabled flags so their names stay unpublished', async () => {
    findAll.resolves([
      row({ name: 'live', enabled: true }),
      row({ name: 'upcoming', enabled: false }),
    ]);

    assert.deepEqual(await FeatureFlag.getEnabledFlags(), ['live']);
  });

  it('returns an empty list when nothing is enabled', async () => {
    findAll.resolves([row({ enabled: false })]);

    assert.deepEqual(await FeatureFlag.getEnabledFlags(), []);
  });

  it('serves repeat reads from cache within the TTL', async () => {
    findAll.resolves([row()]);

    await FeatureFlag.getEnabledFlags();
    clock.tick(DEFAULT_CACHE_TTL_MS - 1);
    await FeatureFlag.getEnabledFlags();

    assert.equal(findAll.callCount, 1);
  });

  it('re-reads once the TTL has elapsed', async () => {
    findAll.resolves([row({ enabled: true })]);
    await FeatureFlag.getEnabledFlags();

    findAll.resolves([row({ enabled: false })]);
    clock.tick(DEFAULT_CACHE_TTL_MS + 1);

    assert.deepEqual(await FeatureFlag.getEnabledFlags(), []);
    assert.equal(findAll.callCount, 2);
  });

  it('honours a TTL set after construction', async () => {
    FeatureFlag.setCacheTtlMs(5_000);
    findAll.resolves([row()]);

    await FeatureFlag.getEnabledFlags();
    clock.tick(5_001);
    await FeatureFlag.getEnabledFlags();

    assert.equal(findAll.callCount, 2);
  });

  it('reads through on every call when the TTL is zero', async () => {
    FeatureFlag.setCacheTtlMs(0);
    findAll.resolves([row()]);

    await FeatureFlag.getEnabledFlags();
    await FeatureFlag.getEnabledFlags();
    await FeatureFlag.getEnabledFlags();

    assert.equal(findAll.callCount, 3);
  });

  it('drops the cache on invalidate', async () => {
    findAll.resolves([row()]);

    await FeatureFlag.getEnabledFlags();
    FeatureFlag.invalidateCache();
    await FeatureFlag.getEnabledFlags();

    assert.equal(findAll.callCount, 2);
  });
});
