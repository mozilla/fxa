/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { collectOfferingApiIdentifiers } from './collectOfferingApiIdentifiers';

describe('collectOfferingApiIdentifiers', () => {
  it('returns an empty array for null / undefined input', () => {
    expect(collectOfferingApiIdentifiers(null)).toEqual([]);
    expect(collectOfferingApiIdentifiers(undefined)).toEqual([]);
  });

  it('returns the list of apiIdentifiers in source order', () => {
    expect(
      collectOfferingApiIdentifiers([
        { apiIdentifier: 'vpn' },
        { apiIdentifier: 'relay' },
      ])
    ).toEqual(['vpn', 'relay']);
  });

  it('skips offerings missing or with an empty apiIdentifier', () => {
    expect(
      collectOfferingApiIdentifiers([
        { apiIdentifier: 'vpn' },
        null,
        { apiIdentifier: '' },
        { apiIdentifier: null },
        undefined,
        { apiIdentifier: 'relay' },
      ])
    ).toEqual(['vpn', 'relay']);
  });
});
