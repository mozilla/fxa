/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import ScopeSet from 'fxa-shared/oauth/scopes';

import {
  authorizationRowsToRevoke,
  AuthorizationRow,
} from './authorization-revocation';
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
    clientId: DESKTOP,
    lastAuthorizedTosAt: 1_700_000_000_000,
    ...over,
  };
}

function token(clientId: string, scopes: string[]) {
  return { clientId, scope: ScopeSet.fromArray(scopes) };
}

/** A disconnect that actually removed the client's refresh token. */
const disconnect = (clientId: string) => ({
  clientId,
  destroyedRefreshTokens: 1,
});

describe('authorizationRowsToRevoke', () => {
  describe('a client that still holds a covering refresh token', () => {
    it('keeps its row', () => {
      expect(
        authorizationRowsToRevoke({
          rows: [row({ clientId: FENIX })],
          remainingTokens: [token(FENIX, ['profile', VPN_SCOPE])],
          remainingSessions: 0,
        })
      ).toEqual([]);
    });

    it('revokes when its remaining refresh token does not carry the scope', () => {
      expect(
        authorizationRowsToRevoke({
          rows: [row({ clientId: FENIX })],
          remainingTokens: [token(FENIX, ['profile', OLDSYNC_SCOPE])],
          remainingSessions: 0,
        })
      ).toHaveLength(1);
    });

    it('ignores another client’s refresh token entirely', () => {
      // A row belongs to the client that authorized the scope. A Fenix refresh
      // token is not evidence about Desktop's row; if Desktop is gone the row
      // is revoked and Fenix re-authorizes on its next exchange.
      expect(
        authorizationRowsToRevoke({
          rows: [row({ clientId: DESKTOP })],
          remainingTokens: [token(FENIX, [VPN_SCOPE])],
          remainingSessions: 0,
        })
      ).toHaveLength(1);
    });
  });

  describe('a native client with no refresh token', () => {
    it('keeps its row while a session remains', () => {
      // Firefox Desktop is backed by a session rather than a refresh token
      // until bz2053654.
      expect(
        authorizationRowsToRevoke({
          rows: [row()],
          remainingTokens: [],
          remainingSessions: 1,
        })
      ).toEqual([]);
    });

    it('revokes its row once no session remains', () => {
      expect(
        authorizationRowsToRevoke({
          rows: [row()],
          remainingTokens: [],
          remainingSessions: 0,
        })
      ).toEqual([row()]);
    });

    it('keeps its row when the session count is unknown', () => {
      // Callers without an fxa-db handle cannot count sessions; assuming one
      // remains is the safe reading.
      expect(
        authorizationRowsToRevoke({
          rows: [row()],
          remainingTokens: [],
        })
      ).toEqual([]);
    });

    it('loses the session protection when its own refresh token was just destroyed', () => {
      // Otherwise disconnecting a mobile client would never withdraw anything
      // while the user's browser stayed signed in.
      expect(
        authorizationRowsToRevoke({
          rows: [row({ clientId: FENIX })],
          remainingTokens: [],
          remainingSessions: 1,
          disconnectedClient: disconnect(FENIX),
        })
      ).toHaveLength(1);
    });

    it('keeps a different native client’s row on that same disconnect', () => {
      // Signing out Fenix says nothing about a Desktop that is still signed in.
      const desktopRow = row();

      expect(
        authorizationRowsToRevoke({
          rows: [desktopRow, row({ clientId: FENIX })],
          remainingTokens: [],
          remainingSessions: 1,
          disconnectedClient: disconnect(FENIX),
        })
      ).toEqual([row({ clientId: FENIX })]);
    });

    it('keeps its row when its own destroy removed no refresh token', () => {
      // The vacuous case: finding no refresh token is not evidence for a client
      // that never had one.
      expect(
        authorizationRowsToRevoke({
          rows: [row()],
          remainingTokens: [],
          remainingSessions: 1,
          disconnectedClient: { clientId: DESKTOP, destroyedRefreshTokens: 0 },
        })
      ).toEqual([]);
    });
  });

  describe('a non-native client', () => {
    it('gets no session protection, so a row with no refresh token is revoked', () => {
      // A web RP is not session backed, so a live session says nothing about it
      // and its row cannot be exchanged without a refresh token anyway.
      expect(
        authorizationRowsToRevoke({
          rows: [row({ scope: 'profile', service: '', clientId: WEB_RP })],
          remainingTokens: [],
          remainingSessions: 5,
        })
      ).toHaveLength(1);
    });

    it('keeps its row while it holds a covering refresh token', () => {
      expect(
        authorizationRowsToRevoke({
          rows: [row({ scope: 'profile', service: '', clientId: WEB_RP })],
          remainingTokens: [token(WEB_RP, ['profile'])],
          remainingSessions: 0,
        })
      ).toEqual([]);
    });
  });

  it('keeps a narrow row covered by a broader remaining scope', () => {
    // Coverage is a ScopeSet question, not a string comparison.
    expect(
      authorizationRowsToRevoke({
        rows: [row({ scope: 'profile:uid', clientId: FENIX })],
        remainingTokens: [token(FENIX, ['profile'])],
        remainingSessions: 0,
      })
    ).toEqual([]);
  });

  describe('unparseable scopes', () => {
    it('keeps a row whose scope ScopeSet cannot parse', () => {
      // The column is NOT NULL DEFAULT '' and ScopeSet.contains('') throws.
      expect(
        authorizationRowsToRevoke({
          rows: [row({ scope: '', clientId: FENIX })],
          remainingTokens: [token(FENIX, [VPN_SCOPE])],
          remainingSessions: 0,
        })
      ).toEqual([]);
    });

    it('still revokes the other rows in the batch', () => {
      const unsustained = row({ scope: OLDSYNC_SCOPE, clientId: FENIX });

      expect(
        authorizationRowsToRevoke({
          rows: [row({ scope: '', clientId: FENIX }), unsustained],
          remainingTokens: [token(FENIX, [VPN_SCOPE])],
          remainingSessions: 0,
        })
      ).toEqual([unsustained]);
    });

    it('reports the offending scope so the caller can count it', () => {
      const onUnparsableScope = jest.fn();

      authorizationRowsToRevoke({
        rows: [row({ scope: '', clientId: FENIX })],
        remainingTokens: [token(FENIX, [VPN_SCOPE])],
        remainingSessions: 0,
        onUnparsableScope,
      });

      expect(onUnparsableScope).toHaveBeenCalledWith('');
    });
  });

  it('partitions a mixed batch, returning only the unsustained rows', () => {
    const sustained = row({ clientId: FENIX });
    const desktopRow = row();
    const rpRow = row({ scope: 'profile', service: '', clientId: WEB_RP });

    expect(
      authorizationRowsToRevoke({
        rows: [sustained, desktopRow, rpRow],
        remainingTokens: [token(FENIX, [VPN_SCOPE])],
        remainingSessions: 1,
      })
    ).toEqual([rpRow]);
  });

  it('compares client ids case-insensitively', () => {
    // Row ids come back as hex from the DB and payload ids are caller supplied,
    // so neither side is guaranteed lowercase. A mismatch would silently skip.
    expect(
      authorizationRowsToRevoke({
        rows: [row({ clientId: FENIX.toUpperCase() })],
        remainingTokens: [token(FENIX.toUpperCase(), [VPN_SCOPE])],
        remainingSessions: 0,
      })
    ).toEqual([]);
  });

  it('returns nothing when there are no rows', () => {
    expect(
      authorizationRowsToRevoke({
        rows: [],
        remainingTokens: [],
        remainingSessions: 0,
      })
    ).toEqual([]);
  });
});
