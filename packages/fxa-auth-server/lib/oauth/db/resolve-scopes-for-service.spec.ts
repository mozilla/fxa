/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const resolveScopesForService = require('./resolve-scopes-for-service');

const PROFILE = 'profile';
const OLDSYNC = 'https://identity.mozilla.com/apps/oldsync';
const VPN = 'https://identity.mozilla.com/apps/vpn';
const RELAY = 'https://identity.mozilla.com/apps/relay';
const SMARTWINDOW = 'https://identity.mozilla.com/apps/smartwindow';

// Mirrors the defaults at packages/fxa-auth-server/config/index.ts
// for oauthServer.authorization.serviceScopes.
const SCOPES = {
  sync: [OLDSYNC, PROFILE],
  relay: [RELAY, PROFILE],
  smartwindow: [SMARTWINDOW, 'profile:uid'],
  vpn: [VPN, PROFILE],
};

describe('resolveScopesForService', () => {
  it('returns undefined for an unknown service', () => {
    expect(
      resolveScopesForService(SCOPES, OLDSYNC, 'totally-unknown', false)
    ).toBeUndefined();
    // Even with keys, an unknown service has no resolution.
    expect(
      resolveScopesForService(SCOPES, OLDSYNC, 'totally-unknown', true)
    ).toBeUndefined();
  });

  it('returns the base scope set when withKeys is false', () => {
    expect(resolveScopesForService(SCOPES, OLDSYNC, 'vpn', false)).toEqual([
      VPN,
      PROFILE,
    ]);
    expect(
      resolveScopesForService(SCOPES, OLDSYNC, 'smartwindow', false)
    ).toEqual([SMARTWINDOW, 'profile:uid']);
  });

  it('appends the keys-conditional scope when withKeys is true and base lacks it', () => {
    expect(resolveScopesForService(SCOPES, OLDSYNC, 'vpn', true)).toEqual([
      VPN,
      PROFILE,
      OLDSYNC,
    ]);
    expect(
      resolveScopesForService(SCOPES, OLDSYNC, 'smartwindow', true)
    ).toEqual([SMARTWINDOW, 'profile:uid', OLDSYNC]);
    expect(resolveScopesForService(SCOPES, OLDSYNC, 'relay', true)).toEqual([
      RELAY,
      PROFILE,
      OLDSYNC,
    ]);
  });

  it('does not duplicate the keys-conditional scope if the base already contains it', () => {
    // Sync's base set already includes oldsync; withKeys=true must not
    // add a second copy.
    expect(resolveScopesForService(SCOPES, OLDSYNC, 'sync', true)).toEqual([
      OLDSYNC,
      PROFILE,
    ]);
    // Also when the conditional scope is a non-oldsync example, to
    // demonstrate the dedup is general, not hardcoded to oldsync.
    expect(resolveScopesForService(SCOPES, PROFILE, 'sync', true)).toEqual([
      OLDSYNC,
      PROFILE,
    ]);
  });

  it('returns the base reference (no copy) when no append is needed, so callers can rely on identity equality', () => {
    // Sanity: withKeys=false short-circuits without allocating. Not a
    // strict requirement, but documents the implementation choice.
    const base = SCOPES.vpn;
    expect(resolveScopesForService(SCOPES, OLDSYNC, 'vpn', false)).toBe(base);
  });
});
