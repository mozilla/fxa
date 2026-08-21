/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// The revocation policy itself lives in @fxa/accounts/oauth and is tested there
// (consent-revocation.spec.ts). This file covers the orchestration around it:
// the gate, read ordering, metrics, retry, and error swallowing.
import { OAuthNativeClients } from '@fxa/accounts/oauth';
import ScopeSet from 'fxa-shared/oauth/scopes';

import {
  revokeConsentsOnDisconnect,
  RevokeConsentsOnDisconnectOauthDB,
} from './revoke-consents-on-disconnect';

const UID = 'a'.repeat(32);
const DESKTOP = OAuthNativeClients.FirefoxDesktop;
const FENIX = OAuthNativeClients.Fenix;
const WEB_RP = '98e6508e88680e1b'; // arbitrary non-native web RP (no enum)

const VPN_SCOPE = 'https://identity.mozilla.com/apps/vpn';

function mockDb(
  over: Partial<jest.Mocked<RevokeConsentsOnDisconnectOauthDB>> = {}
): jest.Mocked<RevokeConsentsOnDisconnectOauthDB> {
  return {
    listAccountConsentsByUid: jest.fn().mockResolvedValue([
      {
        scope: VPN_SCOPE,
        service: 'vpn',
        clientId: Buffer.from(DESKTOP, 'hex'),
        lastAuthorizedTosAt: '1700000000000',
      },
    ]),
    getRefreshTokenScopesByUid: jest.fn().mockResolvedValue([]),
    deleteAccountConsentRows: jest.fn().mockResolvedValue(1),
    ...over,
  } as jest.Mocked<RevokeConsentsOnDisconnectOauthDB>;
}

function mockDeps(db: jest.Mocked<RevokeConsentsOnDisconnectOauthDB>) {
  return {
    oauthDB: db,
    statsd: { increment: jest.fn() },
    log: { warn: jest.fn() },
  };
}

describe('revokeConsentsOnDisconnect', () => {
  // A refresh-token disconnect of the row's own client, with no session left.
  const destroyed = {
    uid: UID,
    clientId: DESKTOP,
    destroyedRefreshTokens: 1,
    remainingSessions: 0,
  };

  it('deletes the rows nothing sustains, normalizing the buffer clientId', async () => {
    const db = mockDb();
    const deps = mockDeps(db);

    await revokeConsentsOnDisconnect(deps, destroyed);

    expect(db.deleteAccountConsentRows).toHaveBeenCalledWith(UID, [
      {
        scope: VPN_SCOPE,
        service: 'vpn',
        clientId: DESKTOP,
        lastAuthorizedTosAt: 1_700_000_000_000,
      },
    ]);
    expect(deps.statsd.increment).toHaveBeenCalledWith(
      'accountAuthorization.revoked',
      { client_type: 'native' }
    );
  });

  it('deletes even when another client holds a covering token', async () => {
    // Consent is the row owner's, so a Fenix token does not sustain Desktop's
    // row. Fenix simply re-consents on its next exchange.
    const db = mockDb({
      getRefreshTokenScopesByUid: jest.fn().mockResolvedValue([
        {
          clientId: Buffer.from(FENIX, 'hex'),
          scope: ScopeSet.fromArray([VPN_SCOPE]),
        },
      ]),
    });
    const deps = mockDeps(db);

    await revokeConsentsOnDisconnect(deps, destroyed);

    expect(db.deleteAccountConsentRows).toHaveBeenCalled();
    expect(deps.statsd.increment).toHaveBeenCalledWith(
      'accountAuthorization.revoked',
      { client_type: 'native' }
    );
  });

  it('does not delete while the row owner still holds a covering token', async () => {
    const db = mockDb({
      getRefreshTokenScopesByUid: jest.fn().mockResolvedValue([
        {
          clientId: Buffer.from(DESKTOP, 'hex'),
          scope: ScopeSet.fromArray([VPN_SCOPE]),
        },
      ]),
    });
    const deps = mockDeps(db);

    await revokeConsentsOnDisconnect(deps, destroyed);

    expect(db.deleteAccountConsentRows).not.toHaveBeenCalled();
    expect(deps.statsd.increment).toHaveBeenCalledWith(
      'accountAuthorization.revoke_noop',
      { client_type: 'native' }
    );
  });

  it('still evaluates when the destroy removed no refresh token', async () => {
    // No longer a gate: the policy decides, so a session-backed client is
    // protected by its session rather than by skipping the read.
    const db = mockDb();
    const deps = mockDeps(db);

    await revokeConsentsOnDisconnect(deps, {
      ...destroyed,
      destroyedRefreshTokens: 0,
      remainingSessions: 1,
    });

    expect(db.listAccountConsentsByUid).toHaveBeenCalled();
    expect(db.deleteAccountConsentRows).not.toHaveBeenCalled();
    expect(deps.statsd.increment).toHaveBeenCalledWith(
      'accountAuthorization.revoke_noop',
      { client_type: 'native' }
    );
  });

  it('tags a disconnect with no clientId as a session sign-out', async () => {
    const db = mockDb();
    const deps = mockDeps(db);

    await revokeConsentsOnDisconnect(deps, { uid: UID, remainingSessions: 0 });

    expect(deps.statsd.increment).toHaveBeenCalledWith(
      'accountAuthorization.revoked',
      { client_type: 'session' }
    );
  });

  it('does not touch the db when uid is absent', async () => {
    const db = mockDb();
    const deps = mockDeps(db);

    await revokeConsentsOnDisconnect(deps, {
      uid: '',
      clientId: DESKTOP,
      destroyedRefreshTokens: 1,
    });

    expect(db.listAccountConsentsByUid).not.toHaveBeenCalled();
    expect(deps.statsd.increment).not.toHaveBeenCalled();
  });

  it('counts a no-op when the delete matched nothing', async () => {
    // The optimistic lastAuthorizedTosAt guard rejected the row because a
    // concurrent authorization re-earned it.
    const db = mockDb({
      deleteAccountConsentRows: jest.fn().mockResolvedValue(0),
    });
    const deps = mockDeps(db);

    await revokeConsentsOnDisconnect(deps, destroyed);

    expect(deps.statsd.increment).toHaveBeenCalledWith(
      'accountAuthorization.revoke_noop',
      { client_type: 'native' }
    );
  });

  it('tags a non-native client as other', async () => {
    const db = mockDb({
      listAccountConsentsByUid: jest.fn().mockResolvedValue([
        {
          scope: 'profile',
          service: '',
          clientId: Buffer.from(WEB_RP, 'hex'),
          lastAuthorizedTosAt: 1,
        },
      ]),
    });
    const deps = mockDeps(db);

    await revokeConsentsOnDisconnect(deps, {
      uid: UID,
      clientId: WEB_RP,
      destroyedRefreshTokens: 1,
      remainingSessions: 0,
    });

    expect(deps.statsd.increment).toHaveBeenCalledWith(
      'accountAuthorization.revoked',
      { client_type: 'other' }
    );
  });

  describe('signing out a session', () => {
    const signedOut = { uid: UID, remainingSessions: 0 };

    it('revokes the rows of a session-backed client', async () => {
      const db = mockDb();
      const deps = mockDeps(db);

      await revokeConsentsOnDisconnect(deps, signedOut);

      expect(db.deleteAccountConsentRows).toHaveBeenCalledWith(UID, [
        {
          scope: VPN_SCOPE,
          service: 'vpn',
          clientId: DESKTOP,
          lastAuthorizedTosAt: 1_700_000_000_000,
        },
      ]);
      expect(deps.statsd.increment).toHaveBeenCalledWith(
        'accountAuthorization.revoked',
        { client_type: 'session' }
      );
    });

    it('keeps the rows when the session count is unknown', async () => {
      // Callers with no fxa-db handle omit it; that must not revoke.
      const db = mockDb();
      const deps = mockDeps(db);

      await revokeConsentsOnDisconnect(deps, { uid: UID });

      expect(db.deleteAccountConsentRows).not.toHaveBeenCalled();
    });

    it('counts a no-op when another session sustains the rows', async () => {
      const db = mockDb();
      const deps = mockDeps(db);

      await revokeConsentsOnDisconnect(deps, {
        ...signedOut,
        remainingSessions: 1,
      });

      expect(db.deleteAccountConsentRows).not.toHaveBeenCalled();
      expect(deps.statsd.increment).toHaveBeenCalledWith(
        'accountAuthorization.revoke_noop',
        { client_type: 'session' }
      );
    });

    it('does not touch the db when uid is absent', async () => {
      const db = mockDb();
      const deps = mockDeps(db);

      await revokeConsentsOnDisconnect(deps, { ...signedOut, uid: '' });

      expect(db.listAccountConsentsByUid).not.toHaveBeenCalled();
      expect(deps.statsd.increment).not.toHaveBeenCalled();
    });
  });

  describe('when the first attempt fails', () => {
    it('retries once and revokes on the second attempt', async () => {
      const db = mockDb();
      db.deleteAccountConsentRows
        .mockRejectedValueOnce(new Error('connection reset'))
        .mockResolvedValueOnce(2);
      const deps = mockDeps(db);

      await revokeConsentsOnDisconnect(deps, destroyed);

      expect(db.deleteAccountConsentRows).toHaveBeenCalledTimes(2);
      expect(deps.statsd.increment).toHaveBeenCalledWith(
        'accountAuthorization.revoke_retried',
        { client_type: 'native' }
      );
      expect(deps.statsd.increment).toHaveBeenCalledWith(
        'accountAuthorization.revoked',
        { client_type: 'native' }
      );
    });

    it('re-reads on the retry rather than replaying a stale decision', async () => {
      const db = mockDb();
      db.deleteAccountConsentRows
        .mockRejectedValueOnce(new Error('connection reset'))
        .mockResolvedValueOnce(1);
      const deps = mockDeps(db);

      await revokeConsentsOnDisconnect(deps, destroyed);

      expect(db.listAccountConsentsByUid).toHaveBeenCalledTimes(2);
      expect(db.getRefreshTokenScopesByUid).toHaveBeenCalledTimes(2);
    });

    it('does not count a failure when the retry succeeds', async () => {
      const db = mockDb();
      db.deleteAccountConsentRows
        .mockRejectedValueOnce(new Error('connection reset'))
        .mockResolvedValueOnce(1);
      const deps = mockDeps(db);

      await revokeConsentsOnDisconnect(deps, destroyed);

      expect(deps.statsd.increment).not.toHaveBeenCalledWith(
        'accountAuthorization.revoke_failed',
        expect.anything()
      );
      expect(deps.log.warn).not.toHaveBeenCalled();
    });
  });

  describe('when the db fails', () => {
    const failing = () =>
      mockDb({
        listAccountConsentsByUid: jest
          .fn()
          .mockRejectedValue(new Error('ECONNREFUSED')),
      });

    it('does not reject, so the disconnect still succeeds', async () => {
      const deps = mockDeps(failing());

      await expect(
        revokeConsentsOnDisconnect(deps, destroyed)
      ).resolves.toBeUndefined();
    });

    it('gives up after two attempts', async () => {
      const db = failing();
      const deps = mockDeps(db);

      await revokeConsentsOnDisconnect(deps, destroyed);

      expect(db.listAccountConsentsByUid).toHaveBeenCalledTimes(2);
    });

    it('counts the failure', async () => {
      const deps = mockDeps(failing());

      await revokeConsentsOnDisconnect(deps, destroyed);

      expect(deps.statsd.increment).toHaveBeenCalledWith(
        'accountAuthorization.revoke_failed',
        { client_type: 'native' }
      );
    });

    it('logs the error message only, never the error object', async () => {
      const deps = mockDeps(failing());

      await revokeConsentsOnDisconnect(deps, destroyed);

      expect(deps.log.warn).toHaveBeenCalledWith(
        'accountAuthorization.revoke_failed',
        { err: 'ECONNREFUSED' }
      );
    });

    it('stringifies a non-Error rejection', async () => {
      const deps = mockDeps(
        mockDb({
          listAccountConsentsByUid: jest
            .fn()
            .mockRejectedValue('pool exhausted'),
        })
      );

      await revokeConsentsOnDisconnect(deps, destroyed);

      expect(deps.log.warn).toHaveBeenCalledWith(
        'accountAuthorization.revoke_failed',
        { err: 'pool exhausted' }
      );
    });
  });

  describe('without optional collaborators', () => {
    it('still revokes when statsd and log are absent', async () => {
      const db = mockDb();

      await revokeConsentsOnDisconnect({ oauthDB: db }, destroyed);

      expect(db.deleteAccountConsentRows).toHaveBeenCalled();
    });

    it('swallows a db failure when statsd and log are absent', async () => {
      const db = mockDb({
        listAccountConsentsByUid: jest
          .fn()
          .mockRejectedValue(new Error('ECONNREFUSED')),
      });

      await expect(
        revokeConsentsOnDisconnect({ oauthDB: db }, destroyed)
      ).resolves.toBeUndefined();
    });
  });
});
