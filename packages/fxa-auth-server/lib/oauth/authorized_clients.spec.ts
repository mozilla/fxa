/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// destroy() is the Connected Services disconnect. This covers its wiring to
// the deauthorize pass; the rule itself is tested in @fxa/accounts/oauth.
import { OAuthNativeClients } from '@fxa/accounts/oauth';

jest.mock('./db', () => ({
  ready: jest.fn(),
  deleteClientRefreshToken: jest.fn(),
  deleteClientAuthorization: jest.fn(),
  listAccountConsentsByUid: jest.fn(),
  getRefreshTokenScopesByUid: jest.fn(),
  allowedClientsForService: jest.fn(),
  deauthorizeAccountAuthorizations: jest.fn(),
}));

const oauthDB = require('./db');
const authorizedClients = require('./authorized_clients');

const UID = 'a'.repeat(32);
const FENIX = OAuthNativeClients.Fenix;
const REFRESH_TOKEN_ID = 'b'.repeat(64);
const VPN_SCOPE = 'https://identity.mozilla.com/apps/vpn';
const TOS_AT = 1_700_000_000_000;

describe('authorizedClients.destroy', () => {
  beforeEach(() => {
    oauthDB.ready.mockResolvedValue(undefined);
    oauthDB.deleteClientAuthorization.mockResolvedValue(undefined);
    oauthDB.deleteClientRefreshToken.mockResolvedValue(true);
    oauthDB.listAccountConsentsByUid.mockResolvedValue([
      {
        scope: VPN_SCOPE,
        service: 'vpn',
        clientId: Buffer.from(FENIX, 'hex'),
        lastAuthorizedTosAt: String(TOS_AT),
        deauthorizedAt: null,
      },
    ]);
    oauthDB.getRefreshTokenScopesByUid.mockResolvedValue([]);
    oauthDB.allowedClientsForService.mockReturnValue(undefined);
    oauthDB.deauthorizeAccountAuthorizations.mockResolvedValue(1);
  });

  it('deauthorizes the rows left unsustained after deleting the client’s tokens', async () => {
    await authorizedClients.destroy(FENIX, UID);

    expect(oauthDB.deleteClientAuthorization).toHaveBeenCalledWith(FENIX, UID);
    expect(oauthDB.deauthorizeAccountAuthorizations).toHaveBeenCalledWith(
      UID,
      [
        {
          scope: VPN_SCOPE,
          service: 'vpn',
          clientId: FENIX,
          lastAuthorizedTosAt: TOS_AT,
        },
      ],
      expect.any(Number)
    );
  });

  it('reads the rows only after the delete committed', async () => {
    await authorizedClients.destroy(FENIX, UID);

    expect(
      oauthDB.deleteClientAuthorization.mock.invocationCallOrder[0]
    ).toBeLessThan(
      oauthDB.listAccountConsentsByUid.mock.invocationCallOrder[0]
    );
  });

  it('runs the pass after deleting a single refresh token', async () => {
    await authorizedClients.destroy(FENIX, UID, REFRESH_TOKEN_ID);

    expect(oauthDB.deleteClientRefreshToken).toHaveBeenCalledWith(
      REFRESH_TOKEN_ID,
      FENIX,
      UID
    );
    expect(oauthDB.listAccountConsentsByUid).toHaveBeenCalledWith(UID);
  });

  it('runs the pass even when the refresh token was already gone', async () => {
    // An earlier delete may have removed it without reconciling. The route
    // swallows the error, so this is the only chance to catch up.
    oauthDB.deleteClientRefreshToken.mockResolvedValue(false);

    await expect(
      authorizedClients.destroy(FENIX, UID, REFRESH_TOKEN_ID)
    ).rejects.toThrow();
    expect(oauthDB.listAccountConsentsByUid).toHaveBeenCalledWith(UID);
  });

  it('runs the pass when the delete throws after removing the token', async () => {
    // deleteClientRefreshToken commits the MySQL delete before its Redis
    // cleanup, so a rejection can still mean the token is gone.
    oauthDB.deleteClientRefreshToken.mockRejectedValue(new Error('redis down'));

    await expect(
      authorizedClients.destroy(FENIX, UID, REFRESH_TOKEN_ID)
    ).rejects.toThrow('redis down');
    expect(oauthDB.deauthorizeAccountAuthorizations).toHaveBeenCalled();
  });
});
