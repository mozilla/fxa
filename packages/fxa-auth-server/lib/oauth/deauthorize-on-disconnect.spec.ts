/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// The deauthorization rule itself lives in @fxa/accounts/oauth and is tested
// there (deauthorization.spec.ts). This file covers the orchestration around
// it: the gate, read ordering, metrics, the single retry, and error swallowing.
import { OAuthNativeClients } from '@fxa/accounts/oauth';
import ScopeSet from 'fxa-shared/oauth/scopes';

import {
  deauthorizeOnDisconnect,
  DeauthorizeOnDisconnectOauthDB,
} from './deauthorize-on-disconnect';

const UID = 'a'.repeat(32);
const FENIX = OAuthNativeClients.Fenix;
const WEB_RP = '98e6508e88680e1b'; // arbitrary non-native web RP (no enum)

const VPN_SCOPE = 'https://identity.mozilla.com/apps/vpn';
const TOS_AT = 1_700_000_000_000;

function mockDb(
  over: Partial<jest.Mocked<DeauthorizeOnDisconnectOauthDB>> = {}
): jest.Mocked<DeauthorizeOnDisconnectOauthDB> {
  return {
    listAccountConsentsByUid: jest.fn().mockResolvedValue([
      {
        scope: VPN_SCOPE,
        service: 'vpn',
        clientId: Buffer.from(FENIX, 'hex'),
        lastAuthorizedTosAt: String(TOS_AT),
      },
    ]),
    getRefreshTokenScopesByUid: jest.fn().mockResolvedValue([]),
    deauthorizeAccountAuthorizations: jest.fn().mockResolvedValue(1),
    ...over,
  } as jest.Mocked<DeauthorizeOnDisconnectOauthDB>;
}

function mockDeps(db: jest.Mocked<DeauthorizeOnDisconnectOauthDB>) {
  return {
    oauthDB: db,
    statsd: { increment: jest.fn() },
    log: { warn: jest.fn() },
  };
}

describe('deauthorizeOnDisconnect', () => {
  const destroyed = { uid: UID, clientId: FENIX };

  it('deauthorizes the rows nothing sustains, normalizing the buffer clientId', async () => {
    const db = mockDb();
    const deps = mockDeps(db);

    await deauthorizeOnDisconnect(deps, destroyed);

    expect(db.deauthorizeAccountAuthorizations).toHaveBeenCalledWith(
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
    expect(deps.statsd.increment).toHaveBeenCalledWith(
      'accountAuthorization.deauthorized',
      { client_type: 'native' }
    );
  });

  it('reads the rows before the refresh tokens', async () => {
    // Not in parallel: an authorization committing between the two must show up
    // as a refresh token with no row (inert) rather than a row whose sustaining
    // refresh token we missed (deauthorizes what the user just granted).
    const order: string[] = [];
    const db = mockDb({
      listAccountConsentsByUid: jest.fn().mockImplementation(async () => {
        order.push('rows');
        return [];
      }),
      getRefreshTokenScopesByUid: jest.fn().mockImplementation(async () => {
        order.push('tokens');
        return [];
      }),
    });

    await deauthorizeOnDisconnect(mockDeps(db), destroyed);

    expect(order).toEqual(['rows', 'tokens']);
  });

  it('tags a non-native client as other', async () => {
    const db = mockDb({
      listAccountConsentsByUid: jest.fn().mockResolvedValue([
        {
          scope: 'profile',
          service: '',
          clientId: Buffer.from(WEB_RP, 'hex'),
          lastAuthorizedTosAt: String(TOS_AT),
        },
      ]),
    });
    const deps = mockDeps(db);

    await deauthorizeOnDisconnect(deps, { uid: UID, clientId: WEB_RP });

    expect(deps.statsd.increment).toHaveBeenCalledWith(
      'accountAuthorization.deauthorized',
      { client_type: 'other' }
    );
  });

  it('tags a disconnect with no clientId as unknown', async () => {
    const deps = mockDeps(mockDb());

    await deauthorizeOnDisconnect(deps, { uid: UID });

    expect(deps.statsd.increment).toHaveBeenCalledWith(
      'accountAuthorization.deauthorized',
      { client_type: 'unknown' }
    );
  });

  it('counts a no-op when the deauthorize matched nothing', async () => {
    // The optimistic guard dropped the row: it was re-authorized between the
    // read and the write.
    const db = mockDb({
      deauthorizeAccountAuthorizations: jest.fn().mockResolvedValue(0),
    });
    const deps = mockDeps(db);

    await deauthorizeOnDisconnect(deps, destroyed);

    expect(deps.statsd.increment).toHaveBeenCalledWith(
      'accountAuthorization.deauthorize_noop',
      { client_type: 'native' }
    );
  });

  it('does not touch the db when uid is absent', async () => {
    const db = mockDb();

    await deauthorizeOnDisconnect(mockDeps(db), { uid: '' });

    expect(db.listAccountConsentsByUid).not.toHaveBeenCalled();
    expect(db.deauthorizeAccountAuthorizations).not.toHaveBeenCalled();
  });

  it('counts a row whose scope will not parse', async () => {
    const db = mockDb({
      listAccountConsentsByUid: jest.fn().mockResolvedValue([
        {
          scope: '',
          service: 'vpn',
          clientId: Buffer.from(FENIX, 'hex'),
          lastAuthorizedTosAt: String(TOS_AT),
        },
      ]),
      getRefreshTokenScopesByUid: jest.fn().mockResolvedValue([
        {
          clientId: Buffer.from(FENIX, 'hex'),
          scope: ScopeSet.fromArray([VPN_SCOPE]),
        },
      ]),
    });
    const deps = mockDeps(db);

    await deauthorizeOnDisconnect(deps, destroyed);

    expect(deps.statsd.increment).toHaveBeenCalledWith(
      'accountAuthorization.unparsable_scope',
      { client_type: 'native' }
    );
  });

  describe('when the first attempt fails', () => {
    it('retries once and deauthorizes on the second attempt', async () => {
      const db = mockDb({
        listAccountConsentsByUid: jest
          .fn()
          .mockRejectedValueOnce(new Error('deadlock'))
          .mockResolvedValue([
            {
              scope: VPN_SCOPE,
              service: 'vpn',
              clientId: Buffer.from(FENIX, 'hex'),
              lastAuthorizedTosAt: String(TOS_AT),
            },
          ]),
      });
      const deps = mockDeps(db);

      await deauthorizeOnDisconnect(deps, destroyed);

      expect(db.deauthorizeAccountAuthorizations).toHaveBeenCalledTimes(1);
      expect(deps.statsd.increment).toHaveBeenCalledWith(
        'accountAuthorization.deauthorize_retried',
        { client_type: 'native' }
      );
    });

    it('re-reads on the retry rather than replaying a stale decision', async () => {
      const db = mockDb({
        getRefreshTokenScopesByUid: jest
          .fn()
          .mockRejectedValueOnce(new Error('deadlock'))
          .mockResolvedValue([]),
      });

      await deauthorizeOnDisconnect(mockDeps(db), destroyed);

      expect(db.listAccountConsentsByUid).toHaveBeenCalledTimes(2);
    });

    it('does not count a failure when the retry succeeds', async () => {
      const db = mockDb({
        listAccountConsentsByUid: jest
          .fn()
          .mockRejectedValueOnce(new Error('deadlock'))
          .mockResolvedValue([]),
      });
      const deps = mockDeps(db);

      await deauthorizeOnDisconnect(deps, destroyed);

      expect(deps.statsd.increment).not.toHaveBeenCalledWith(
        'accountAuthorization.deauthorize_failed',
        expect.anything()
      );
      expect(deps.log.warn).not.toHaveBeenCalled();
    });
  });

  describe('when the db keeps failing', () => {
    const failing = () =>
      mockDb({
        listAccountConsentsByUid: jest
          .fn()
          .mockRejectedValue(new Error('ECONNREFUSED')),
      });

    it('does not reject, so the disconnect still succeeds', async () => {
      await expect(
        deauthorizeOnDisconnect(mockDeps(failing()), destroyed)
      ).resolves.toBeUndefined();
    });

    it('gives up after two attempts', async () => {
      const db = failing();

      await deauthorizeOnDisconnect(mockDeps(db), destroyed);

      expect(db.listAccountConsentsByUid).toHaveBeenCalledTimes(2);
    });

    it('counts the failure', async () => {
      const deps = mockDeps(failing());

      await deauthorizeOnDisconnect(deps, destroyed);

      expect(deps.statsd.increment).toHaveBeenCalledWith(
        'accountAuthorization.deauthorize_failed',
        { client_type: 'native' }
      );
    });

    it('logs the error message only, never the error object', async () => {
      const deps = mockDeps(failing());

      await deauthorizeOnDisconnect(deps, destroyed);

      expect(deps.log.warn).toHaveBeenCalledWith(
        'accountAuthorization.deauthorize_failed',
        { err: 'ECONNREFUSED' }
      );
    });

    it('stringifies a non-Error rejection', async () => {
      const deps = mockDeps(
        mockDb({
          listAccountConsentsByUid: jest.fn().mockRejectedValue('boom'),
        })
      );

      await deauthorizeOnDisconnect(deps, destroyed);

      expect(deps.log.warn).toHaveBeenCalledWith(
        'accountAuthorization.deauthorize_failed',
        { err: 'boom' }
      );
    });
  });

  describe('without optional collaborators', () => {
    it('still deauthorizes when statsd and log are absent', async () => {
      const db = mockDb();

      await deauthorizeOnDisconnect({ oauthDB: db }, destroyed);

      expect(db.deauthorizeAccountAuthorizations).toHaveBeenCalled();
    });

    it('swallows a db failure when statsd and log are absent', async () => {
      const db = mockDb({
        listAccountConsentsByUid: jest
          .fn()
          .mockRejectedValue(new Error('ECONNREFUSED')),
      });

      await expect(
        deauthorizeOnDisconnect({ oauthDB: db }, destroyed)
      ).resolves.toBeUndefined();
    });
  });
});
