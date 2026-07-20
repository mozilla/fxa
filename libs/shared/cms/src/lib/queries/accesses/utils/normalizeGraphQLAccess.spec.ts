/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  AccessCapabilityFactory,
  AccessEmailListMatcherFactory,
  AccessOfferingFactory,
  AccessResultFactory,
  AccessServiceFactory,
} from '../factories';

import { normalizeGraphQLAccess } from './normalizeGraphQLAccess';

describe('normalizeGraphQLAccess', () => {
  it('keeps only `ComponentMatchersEmailList` matchers', () => {
    const normalized = normalizeGraphQLAccess(
      AccessResultFactory({
        documentId: 'ent-1',
        internalName: 'VPN beta',
        offerings: [
          AccessOfferingFactory({
            apiIdentifier: 'vpn',
            capabilities: [
              AccessCapabilityFactory({
                slug: 'vpn-beta',
                services: [AccessServiceFactory({ oauthClientId: 'cli' })],
              }),
            ],
          }),
        ],
        matchers: [
          AccessEmailListMatcherFactory({
            emails: { 'a@example.com': ['2026-12-31', 'd'] },
          }),
        ],
      })
    );

    expect(normalized.documentId).toBe('ent-1');
    expect(normalized.emailLists).toEqual([
      { 'a@example.com': ['2026-12-31', 'd'] },
    ]);
    expect(normalized.offeringApiIdentifiers).toEqual(['vpn']);
  });

  it('flattens capabilities across multiple offerings', () => {
    const normalized = normalizeGraphQLAccess(
      AccessResultFactory({
        offerings: [
          AccessOfferingFactory({
            apiIdentifier: 'vpn',
            capabilities: [
              AccessCapabilityFactory({
                slug: 'vpn-beta',
                services: [AccessServiceFactory({ oauthClientId: 'cli-a' })],
              }),
            ],
          }),
          AccessOfferingFactory({
            apiIdentifier: 'relay',
            capabilities: [
              AccessCapabilityFactory({
                slug: 'relay-beta',
                services: [AccessServiceFactory({ oauthClientId: 'cli-b' })],
              }),
            ],
          }),
        ],
        matchers: [],
      })
    );

    expect(normalized.offeringApiIdentifiers).toEqual(['vpn', 'relay']);
    // The cms factories tag rows with `__typename` so consumers can
    // discriminate dynamic-zone unions; the projector preserves the shape
    // verbatim until it filters in `collectCapabilityMap`.
    expect(normalized.capabilities).toEqual([
      {
        __typename: 'Capability',
        slug: 'vpn-beta',
        services: [{ __typename: 'Service', oauthClientId: 'cli-a' }],
      },
      {
        __typename: 'Capability',
        slug: 'relay-beta',
        services: [{ __typename: 'Service', oauthClientId: 'cli-b' }],
      },
    ]);
  });

  it('returns an empty capabilities list when no offerings are linked', () => {
    const normalized = normalizeGraphQLAccess(
      AccessResultFactory({ offerings: [], matchers: [] })
    );
    expect(normalized.capabilities).toEqual([]);
  });
});
