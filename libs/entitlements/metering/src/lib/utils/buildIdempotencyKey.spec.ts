/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { buildIdempotencyKey } from './buildIdempotencyKey';

describe('buildIdempotencyKey', () => {
  const baseMaterial = {
    slug: 'bandwidth',
    userIdentifier: 'user-1',
    windowStart: new Date('2026-05-01T00:00:00.000Z'),
    threshold: 80,
  };

  it('is deterministic for the same material', () => {
    expect(buildIdempotencyKey(baseMaterial)).toBe(
      buildIdempotencyKey({ ...baseMaterial })
    );
  });

  it('changes when the threshold changes', () => {
    expect(buildIdempotencyKey(baseMaterial)).not.toBe(
      buildIdempotencyKey({ ...baseMaterial, threshold: 100 })
    );
  });

  it('changes when the window changes', () => {
    expect(buildIdempotencyKey(baseMaterial)).not.toBe(
      buildIdempotencyKey({
        ...baseMaterial,
        windowStart: new Date('2026-06-01T00:00:00.000Z'),
      })
    );
  });

  it('is a 64-char hex sha256 digest', () => {
    expect(buildIdempotencyKey(baseMaterial)).toMatch(/^[0-9a-f]{64}$/);
  });
});
