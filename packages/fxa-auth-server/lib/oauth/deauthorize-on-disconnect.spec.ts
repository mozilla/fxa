/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// The deauthorization rule itself lives in @fxa/accounts/oauth and is tested
// there (deauthorization.spec.ts). This file covers the orchestration around
// it: the gate, read ordering, metrics, the single retry, and error swallowing.
import { OAuthNativeClients } from '@fxa/accounts/oauth';
import { StatsD } from 'hot-shots';
import { Container } from 'typedi';

import { AuthLogger } from '../types';
import {
  deauthorizeOnDisconnect,
  DeauthorizeOnDisconnectOauthDB,
} from './deauthorize-on-disconnect';

const UID = 'a'.repeat(32);
const FENIX = OAuthNativeClients.Fenix;
const WEB_RP = '98e6508e88680e1b'; // arbitrary non-native web RP (no enum)

const VPN_SCOPE = 'https://identity.mozilla.com/apps/vpn';
const TOS_AT = 1_700_000_000_000;
const NOW = 1_800_000_000_000;

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
        deauthorizedAt: null,
      },
    ]),
    getRefreshTokenScopesByUid: jest.fn().mockResolvedValue([]),
    allowedClientsForService: jest.fn().mockReturnValue(undefined),
    deauthorizeAccountAuthorizations: jest.fn().mockResolvedValue(1),
    ...over,
  } satisfies jest.Mocked<DeauthorizeOnDisconnectOauthDB>;
}

const consentsOf = (clientId: string) =>
  jest.fn().mockResolvedValue([
    {
      scope: VPN_SCOPE,
      service: 'vpn',
      clientId: Buffer.from(clientId, 'hex'),
      lastAuthorizedTosAt: String(TOS_AT),
      deauthorizedAt: null,
    },
  ]);

function mockDeps(db: jest.Mocked<DeauthorizeOnDisconnectOauthDB>) {
  return {
    oauthDB: db,
    statsd: { increment: jest.fn() },
    log: { warn: jest.fn() },
  };
}

describe('deauthorizeOnDisconnect', () => {
  const destroyed = { uid: UID, clientId: FENIX };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
    Container.reset();
  });

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
      NOW
    );
  });

  it('ignores rows already deauthorized', async () => {
    const db = mockDb({
      listAccountConsentsByUid: jest.fn().mockResolvedValue([
        {
          scope: VPN_SCOPE,
          service: 'vpn',
          clientId: Buffer.from(FENIX, 'hex'),
          lastAuthorizedTosAt: String(TOS_AT),
          deauthorizedAt: String(TOS_AT + 1),
        },
      ]),
    });
    const deps = mockDeps(db);

    await deauthorizeOnDisconnect(deps, destroyed);

    expect(db.deauthorizeAccountAuthorizations).not.toHaveBeenCalled();
    expect(deps.statsd.increment).toHaveBeenCalledWith(
      'accountAuthorization.deauthorize_noop',
      { client_type: 'native' }
    );
  });

  it('consults the row’s service allowlist when judging it', async () => {
    const db = mockDb({
      getRefreshTokenScopesByUid: jest.fn().mockResolvedValue([
        {
          clientId: Buffer.from(WEB_RP, 'hex'),
          scope: { contains: () => true },
        },
      ]),
      allowedClientsForService: jest.fn().mockReturnValue(new Set([WEB_RP])),
    });
    const deps = mockDeps(db);

    await deauthorizeOnDisconnect(deps, destroyed);

    expect(db.allowedClientsForService).toHaveBeenCalledWith('vpn');
    expect(db.deauthorizeAccountAuthorizations).not.toHaveBeenCalled();
    expect(deps.statsd.increment).toHaveBeenCalledWith(
      'accountAuthorization.deauthorize_noop',
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

  it.each([
    ['native', FENIX],
    ['other', WEB_RP],
  ])('tags the metric %s for client %s', async (client_type, clientId) => {
    const deps = mockDeps(
      mockDb({ listAccountConsentsByUid: consentsOf(clientId) })
    );

    await deauthorizeOnDisconnect(deps, { uid: UID, clientId });

    expect(deps.statsd.increment).toHaveBeenCalledWith(
      'accountAuthorization.deauthorized',
      { client_type }
    );
  });

  it('does nothing when the caller removed no client’s tokens', async () => {
    // devices.js leaves clientId unset when the refresh token was already gone.
    const db = mockDb();
    const deps = mockDeps(db);

    await deauthorizeOnDisconnect(deps, { uid: UID });

    expect(db.listAccountConsentsByUid).not.toHaveBeenCalled();
    expect(deps.statsd.increment).toHaveBeenCalledWith(
      'accountAuthorization.deauthorize_noop',
      { client_type: 'unknown' }
    );
  });

  it('skips the write when the disconnect could not have sustained any row', async () => {
    // The web RP's own token went away some other way — a password reset, say.
    // Disconnecting Fenix is not the event that withdraws it.
    const db = mockDb({ listAccountConsentsByUid: consentsOf(WEB_RP) });
    const deps = mockDeps(db);

    await deauthorizeOnDisconnect(deps, destroyed);

    expect(db.deauthorizeAccountAuthorizations).not.toHaveBeenCalled();
    expect(deps.statsd.increment).toHaveBeenCalledWith(
      'accountAuthorization.deauthorize_noop',
      { client_type: 'native' }
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

    it('retries once when the write rejects', async () => {
      const db = mockDb({
        deauthorizeAccountAuthorizations: jest
          .fn()
          .mockRejectedValueOnce(new Error('deadlock'))
          .mockResolvedValue(1),
      });
      const deps = mockDeps(db);

      await deauthorizeOnDisconnect(deps, destroyed);

      expect(db.listAccountConsentsByUid).toHaveBeenCalledTimes(2);
      expect(db.deauthorizeAccountAuthorizations).toHaveBeenCalledTimes(2);
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
        { client_type: 'native' }
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

    it('gives up after two attempts without rejecting', async () => {
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

    it('counts the failure when the write keeps rejecting', async () => {
      const deps = mockDeps(
        mockDb({
          deauthorizeAccountAuthorizations: jest
            .fn()
            .mockRejectedValue(new Error('deadlock')),
        })
      );

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

  describe('without injected collaborators', () => {
    const failing = () =>
      mockDb({
        listAccountConsentsByUid: jest
          .fn()
          .mockRejectedValue(new Error('ECONNREFUSED')),
      });

    it('resolves statsd and the logger from the container', async () => {
      // The production callers pass only oauthDB.
      const statsd = { increment: jest.fn() };
      const log = { warn: jest.fn() };
      Container.set(StatsD, statsd as unknown as StatsD);
      Container.set(AuthLogger, log as unknown as AuthLogger);

      await deauthorizeOnDisconnect({ oauthDB: failing() }, destroyed);

      expect(statsd.increment).toHaveBeenCalledWith(
        'accountAuthorization.deauthorize_failed',
        { client_type: 'native' }
      );
      expect(log.warn).toHaveBeenCalledWith(
        'accountAuthorization.deauthorize_failed',
        { err: 'ECONNREFUSED' }
      );
    });

    it('swallows a db failure when the container has neither', async () => {
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
