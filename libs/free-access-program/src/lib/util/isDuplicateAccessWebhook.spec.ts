/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { isDuplicateAccessWebhook } from './isDuplicateAccessWebhook';

describe('isDuplicateAccessWebhook', () => {
  const NOW = new Date('2026-06-23T12:00:00.000Z').getTime();
  let seen: Map<string, number>;

  beforeEach(() => {
    seen = new Map();
  });

  it('records a new key and returns false', () => {
    expect(isDuplicateAccessWebhook(seen, 'k', NOW)).toBe(false);
    expect(seen.has('k')).toBe(true);
  });

  it('returns true for a key seen within the TTL', () => {
    isDuplicateAccessWebhook(seen, 'k', NOW);
    expect(isDuplicateAccessWebhook(seen, 'k', NOW + 59_000)).toBe(true);
  });

  it('re-accepts a key after the TTL elapses', () => {
    isDuplicateAccessWebhook(seen, 'k', NOW);
    expect(isDuplicateAccessWebhook(seen, 'k', NOW + 61_000)).toBe(false);
  });

  it('treats distinct keys independently', () => {
    isDuplicateAccessWebhook(seen, 'a', NOW);
    expect(isDuplicateAccessWebhook(seen, 'b', NOW)).toBe(false);
  });
});
