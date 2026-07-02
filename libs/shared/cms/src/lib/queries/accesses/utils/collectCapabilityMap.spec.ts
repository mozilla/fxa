/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { collectCapabilityMap } from './collectCapabilityMap';

describe('collectCapabilityMap', () => {
  it('returns an empty map for an empty input', () => {
    expect(collectCapabilityMap([])).toEqual({});
  });

  it('builds a map from slug + services', () => {
    const result = collectCapabilityMap([
      { slug: 'vpn-beta', services: [{ oauthClientId: 'CLIENT-A' }] },
    ]);
    expect(result).toEqual({ 'client-a': ['vpn-beta'] });
  });

  it('lowercases clientIds and dedupes slugs across capabilities', () => {
    const result = collectCapabilityMap([
      { slug: 'vpn-beta', services: [{ oauthClientId: 'CLIENT-A' }] },
      { slug: 'vpn-beta', services: [{ oauthClientId: 'client-a' }] },
      { slug: 'early-access', services: [{ oauthClientId: 'CLIENT-A' }] },
    ]);
    expect([...result['client-a']].sort()).toEqual([
      'early-access',
      'vpn-beta',
    ]);
  });

  it('fans a single capability across multiple services', () => {
    const result = collectCapabilityMap([
      {
        slug: 'vpn-beta',
        services: [
          { oauthClientId: 'client-a' },
          { oauthClientId: 'client-b' },
        ],
      },
    ]);
    expect(result).toEqual({
      'client-a': ['vpn-beta'],
      'client-b': ['vpn-beta'],
    });
  });

  it('drops capabilities missing a slug', () => {
    const result = collectCapabilityMap([
      { slug: '', services: [{ oauthClientId: 'client-a' }] },
    ]);
    expect(result).toEqual({});
  });

  it('drops services missing an oauthClientId', () => {
    const result = collectCapabilityMap([
      { slug: 'vpn-beta', services: [{ oauthClientId: '' }] },
      { slug: 'orphan', services: [] },
    ]);
    expect(result).toEqual({});
  });
});
