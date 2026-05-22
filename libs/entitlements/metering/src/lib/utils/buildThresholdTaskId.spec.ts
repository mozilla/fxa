/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { buildThresholdTaskId } from './buildThresholdTaskId';

const FIVE_MIN = 5 * 60 * 1000;

describe('buildThresholdTaskId', () => {
  it('puts (slug, userIdentifier, bucket) into the id', () => {
    const now = new Date('2026-05-19T12:00:00.000Z');
    const id = buildThresholdTaskId(
      { slug: 'bandwidth', userIdentifier: 'user-1' },
      now,
      FIVE_MIN
    );
    const expectedBucket = Math.floor(now.getTime() / FIVE_MIN);
    expect(id).toBe(`threshold-bandwidth-user-1-${expectedBucket}`);
  });

  it('produces the same id for two times in the same bucket', () => {
    const a = buildThresholdTaskId(
      { slug: 'b', userIdentifier: 'u' },
      new Date('2026-05-19T12:00:00.000Z'),
      FIVE_MIN
    );
    const b = buildThresholdTaskId(
      { slug: 'b', userIdentifier: 'u' },
      new Date('2026-05-19T12:04:59.999Z'),
      FIVE_MIN
    );
    expect(a).toBe(b);
  });

  it('produces a different id once the next bucket starts', () => {
    const a = buildThresholdTaskId(
      { slug: 'b', userIdentifier: 'u' },
      new Date('2026-05-19T12:04:59.999Z'),
      FIVE_MIN
    );
    const b = buildThresholdTaskId(
      { slug: 'b', userIdentifier: 'u' },
      new Date('2026-05-19T12:05:00.000Z'),
      FIVE_MIN
    );
    expect(a).not.toBe(b);
  });

  it('honours a non-default bucket size', () => {
    const oneMin = 60 * 1000;
    const a = buildThresholdTaskId(
      { slug: 'b', userIdentifier: 'u' },
      new Date('2026-05-19T12:00:00.000Z'),
      oneMin
    );
    const b = buildThresholdTaskId(
      { slug: 'b', userIdentifier: 'u' },
      new Date('2026-05-19T12:00:59.999Z'),
      oneMin
    );
    const c = buildThresholdTaskId(
      { slug: 'b', userIdentifier: 'u' },
      new Date('2026-05-19T12:01:00.000Z'),
      oneMin
    );
    expect(a).toBe(b);
    expect(a).not.toBe(c);
  });

  it('sanitizes slug and userIdentifier to the Cloud Tasks task-name grammar', () => {
    const id = buildThresholdTaskId(
      {
        slug: 'tokens/v1',
        userIdentifier: 'user@example.com',
      },
      new Date('2026-05-19T12:00:00.000Z'),
      FIVE_MIN
    );
    expect(id).toMatch(/^threshold-tokens_v1-user_example_com-\d+$/);
  });
});
