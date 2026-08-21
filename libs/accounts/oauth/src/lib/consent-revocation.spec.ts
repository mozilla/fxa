/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import ScopeSet from 'fxa-shared/oauth/scopes';

import { consentRowsToRevoke, ConsentRow } from './consent-revocation';
import { OAuthNativeClients } from './oauth';

const DESKTOP = OAuthNativeClients.FirefoxDesktop;
const FENIX = OAuthNativeClients.Fenix;
const WEB_RP = '98e6508e88680e1b'; // arbitrary non-native web RP (no enum)

const VPN_SCOPE = 'https://identity.mozilla.com/apps/vpn';
const OLDSYNC_SCOPE = 'https://identity.mozilla.com/apps/oldsync';

function row(over: Partial<ConsentRow> = {}): ConsentRow {
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

describe('consentRowsToRevoke', () => {
  describe('a client that still holds a covering token', () => {
    it('keeps its row', () => {
      expect(
        consentRowsToRevoke({
          rows: [row({ clientId: FENIX })],
          remainingTokens: [token(FENIX, ['profile', VPN_SCOPE])],
          remainingSessions: 0,
        })
      ).toEqual([]);
    });

    it('revokes when its remaining token does not carry the scope', () => {
      expect(
        consentRowsToRevoke({
          rows: [row({ clientId: FENIX })],
          remainingTokens: [token(FENIX, ['profile', OLDSYNC_SCOPE])],
          remainingSessions: 0,
        })
      ).toHaveLength(1);
    });

    it('ignores another client’s token entirely', () => {
      // Consent belongs to the client that accepted the ToS. A Fenix token is
      // not evidence about Desktop's row; if Desktop is gone the row goes and
      // Fenix re-consents on its next exchange.
      expect(
        consentRowsToRevoke({
          rows: [row({ clientId: DESKTOP })],
          remainingTokens: [token(FENIX, [VPN_SCOPE])],
          remainingSessions: 0,
        })
      ).toHaveLength(1);
    });

    it('keeps the row while one of its several tokens still covers it', () => {
      expect(
        consentRowsToRevoke({
          rows: [row({ clientId: FENIX })],
          remainingTokens: [
            token(FENIX, ['profile']),
            token(FENIX, [VPN_SCOPE]),
          ],
          remainingSessions: 0,
        })
      ).toEqual([]);
    });
  });

  describe('a native client with no token', () => {
    it('keeps its row while a session remains', () => {
      // Firefox Desktop's consent is backed by a session, not a token.
      expect(
        consentRowsToRevoke({
          rows: [row()],
          remainingTokens: [],
          remainingSessions: 1,
        })
      ).toEqual([]);
    });

    it('revokes its row once no session remains', () => {
      expect(
        consentRowsToRevoke({
          rows: [row()],
          remainingTokens: [],
          remainingSessions: 0,
        })
      ).toEqual([row()]);
    });

    it('revokes every service it consented to at once', () => {
      const rows = [
        row(),
        row({ scope: 'profile' }),
        row({ scope: OLDSYNC_SCOPE, service: 'sync' }),
      ];

      expect(
        consentRowsToRevoke({
          rows,
          remainingTokens: [],
          remainingSessions: 0,
        })
      ).toEqual(rows);
    });

    it('keeps its row when the session count is unknown', () => {
      // Callers without an fxa-db handle cannot count sessions; assuming one
      // remains is the safe reading.
      expect(
        consentRowsToRevoke({
          rows: [row()],
          remainingTokens: [],
        })
      ).toEqual([]);
    });

    it('loses the session protection when its own token was just destroyed', () => {
      // Otherwise disconnecting a mobile client would never withdraw anything
      // while the user's browser stayed signed in.
      expect(
        consentRowsToRevoke({
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
        consentRowsToRevoke({
          rows: [desktopRow, row({ clientId: FENIX })],
          remainingTokens: [],
          remainingSessions: 1,
          disconnectedClient: disconnect(FENIX),
        })
      ).toEqual([row({ clientId: FENIX })]);
    });

    it('keeps its row when its own destroy removed no token', () => {
      // The vacuous case: finding no token is not evidence for a client that
      // never had one.
      expect(
        consentRowsToRevoke({
          rows: [row()],
          remainingTokens: [],
          remainingSessions: 1,
          disconnectedClient: { clientId: DESKTOP, destroyedRefreshTokens: 0 },
        })
      ).toEqual([]);
    });
  });

  describe('a non-native client', () => {
    it('gets no session protection, so a token-less row is revoked', () => {
      // A web RP is not session backed, so a live session says nothing about it
      // and its row cannot be exchanged without a token anyway.
      expect(
        consentRowsToRevoke({
          rows: [row({ scope: 'profile', service: '', clientId: WEB_RP })],
          remainingTokens: [],
          remainingSessions: 5,
        })
      ).toHaveLength(1);
    });

    it('keeps its row while it holds a covering token', () => {
      expect(
        consentRowsToRevoke({
          rows: [row({ scope: 'profile', service: '', clientId: WEB_RP })],
          remainingTokens: [token(WEB_RP, ['profile'])],
          remainingSessions: 0,
        })
      ).toEqual([]);
    });
  });

  describe('scope hierarchy', () => {
    it('keeps a narrow row covered by a broader remaining scope', () => {
      expect(
        consentRowsToRevoke({
          rows: [row({ scope: 'profile:uid', clientId: FENIX })],
          remainingTokens: [token(FENIX, ['profile'])],
          remainingSessions: 0,
        })
      ).toEqual([]);
    });

    it('revokes a broad row when only a narrower scope remains', () => {
      expect(
        consentRowsToRevoke({
          rows: [row({ scope: 'profile', clientId: FENIX })],
          remainingTokens: [token(FENIX, ['profile:email'])],
          remainingSessions: 0,
        })
      ).toHaveLength(1);
    });
  });

  describe('unparseable scopes', () => {
    it('keeps a row whose scope ScopeSet cannot parse', () => {
      // The column is NOT NULL DEFAULT '' and ScopeSet.contains('') throws.
      expect(
        consentRowsToRevoke({
          rows: [row({ scope: '', clientId: FENIX })],
          remainingTokens: [token(FENIX, [VPN_SCOPE])],
          remainingSessions: 0,
        })
      ).toEqual([]);
    });

    it('still revokes the other rows in the batch', () => {
      const unsustained = row({ scope: OLDSYNC_SCOPE, clientId: FENIX });

      expect(
        consentRowsToRevoke({
          rows: [row({ scope: '', clientId: FENIX }), unsustained],
          remainingTokens: [token(FENIX, [VPN_SCOPE])],
          remainingSessions: 0,
        })
      ).toEqual([unsustained]);
    });
  });

  it('partitions a mixed batch, returning only the unsustained rows', () => {
    const sustained = row({ clientId: FENIX });
    const desktopRow = row();
    const rpRow = row({ scope: 'profile', service: '', clientId: WEB_RP });

    expect(
      consentRowsToRevoke({
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
      consentRowsToRevoke({
        rows: [row({ clientId: FENIX.toUpperCase() })],
        remainingTokens: [token(FENIX.toUpperCase(), [VPN_SCOPE])],
        remainingSessions: 0,
      })
    ).toEqual([]);
  });

  it('returns nothing when there are no rows', () => {
    expect(
      consentRowsToRevoke({
        rows: [],
        remainingTokens: [],
        remainingSessions: 0,
      })
    ).toEqual([]);
  });
});
