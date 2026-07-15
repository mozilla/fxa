/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Timestamp } from '@google-cloud/firestore';

import { isUsageGrantActive } from './isUsageGrantActive';

describe('isUsageGrantActive', () => {
  const now = new Date('2026-05-15T12:00:00.000Z');

  it('treats a null expiry as always active', () => {
    expect(isUsageGrantActive(null, now)).toBe(true);
  });

  it('is active when the expiry is strictly after now', () => {
    const expiresAt = Timestamp.fromDate(new Date('2026-05-15T12:00:00.001Z'));
    expect(isUsageGrantActive(expiresAt, now)).toBe(true);
  });

  it('is inactive when the expiry equals now', () => {
    const expiresAt = Timestamp.fromDate(now);
    expect(isUsageGrantActive(expiresAt, now)).toBe(false);
  });

  it('is inactive when the expiry is before now', () => {
    const expiresAt = Timestamp.fromDate(new Date('2026-05-15T11:59:59.999Z'));
    expect(isUsageGrantActive(expiresAt, now)).toBe(false);
  });
});
