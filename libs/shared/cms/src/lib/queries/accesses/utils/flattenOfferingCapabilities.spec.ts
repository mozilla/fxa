/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { flattenOfferingCapabilities } from './flattenOfferingCapabilities';

describe('flattenOfferingCapabilities', () => {
  it('returns null for null / undefined input', () => {
    expect(flattenOfferingCapabilities(null)).toBeNull();
    expect(flattenOfferingCapabilities(undefined)).toBeNull();
  });

  it('returns an empty array when no offering has capabilities', () => {
    expect(
      flattenOfferingCapabilities([
        { capabilities: [] },
        { capabilities: null },
      ])
    ).toEqual([]);
  });

  it('concatenates capabilities across offerings in source order', () => {
    expect(
      flattenOfferingCapabilities([
        {
          capabilities: [
            { slug: 'vpn-beta', services: [{ oauthClientId: 'cli-a' }] },
          ],
        },
        {
          capabilities: [
            { slug: 'relay-beta', services: [{ oauthClientId: 'cli-b' }] },
          ],
        },
      ])
    ).toEqual([
      { slug: 'vpn-beta', services: [{ oauthClientId: 'cli-a' }] },
      { slug: 'relay-beta', services: [{ oauthClientId: 'cli-b' }] },
    ]);
  });

  it('tolerates null offerings inside the array', () => {
    expect(
      flattenOfferingCapabilities([
        null,
        {
          capabilities: [
            { slug: 'vpn-beta', services: [{ oauthClientId: 'cli-a' }] },
          ],
        },
        undefined,
      ])
    ).toEqual([
      { slug: 'vpn-beta', services: [{ oauthClientId: 'cli-a' }] },
    ]);
  });
});
