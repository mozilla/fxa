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
        remainingTokens: [token(FENIX, ['profile', VPN_SCOPE])],
      })
    ).toEqual([]);
  });

  it('deauthorizes a row whose client holds no refresh token at all', () => {
    expect(
      authorizationRowsToDeauthorize({ rows: [row()], remainingTokens: [] })
    ).toEqual([row()]);
  });

  it('deauthorizes when the remaining refresh token does not carry the scope', () => {
    expect(
      authorizationRowsToDeauthorize({
        rows: [row()],
        remainingTokens: [token(FENIX, ['profile', OLDSYNC_SCOPE])],
      })
    ).toHaveLength(1);
  });

  it('ignores another client’s refresh token entirely', () => {
    // A row belongs to the client that authorized the scope. A Fenix refresh
    // token is not evidence about a web RP's row.
    expect(
      authorizationRowsToDeauthorize({
        rows: [row({ clientId: WEB_RP })],
        remainingTokens: [token(FENIX, [VPN_SCOPE])],
      })
    ).toHaveLength(1);
  });

  it('keeps a narrow row covered by a broader remaining scope', () => {
    // Coverage is a ScopeSet question, not a string comparison.
    expect(
      authorizationRowsToDeauthorize({
        rows: [row({ scope: 'profile:uid' })],
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
        remainingTokens: [token(FENIX.toUpperCase(), [VPN_SCOPE])],
      })
    ).toEqual([]);
  });

  it('partitions a mixed batch, returning only the unsustained rows', () => {
    const sustained = row();
    const rpRow = row({ scope: 'profile', service: '', clientId: WEB_RP });

    expect(
      authorizationRowsToDeauthorize({
        rows: [sustained, rpRow],
        remainingTokens: [token(FENIX, [VPN_SCOPE])],
      })
    ).toEqual([rpRow]);
  });

  it('returns nothing when there are no rows', () => {
    expect(
      authorizationRowsToDeauthorize({ rows: [], remainingTokens: [] })
    ).toEqual([]);
  });

  describe('session-backed clients', () => {
    it('keeps a Firefox Desktop row even with no refresh token', () => {
      // Desktop holds none until bz2053654, so its rows cannot be
      // deauthorized. Deliberate: see SESSION_BACKED_CLIENT_IDS.
      expect(
        authorizationRowsToDeauthorize({
          rows: [row({ clientId: DESKTOP })],
          remainingTokens: [],
        })
      ).toEqual([]);
    });

    it('still deauthorizes the other rows in the same batch', () => {
      const fenixRow = row();

      expect(
        authorizationRowsToDeauthorize({
          rows: [row({ clientId: DESKTOP }), fenixRow],
          remainingTokens: [],
        })
      ).toEqual([fenixRow]);
    });
  });

  describe('unparseable scopes', () => {
    it('keeps a row whose scope ScopeSet cannot parse', () => {
      // The column is NOT NULL DEFAULT '' and ScopeSet.contains('') throws.
      expect(
        authorizationRowsToDeauthorize({
          rows: [row({ scope: '' })],
          remainingTokens: [token(FENIX, [VPN_SCOPE])],
        })
      ).toEqual([]);
    });

    it('still deauthorizes the other rows in the batch', () => {
      const unsustained = row({ scope: OLDSYNC_SCOPE });

      expect(
        authorizationRowsToDeauthorize({
          rows: [row({ scope: '' }), unsustained],
          remainingTokens: [token(FENIX, [VPN_SCOPE])],
        })
      ).toEqual([unsustained]);
    });

    it('reports the offending scope so the caller can count it', () => {
      const onUnparsableScope = jest.fn();

      authorizationRowsToDeauthorize({
        rows: [row({ scope: '' })],
        remainingTokens: [token(FENIX, [VPN_SCOPE])],
        onUnparsableScope,
      });

      expect(onUnparsableScope).toHaveBeenCalledWith('');
    });
  });
});
