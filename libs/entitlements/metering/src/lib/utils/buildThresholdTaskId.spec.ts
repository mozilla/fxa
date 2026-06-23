/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { buildThresholdTaskId } from './buildThresholdTaskId';

const FIVE_MIN = 5 * 60 * 1000;

describe('buildThresholdTaskId', () => {
  it('produces an id with a 64-character hash and a trailing bucket number', () => {
    const now = new Date('2026-05-19T12:00:00.000Z');
    const id = buildThresholdTaskId(
      { slug: 'bandwidth', userIdentifier: 'user-1' },
      now,
      FIVE_MIN
    );
    const expectedBucket = Math.floor(now.getTime() / FIVE_MIN);
    expect(id).toMatch(/^threshold-[0-9a-f]{64}-\d+$/);
    expect(id.endsWith(`-${expectedBucket}`)).toBe(true);
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

  it('respects a non-default bucket size', () => {
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

  it('produces different ids for different users in the same bucket', () => {
    const now = new Date('2026-05-19T12:00:00.000Z');
    const a = buildThresholdTaskId(
      { slug: 'b', userIdentifier: 'u1' },
      now,
      FIVE_MIN
    );
    const b = buildThresholdTaskId(
      { slug: 'b', userIdentifier: 'u2' },
      now,
      FIVE_MIN
    );
    expect(a).not.toBe(b);
  });

  it('produces different ids for different slugs in the same bucket', () => {
    const now = new Date('2026-05-19T12:00:00.000Z');
    const a = buildThresholdTaskId(
      { slug: 's1', userIdentifier: 'u' },
      now,
      FIVE_MIN
    );
    const b = buildThresholdTaskId(
      { slug: 's2', userIdentifier: 'u' },
      now,
      FIVE_MIN
    );
    expect(a).not.toBe(b);
  });

  it('produces different ids when a hyphen shifts between the slug and the user identifier', () => {
    const now = new Date('2026-05-19T12:00:00.000Z');
    const a = buildThresholdTaskId(
      { slug: 'a-b', userIdentifier: 'c' },
      now,
      FIVE_MIN
    );
    const b = buildThresholdTaskId(
      { slug: 'a', userIdentifier: 'b-c' },
      now,
      FIVE_MIN
    );
    expect(a).not.toBe(b);
  });

  it('produces different ids for user identifiers that differ only in punctuation', () => {
    const now = new Date('2026-05-19T12:00:00.000Z');
    const a = buildThresholdTaskId(
      { slug: 'x', userIdentifier: 'user@example.com' },
      now,
      FIVE_MIN
    );
    const b = buildThresholdTaskId(
      { slug: 'x', userIdentifier: 'user_example_com' },
      now,
      FIVE_MIN
    );
    expect(a).not.toBe(b);
  });
});
