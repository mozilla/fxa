/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import ScopeSet from 'fxa-shared/oauth/scopes';

import {
  authorizationRowsToDeauthorize,
  AuthorizationRow,
} from './deauthorization';
import { OAuthNativeClients } from './oauth';

const DESKTOP = OAuthNativeClients.FirefoxDesktop;
const FENIX = OAuthNativeClients.Fenix;
const WEB_RP = '98e6508e88680e1b'; // arbitrary non-native web RP (no enum)
const VPN_APP = 'e6eb0d1e856335fc';

// Mirrors the shape of oauthServer.exchange.allowedClientsForService.
const allowedClientsForService = (service: string) =>
  service === 'vpn' ? new Set([FENIX, VPN_APP]) : undefined;

const VPN_SCOPE = 'https://identity.mozilla.com/apps/vpn';
const OLDSYNC_SCOPE = 'https://identity.mozilla.com/apps/oldsync';

function row(over: Partial<AuthorizationRow> = {}): AuthorizationRow {
  return {
    scope: VPN_SCOPE,
    service: 'vpn',
    clientId: FENIX,
    lastAuthorizedTosAt: 1_700_000_000_000,
    ...over,
  };
}

function token(clientId: string, scopes: string[]) {
  return { clientId, scope: ScopeSet.fromArray(scopes) };
}

describe('authorizationRowsToDeauthorize', () => {
  it('keeps a row whose client still holds a covering refresh token', () => {
    expect(
      authorizationRowsToDeauthorize({
        rows: [row()],
        disconnectedClientId: FENIX,
        remainingTokens: [token(FENIX, ['profile', VPN_SCOPE])],
      })
    ).toEqual([]);
  });

  it('deauthorizes a row whose client holds no refresh token at all', () => {
    expect(
      authorizationRowsToDeauthorize({
        rows: [row()],
        disconnectedClientId: FENIX,
        remainingTokens: [],
      })
    ).toEqual([row()]);
  });

  it('deauthorizes when the remaining refresh token does not carry the scope', () => {
    expect(
      authorizationRowsToDeauthorize({
        rows: [row()],
        disconnectedClientId: FENIX,
        remainingTokens: [token(FENIX, ['profile', OLDSYNC_SCOPE])],
      })
    ).toHaveLength(1);
  });

  it('ignores another client’s token when the row’s service has no allowlist', () => {
    // Every browser token carries profile; without an allowlist to scope the
    // sharing, only the web RP's own token can sustain its row.
    expect(
      authorizationRowsToDeauthorize({
        rows: [row({ scope: 'profile', service: '', clientId: WEB_RP })],
        disconnectedClientId: WEB_RP,
        remainingTokens: [token(FENIX, ['profile'])],
        allowedClientsForService,
      })
    ).toHaveLength(1);
  });

  it('keeps a row sustained by an allowlisted client for its service', () => {
    // The standalone VPN app showed the ToS; Firefox reached VPN through token
    // exchange and wrote no row. Disconnecting the app must not withdraw the
    // consent Firefox is still using.
    expect(
      authorizationRowsToDeauthorize({
        rows: [row({ clientId: VPN_APP })],
        disconnectedClientId: VPN_APP,
        remainingTokens: [token(FENIX, [VPN_SCOPE])],
        allowedClientsForService,
      })
    ).toEqual([]);
  });

  it('judges another client’s row when the disconnect was an allowlisted sibling', () => {
    // Firefox held the VPN app's row alive through token exchange, so its
    // disconnect is the event that can end that row.
    expect(
      authorizationRowsToDeauthorize({
        rows: [row({ clientId: VPN_APP })],
        disconnectedClientId: FENIX,
        remainingTokens: [],
        allowedClientsForService,
      })
    ).toHaveLength(1);
  });

  it('ignores a row the disconnected client could not have sustained', () => {
    // The VPN app's token may have gone away in a password reset. Disconnecting
    // an unrelated web RP removed no token of its own, so it must not be the
    // event that withdraws it.
    expect(
      authorizationRowsToDeauthorize({
        rows: [row({ clientId: VPN_APP })],
        disconnectedClientId: WEB_RP,
        remainingTokens: [],
        allowedClientsForService,
      })
    ).toEqual([]);
  });

  it('ignores a covering token from a client outside the service’s allowlist', () => {
    expect(
      authorizationRowsToDeauthorize({
        rows: [row()],
        disconnectedClientId: FENIX,
        remainingTokens: [token(WEB_RP, [VPN_SCOPE])],
        allowedClientsForService,
      })
    ).toHaveLength(1);
  });

  it('keeps a narrow row covered by a broader remaining scope', () => {
    // Coverage is a ScopeSet question, not a string comparison.
    expect(
      authorizationRowsToDeauthorize({
        rows: [row({ scope: 'profile:uid' })],
        disconnectedClientId: FENIX,
        remainingTokens: [token(FENIX, ['profile'])],
      })
    ).toEqual([]);
  });

  it('compares client ids case-insensitively', () => {
    // Row ids come back as hex from the DB and payload ids are caller supplied,
    // so neither side is guaranteed lowercase. A mismatch would silently skip.
    expect(
      authorizationRowsToDeauthorize({
        rows: [row({ clientId: FENIX.toUpperCase() })],
        disconnectedClientId: FENIX,
        remainingTokens: [token(FENIX.toUpperCase(), [VPN_SCOPE])],
      })
    ).toEqual([]);
  });

  it('partitions a mixed batch, returning only the unsustained rows', () => {
    const sustained = row();
    const unsustained = row({ scope: OLDSYNC_SCOPE });

    expect(
      authorizationRowsToDeauthorize({
        rows: [sustained, unsustained],
        disconnectedClientId: FENIX,
        remainingTokens: [token(FENIX, [VPN_SCOPE])],
      })
    ).toEqual([unsustained]);
  });

  it('keeps a Firefox Desktop row even with no refresh token', () => {
    // Desktop holds none until bz2053654, so its rows cannot be deauthorized.
    // Deliberate: see SESSION_BACKED_CLIENT_IDS.
    expect(
      authorizationRowsToDeauthorize({
        rows: [row({ clientId: DESKTOP })],
        disconnectedClientId: DESKTOP,
        remainingTokens: [],
      })
    ).toEqual([]);
  });

  it('keeps a row with an empty scope even with no tokens, deauthorizing the rest', () => {
    // The column is NOT NULL DEFAULT '' and ScopeSet.contains('') throws.
    const unsustained = row({ scope: OLDSYNC_SCOPE });

    expect(
      authorizationRowsToDeauthorize({
        rows: [row({ scope: '' }), unsustained],
        disconnectedClientId: FENIX,
        remainingTokens: [],
      })
    ).toEqual([unsustained]);
  });
});
