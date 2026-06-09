/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  ServiceResultFactory,
  ServicesWithCapabilitiesQueryFactory,
  ServicesWithCapabilitiesResult,
  ServicesWithCapabilitiesResultUtil,
} from '@fxa/shared/cms';

import { buildBusinessEntitlementsForPage } from './businessEntitlements';

describe('buildBusinessEntitlementsForPage', () => {
  function catalog(
    services: Parameters<typeof ServiceResultFactory>[0][] = []
  ): ServicesWithCapabilitiesResultUtil {
    const result = ServicesWithCapabilitiesQueryFactory({
      services: services.map((s) => ServiceResultFactory(s)),
    });
    return new ServicesWithCapabilitiesResultUtil(
      result as ServicesWithCapabilitiesResult
    );
  }

  it('returns an empty list when there are no entitlements', () => {
    expect(buildBusinessEntitlementsForPage({}, catalog(), [])).toEqual([]);
  });

  it('emits one card per clientId with sorted capabilities', () => {
    const result = buildBusinessEntitlementsForPage(
      { vpn: ['pro', 'mobile'] },
      catalog([
        {
          oauthClientId: 'vpn',
          internalName: 'Mozilla VPN',
          description: 'Secure your connection.',
        },
      ]),
      []
    );

    expect(result).toEqual([
      {
        clientId: 'vpn',
        displayName: 'Mozilla VPN',
        description: 'Secure your connection.',
        capabilities: ['mobile', 'pro'],
      },
    ]);
  });

  it('falls back to clientId and null description when the catalog has no entry', () => {
    const result = buildBusinessEntitlementsForPage(
      { 'unknown-client': ['some-cap'] },
      catalog([]),
      []
    );

    expect(result).toEqual([
      {
        clientId: 'unknown-client',
        displayName: 'unknown-client',
        description: null,
        capabilities: ['some-cap'],
      },
    ]);
  });

  it('hides entitlements when the user is already subscribed (case-insensitive)', () => {
    const result = buildBusinessEntitlementsForPage(
      { VPN: ['pro'], relay: ['premium'] },
      catalog([
        { oauthClientId: 'vpn', internalName: 'Mozilla VPN' },
        { oauthClientId: 'relay', internalName: 'Firefox Relay' },
      ]),
      ['Vpn']
    );

    expect(result.map((e) => e.clientId)).toEqual(['relay']);
  });

  it('returns deterministic order sorted by clientId', () => {
    const result = buildBusinessEntitlementsForPage(
      { relay: ['premium'], vpn: ['pro'], mdn: ['plus'] },
      catalog([]),
      []
    );

    expect(result.map((e) => e.clientId)).toEqual(['mdn', 'relay', 'vpn']);
  });

  it('skips clientIds whose entitlement has no capabilities', () => {
    const result = buildBusinessEntitlementsForPage(
      { vpn: [] },
      catalog([{ oauthClientId: 'vpn' }]),
      []
    );

    expect(result).toEqual([]);
  });
});
